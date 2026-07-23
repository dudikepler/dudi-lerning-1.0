"use client";

import { useActionState } from "react";
import { submitReview, type ReviewFormState } from "./actions";

export function ReviewForm({ therapistId }: { therapistId: string }) {
  const action = submitReview.bind(null, therapistId);
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(
    action,
    undefined
  );

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-primary-soft)] p-6 text-center">
        <p className="font-semibold text-[var(--tp-primary)]">תודה! חוות הדעת נשלחה.</p>
        <p className="mt-1 text-sm text-[var(--tp-muted)]">
          היא תוצג לציבור לאחר בדיקה ואישור של מנהל האתר.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <span className="text-sm font-medium">דירוג</span>
        <div className="mt-1 flex gap-2" dir="ltr">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="flex flex-col items-center text-sm">
              <input type="radio" name="rating" value={value} required />
              {value}
            </label>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">חוות הדעת שלכם (אנונימי לחלוטין)</span>
        <textarea
          name="body"
          required
          minLength={20}
          rows={5}
          placeholder="ספרו על החוויה שלכם עם המטפל/ת — מה עזר, מה פחות, למי הייתם ממליצים..."
          className="rounded-lg border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 outline-none focus:border-[var(--tp-primary)]"
        />
      </label>
      {/* Honeypot: hidden from real visitors, only bots fill it in. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      {state?.error && <p className="text-sm text-[var(--tp-danger)]">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="w-fit rounded-full bg-[var(--tp-primary)] px-6 py-2.5 font-semibold text-white transition disabled:opacity-60"
      >
        {pending ? "שולח..." : "שליחת חוות דעת אנונימית"}
      </button>
    </form>
  );
}
