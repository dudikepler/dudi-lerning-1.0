"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormField } from "@/components/therapy/FormField";
import { loginTherapist, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginTherapist,
    undefined
  );

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">כניסה למטפלים</h1>
      <p className="mt-2 text-sm text-[var(--tp-muted)]">
        גם מנהלי האתר מתחברים כאן.
      </p>
      <form action={action} className="mt-8 flex flex-col gap-4">
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
          {pending ? "מתחבר..." : "התחברות"}
        </button>
      </form>
      <p className="mt-6 text-sm">
        עדיין אין לכם חשבון?{" "}
        <Link href="/register" className="underline">
          הרשמת מטפלים
        </Link>
      </p>
    </div>
  );
}
