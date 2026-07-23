import Link from "next/link";
import { getCurrentTherapist } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { deleteArticle } from "./actions";
import type { Article } from "@/lib/types";

export default async function ArticlesListPage() {
  const therapist = await getCurrentTherapist();
  if (!therapist) return null;

  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .eq("therapist_id", therapist.id)
    .order("created_at", { ascending: false })
    .returns<Article[]>();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">כתבות</h1>
        <Link
          href="/dashboard/articles/new"
          className="rounded-full bg-[var(--tp-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          כתבה חדשה
        </Link>
      </div>
      <ul className="mt-6 flex flex-col gap-3">
        {(articles ?? []).map((article) => (
          <li
            key={article.id}
            className="flex items-center justify-between rounded-xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4"
          >
            <div>
              <p className="font-semibold">{article.title}</p>
              <p className="text-xs text-[var(--tp-muted)]">
                {article.published ? "פורסם" : "טיוטה"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link href={`/dashboard/articles/${article.id}`} className="underline">
                עריכה
              </Link>
              <form action={deleteArticle.bind(null, article.id)}>
                <button type="submit" className="text-[var(--tp-danger)]">
                  מחיקה
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {(articles ?? []).length === 0 && (
        <p className="mt-8 text-[var(--tp-muted)]">עדיין לא כתבתם כתבות.</p>
      )}
    </div>
  );
}
