import "server-only";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

/**
 * Creates the therapist row for a freshly signed-up/confirmed user, if it
 * doesn't exist yet. user_id and status are forced by DB triggers, so this
 * only ever needs to supply the display fields.
 */
export async function ensureTherapistRow(user: User) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return;

  const meta = (user.user_metadata ?? {}) as {
    full_name?: string;
    title?: string;
  };
  const fullName = meta.full_name?.trim() || user.email || "מטפל";
  const title = meta.title?.trim() || "";

  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.from("therapists").insert({
      slug: slugify(fullName),
      full_name: fullName,
      title,
    });
    if (!error) return;
    if (error.code !== "23505") throw error;
  }
}
