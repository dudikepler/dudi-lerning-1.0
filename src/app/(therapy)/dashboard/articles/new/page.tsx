"use client";

import { useActionState } from "react";
import { FormField } from "@/components/therapy/FormField";
import { createArticle, type ArticleFormState } from "../actions";

export default function NewArticlePage() {
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(
    createArticle,
    undefined
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">כתבה חדשה</h1>
      <form action={action} className="mt-6 flex flex-col gap-4">
        <FormField label="כותרת" name="title" />
        <FormField label="תוכן" name="content" textarea rows={12} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" />
          פרסום מיידי (אחרת תישמר כטיוטה)
        </label>
        {state?.error && <p className="text-sm text-[var(--tp-danger)]">{state.error}</p>}
        <button
          disabled={pending}
          type="submit"
          className="w-fit rounded-full bg-[var(--tp-primary)] px-6 py-2.5 font-semibold text-white transition disabled:opacity-60"
        >
          {pending ? "שומר..." : "שמירה"}
        </button>
      </form>
    </div>
  );
}
