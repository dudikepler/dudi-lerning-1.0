import path from "node:path";
import { rm } from "node:fs/promises";
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  downloadMediaMessage,
  type WASocket,
  type WAMessage,
  type Contact,
} from "baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import QRCode from "qrcode";
import { env } from "./env.js";
import { supabase } from "./supabase.js";

const STATUS_JID = "status@broadcast";
const STATUS_TTL_MS = 24 * 60 * 60 * 1000;

const logger = pino({ level: "warn" });

type Session = { sock: WASocket; userId: string };
const sessions = new Map<string, Session>();

function authDirFor(connectionId: string) {
  return path.join(env.authDir, connectionId);
}

export async function startConnection(connectionId: string) {
  if (sessions.has(connectionId)) return;

  const { data: connection } = await supabase
    .from("wa_connections")
    .select("id, user_id")
    .eq("id", connectionId)
    .single();

  if (!connection) {
    throw new Error(`Unknown connection ${connectionId}`);
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDirFor(connectionId));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    logger,
    syncFullHistory: false,
  });

  sessions.set(connectionId, { sock, userId: connection.user_id });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection: state, qr, lastDisconnect } = update;

    if (qr) {
      const qrDataUrl = await QRCode.toDataURL(qr);
      await supabase
        .from("wa_connections")
        .update({ status: "qr_ready", qr_code: qrDataUrl, error_message: null })
        .eq("id", connectionId);
    }

    if (state === "open") {
      await supabase
        .from("wa_connections")
        .update({
          status: "connected",
          qr_code: null,
          error_message: null,
          phone_number: sock.user?.id ?? null,
        })
        .eq("id", connectionId);
    }

    if (state === "close") {
      sessions.delete(connectionId);
      const statusCode = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      if (loggedOut) {
        await rm(authDirFor(connectionId), { recursive: true, force: true });
        await supabase
          .from("wa_connections")
          .update({ status: "disconnected", qr_code: null })
          .eq("id", connectionId);
        return;
      }

      await supabase
        .from("wa_connections")
        .update({ status: "error", error_message: "החיבור נותק, מנסה להתחבר מחדש" })
        .eq("id", connectionId);

      setTimeout(() => {
        startConnection(connectionId).catch((err) =>
          logger.error({ err, connectionId }, "reconnect failed"),
        );
      }, 5000);
    }
  });

  sock.ev.on("messaging-history.set", ({ contacts }) => {
    void upsertContacts(connectionId, contacts);
  });

  sock.ev.on("contacts.upsert", (contacts) => {
    void upsertContacts(connectionId, contacts);
  });

  sock.ev.on("messages.upsert", ({ messages }) => {
    void handleMessages(connectionId, connection.user_id, messages);
  });
}

export function stopConnection(connectionId: string) {
  const session = sessions.get(connectionId);
  if (!session) return;
  session.sock.end(undefined);
  sessions.delete(connectionId);
}

export async function resumeExistingConnections() {
  const { data: connections } = await supabase
    .from("wa_connections")
    .select("id")
    .eq("status", "connected");

  for (const connection of connections ?? []) {
    await startConnection(connection.id).catch((err) =>
      logger.error({ err, connectionId: connection.id }, "resume failed"),
    );
  }
}

// WhatsApp is mid-migration from phone-number JIDs (@s.whatsapp.net) to
// opaque "LID" JIDs (@lid). We standardize contacts on the phone-number
// form whenever one is known, since that's what's stable/recognizable.
function canonicalJid(contact: Partial<Contact>): string | null {
  if (contact.phoneNumber?.endsWith("@s.whatsapp.net")) return contact.phoneNumber;
  if (contact.id?.endsWith("@s.whatsapp.net")) return contact.id;
  return null;
}

async function upsertContacts(connectionId: string, contacts: Partial<Contact>[]) {
  const rows = contacts
    .map((c) => ({
      connection_id: connectionId,
      wa_jid: canonicalJid(c),
      display_name: c.name ?? c.notify ?? c.verifiedName ?? null,
    }))
    .filter((row): row is { connection_id: string; wa_jid: string; display_name: string } =>
      Boolean(row.wa_jid && row.display_name),
    );

  if (rows.length === 0) return;

  await supabase.from("wa_contacts").upsert(rows, { onConflict: "connection_id,wa_jid" });
}

async function handleMessages(connectionId: string, userId: string, messages: WAMessage[]) {
  for (const message of messages) {
    // Only ever look at WhatsApp Status broadcasts here -- regular chat
    // messages are intentionally ignored and never stored.
    if (message.key.remoteJid !== STATUS_JID || !message.message) continue;

    // The sender may show up as a phone-number JID or a LID, depending on
    // what WhatsApp sent for this message; try both against the contact we
    // stored (see canonicalJid above).
    const senderCandidates = [message.key.participant, message.key.participantAlt].filter(
      (jid): jid is string => Boolean(jid),
    );
    if (senderCandidates.length === 0) continue;

    const { data: contact } = await supabase
      .from("wa_contacts")
      .select("id, is_followed")
      .eq("connection_id", connectionId)
      .in("wa_jid", senderCandidates)
      .maybeSingle();

    if (!contact?.is_followed) continue;

    const content = message.message;
    const image = content.imageMessage;
    const video = content.videoMessage;
    const text = content.extendedTextMessage?.text ?? content.conversation;

    const mediaType = image ? "image" : video ? "video" : "text";
    const caption = image?.caption ?? video?.caption ?? text ?? null;
    const postedAt = new Date(Number(message.messageTimestamp) * 1000);
    const expiresAt = new Date(postedAt.getTime() + STATUS_TTL_MS);

    let mediaPath: string | null = null;
    if (image || video) {
      try {
        const buffer = (await downloadMediaMessage(message, "buffer", {})) as Buffer;
        const ext = image ? "jpg" : "mp4";
        mediaPath = `${userId}/${connectionId}/${message.key.id}.${ext}`;
        await supabase.storage
          .from("wa-status-media")
          .upload(mediaPath, buffer, {
            contentType: image ? "image/jpeg" : "video/mp4",
            upsert: true,
          });
      } catch (err) {
        logger.error({ err, messageId: message.key.id }, "media download failed");
        continue;
      }
    }

    await supabase.from("wa_statuses").upsert(
      {
        connection_id: connectionId,
        contact_id: contact.id,
        wa_message_id: message.key.id!,
        media_type: mediaType,
        media_path: mediaPath,
        caption,
        posted_at: postedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: "connection_id,wa_message_id" },
    );
  }
}
