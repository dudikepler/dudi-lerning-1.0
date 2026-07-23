"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Contact = {
  id: string;
  wa_jid: string;
  display_name: string | null;
  is_followed: boolean;
};

export function ContactsList({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [query, setQuery] = useState("");
  const supabase = useMemo(() => createClient(), []);

  const filtered = contacts.filter((c) =>
    (c.display_name ?? c.wa_jid).toLowerCase().includes(query.toLowerCase()),
  );

  async function toggle(id: string, next: boolean) {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, is_followed: next } : c)));
    const { error } = await supabase.from("wa_contacts").update({ is_followed: next }).eq("id", id);
    if (error) {
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, is_followed: !next } : c)));
    }
  }

  if (contacts.length === 0) {
    return (
      <p className="mt-8 text-foreground/60">
        עדיין אין אנשי קשר מסונכרנים. זה יכול לקחת דקה אחרי החיבור הראשוני.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="חיפוש איש קשר..."
        className="rounded-lg border border-gold/30 bg-background px-3 py-2 outline-none focus:border-gold"
      />
      <ul className="divide-y divide-gold/10 rounded-xl border border-gold/20">
        {filtered.map((contact) => (
          <li key={contact.id} className="flex items-center justify-between px-4 py-3">
            <span>{contact.display_name || contact.wa_jid}</span>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={contact.is_followed}
                onChange={(e) => toggle(contact.id, e.target.checked)}
                className="h-5 w-5 accent-[var(--gold)]"
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
