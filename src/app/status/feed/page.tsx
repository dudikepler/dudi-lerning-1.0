import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: connections } = await supabase
    .from("wa_connections")
    .select("id")
    .eq("user_id", user!.id);

  const connectionIds = (connections ?? []).map((c) => c.id);

  if (connectionIds.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">אין עדיין פיד</h1>
        <p className="mt-2 text-foreground/70">חברו קודם את הוואטסאפ שלכם.</p>
        <Link
          href="/status/connect"
          className="mt-6 rounded-full bg-gold px-6 py-2.5 font-semibold text-black transition hover:bg-gold-soft"
        >
          חיבור לוואטסאפ
        </Link>
      </div>
    );
  }

  const { data: statuses } = await supabase
    .from("wa_statuses")
    .select("id, media_type, media_path, caption, posted_at, wa_contacts(display_name, wa_jid)")
    .in("connection_id", connectionIds)
    .gt("expires_at", new Date().toISOString())
    .order("posted_at", { ascending: false });

  const paths = (statuses ?? [])
    .map((s) => s.media_path)
    .filter((p): p is string => Boolean(p));

  let signedUrlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("wa-status-media")
      .createSignedUrls(paths, 60 * 60);
    signedUrlByPath = new Map(
      (signed ?? [])
        .filter((s) => s.signedUrl)
        .map((s) => [s.path ?? "", s.signedUrl as string]),
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">הפיד שלי</h1>
        <Link href="/status/contacts" className="text-sm text-gold-soft hover:underline">
          עריכת אנשי קשר
        </Link>
      </div>

      {(!statuses || statuses.length === 0) && (
        <p className="mt-8 text-foreground/60">
          אין כרגע עדכוני סטטוס פעילים מאנשי הקשר שבחרתם.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(statuses ?? []).map((status) => {
          const contact = Array.isArray(status.wa_contacts) ? status.wa_contacts[0] : status.wa_contacts;
          const url = status.media_path ? signedUrlByPath.get(status.media_path) : undefined;
          return (
            <article key={status.id} className="overflow-hidden rounded-2xl border border-gold/20 bg-panel">
              {status.media_type === "image" && url && (
                <Image
                  src={url}
                  alt={status.caption ?? "סטטוס"}
                  width={400}
                  height={400}
                  unoptimized
                  className="h-56 w-full object-cover"
                />
              )}
              {status.media_type === "video" && url && (
                <video src={url} controls className="h-56 w-full object-cover" />
              )}
              <div className="p-4">
                <p className="text-sm font-semibold text-gold-soft">
                  {contact?.display_name || contact?.wa_jid}
                </p>
                {status.caption && <p className="mt-1 text-sm">{status.caption}</p>}
                <p className="mt-2 text-xs text-foreground/50">
                  {new Date(status.posted_at).toLocaleString("he-IL")}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
