"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-2xl border border-gold/20 bg-panel p-8">
        <h1 className="text-2xl font-bold">התחברות</h1>
        <form action={action} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-foreground/70">
              אימייל
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-lg border border-gold/30 bg-background px-3 py-2 outline-none focus:border-gold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-foreground/70">
              סיסמה
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-lg border border-gold/30 bg-background px-3 py-2 outline-none focus:border-gold"
            />
          </div>
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-gold px-6 py-2.5 font-semibold text-black transition hover:bg-gold-soft disabled:opacity-60"
          >
            {pending ? "מתחבר..." : "התחברות"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-foreground/60">
          אין לך חשבון?{" "}
          <Link href="/status/signup" className="text-gold-soft hover:underline">
            הרשמה
          </Link>
        </p>
      </div>
    </div>
  );
}
