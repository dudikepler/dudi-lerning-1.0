"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormField } from "@/components/therapy/FormField";
import { registerTherapist, type RegisterState } from "./actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerTherapist,
    undefined
  );

  if (state?.success) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">בדקו את תיבת המייל שלכם</h1>
        <p className="mt-4 text-[var(--tp-muted)]">
          שלחנו קישור אישור לכתובת שהזנתם. לאחר האישור תוכלו להתחבר ולבנות את
          העמוד שלכם — הוא יוצג לציבור לאחר אישור מנהל.
        </p>
        <Link href="/login" className="mt-6 inline-block underline">
          מעבר לדף הכניסה
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">הרשמת מטפלים</h1>
      <p className="mt-2 text-sm text-[var(--tp-muted)]">
        לאחר ההרשמה תוכלו לבנות עמוד אישי ולפרסם כתבות. הפרופיל יוצג לציבור רק
        לאחר אישור מנהל.
      </p>
      <form action={action} className="mt-8 flex flex-col gap-4">
        <FormField label="שם מלא" name="fullName" />
        <FormField
          label="תואר מקצועי (למשל: פסיכולוג/ית קליני/ת)"
          name="title"
        />
        <FormField label="אימייל" name="email" type="email" />
        <FormField label="סיסמה" name="password" type="password" />
        {state?.error && (
          <p className="text-sm text-[var(--tp-danger)]">{state.error}</p>
        )}
        <button
          disabled={pending}
          type="submit"
          className="rounded-full bg-[var(--tp-primary)] px-6 py-3 font-semibold text-white transition disabled:opacity-60"
        >
          {pending ? "שולח..." : "הרשמה"}
        </button>
      </form>
      <p className="mt-6 text-sm">
        כבר נרשמתם?{" "}
        <Link href="/login" className="underline">
          התחברות
        </Link>
      </p>
    </div>
  );
}
