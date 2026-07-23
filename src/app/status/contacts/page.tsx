import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContactsList } from "./ContactsList";

export default async function ContactsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: connection } = await supabase
    .from("wa_connections")
    .select("id, status")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!connection || connection.status !== "connected") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">עדיין אין חיבור פעיל</h1>
        <p className="mt-2 max-w-md text-foreground/70">
          כדי לבחור אנשי קשר, קודם צריך לחבר את הוואטסאפ שלכם.
        </p>
        <Link
          href="/status/connect"
          className="mt-6 rounded-full bg-gold px-6 py-2.5 font-semibold text-black transition hover:bg-gold-soft"
        >
          חיבור לוואטסאפ
        </Link>
      </div>
    );
  }

  const { data: contacts } = await supabase
    .from("wa_contacts")
    .select("id, wa_jid, display_name, is_followed")
    .eq("connection_id", connection.id)
    .order("display_name", { ascending: true });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-16">
      <h1 className="text-2xl font-bold">בחירת אנשי קשר</h1>
      <p className="mt-2 text-foreground/70">
        סמנו את מי שרוצים לעקוב אחרי הסטטוסים שלו. אפשר לשנות בכל זמן.
      </p>
      <ContactsList initialContacts={contacts ?? []} />
    </div>
  );
}
