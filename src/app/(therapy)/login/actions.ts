"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginSchema } from "@/lib/validation";
import { ensureTherapistRow } from "@/lib/auth/ensure-therapist";
import { isAdminEmail } from "@/lib/auth/admin-emails";

export type LoginState = { error?: string } | undefined;

export async function loginTherapist(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "שגיאה בטופס" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "אימייל או סיסמה שגויים" };
  }

  if (data.user) {
    await ensureTherapistRow(data.user);
  }

  redirect(isAdminEmail(data.user?.email) ? "/admin" : "/dashboard");
}
