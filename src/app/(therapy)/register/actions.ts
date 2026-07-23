"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterSchema } from "@/lib/validation";
import { ensureTherapistRow } from "@/lib/auth/ensure-therapist";
import { isAdminEmail } from "@/lib/auth/admin-emails";

export type RegisterState = { error?: string; success?: boolean } | undefined;

export async function registerTherapist(
  _state: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "שגיאה בטופס" };
  }

  const { fullName, email, password, title } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, title } },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session && data.user) {
    await ensureTherapistRow(data.user);
    redirect(isAdminEmail(data.user.email) ? "/admin" : "/dashboard");
  }

  return { success: true };
}
