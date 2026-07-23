"use client";

import { useActionState } from "react";
import { FormField } from "@/components/therapy/FormField";
import { updateArticle, type ArticleFormState } from "../actions";
import type { Article } from "@/lib/types";

export function EditArticleForm({ article }: { article: Article }) {
  const action = updateArticle.bind(null, article.id);
  const [state, formAction, pending] = useActionState<ArticleFormState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <FormField label="כותרת" name="title" defaultValue={article.title} />
      <FormField label="תוכן" name="content" defaultValue={article.content} textarea rows={12} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={article.published} />
        מפורסם לציבור
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
  );
}
