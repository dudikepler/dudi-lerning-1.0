"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createConnection } from "../actions";

type Connection = {
  id: string;
  status: "pending" | "qr_ready" | "connected" | "disconnected" | "error";
  qr_code: string | null;
  error_message: string | null;
};

const STATUS_LABEL: Record<Connection["status"], string> = {
  pending: "מתחיל חיבור...",
  qr_ready: "סרקו את הקוד עם וואטסאפ",
  connected: "מחובר!",
  disconnected: "מנותק",
  error: "אירעה שגיאה",
};

export function ConnectFlow({ initialConnection }: { initialConnection: Connection | null }) {
  const [connection, setConnection] = useState<Connection | null>(initialConnection);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!connection?.id || connection.status === "connected") return;

    const supabase = createClient();
    const channel = supabase
      .channel(`wa_connection_${connection.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wa_connections",
          filter: `id=eq.${connection.id}`,
        },
        (payload) => {
          setConnection(payload.new as Connection);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connection?.id, connection?.status]);

  useEffect(() => {
    if (connection?.status === "connected") {
      const timeout = setTimeout(() => router.push("/status/contacts"), 1200);
      return () => clearTimeout(timeout);
    }
  }, [connection?.status, router]);

  function handleConnect() {
    setFormError(null);
    startTransition(async () => {
      const result = await createConnection();
      if ("error" in result) {
        setFormError(result.error);
        return;
      }
      setConnection({ id: result.connectionId, status: "pending", qr_code: null, error_message: null });
    });
  }

  if (!connection) {
    return (
      <div className="mt-8">
        {formError && <p className="mb-4 text-sm text-red-400">{formError}</p>}
        <button
          onClick={handleConnect}
          disabled={pending}
          className="rounded-full bg-gold px-8 py-3 font-semibold text-black transition hover:bg-gold-soft disabled:opacity-60"
        >
          {pending ? "מתחיל..." : "התחברות לוואטסאפ"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {connection.status === "qr_ready" && connection.qr_code && (
        <div className="rounded-xl bg-white p-4">
          <Image
            src={connection.qr_code}
            alt="קוד QR להתחברות"
            width={256}
            height={256}
            unoptimized
          />
        </div>
      )}
      <p className="font-semibold text-gold-soft">{STATUS_LABEL[connection.status]}</p>
      {connection.status === "error" && connection.error_message && (
        <p className="text-sm text-red-400">{connection.error_message}</p>
      )}
      {(connection.status === "error" || connection.status === "disconnected") && (
        <button
          onClick={handleConnect}
          disabled={pending}
          className="rounded-full border border-gold/40 px-6 py-2.5 font-semibold transition hover:border-gold disabled:opacity-60"
        >
          נסה שוב
        </button>
      )}
    </div>
  );
}
