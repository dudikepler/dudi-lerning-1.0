import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import type { Therapist } from "@/lib/types";

export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentTherapist = cache(async (): Promise<Therapist | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("therapists")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
});

export const isAdminUser = cache(async () => {
  const user = await getSessionUser();
  return isAdminEmail(user?.email);
});

/** Redirects non-admins away. Call at the top of every /admin page and action. */
export async function requireAdmin() {
  const ok = await isAdminUser();
  if (!ok) redirect("/login");
}

/** Redirects signed-out visitors away. Call at the top of every /dashboard page and action. */
export async function requireTherapistUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
