"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

export async function login(_prevState: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "נא למלא אימייל וסיסמה" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "אימייל או סיסמה שגויים" };
  }

  redirect("/status/feed");
}

export async function signup(_prevState: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8) {
    return { error: "נא למלא אימייל וסיסמה בת 8 תווים לפחות" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: "לא ניתן להירשם עם הפרטים האלה" };
  }

  if (!data.session) {
    return { message: "נשלח אליך מייל לאישור ההרשמה. אשר אותו כדי להתחבר." };
  }

  redirect("/status/connect");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/status/login");
}

export async function createConnection(): Promise<{ connectionId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/status/login");

  const { data: connection, error } = await supabase
    .from("wa_connections")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (error || !connection) {
    return { error: "שגיאה ביצירת חיבור חדש" };
  }

  const workerUrl = process.env.WORKER_URL;
  if (!workerUrl) {
    return { error: "שירות הוואטסאפ אינו מוגדר (חסר WORKER_URL)" };
  }

  try {
    const res = await fetch(`${workerUrl}/connections/${connection.id}/start`, {
      method: "POST",
      headers: { "x-api-key": process.env.WORKER_API_KEY ?? "" },
    });
    if (!res.ok) throw new Error(await res.text());
  } catch {
    await supabase
      .from("wa_connections")
      .update({ status: "error", error_message: "לא ניתן היה לפתוח חיבור לשירות הוואטסאפ" })
      .eq("id", connection.id);
    return { error: "לא ניתן להתחבר כרגע לשירות הוואטסאפ. נסה שוב מאוחר יותר." };
  }

  return { connectionId: connection.id as string };
}
