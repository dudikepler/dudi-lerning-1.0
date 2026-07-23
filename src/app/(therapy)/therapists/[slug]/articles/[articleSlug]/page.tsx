import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; articleSlug: string }>;
}) {
  const { slug, articleSlug } = await params;
  const supabase = await createClient();
  const { data: therapist } = await supabase
    .from("therapists")
    .select("id, full_name")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!therapist) return { title: "כתבה לא נמצאה | מטפל מומלץ" };

  const { data: article } = await supabase
    .from("articles")
    .select("title")
    .eq("therapist_id", therapist.id)
    .eq("slug", articleSlug)
    .eq("published", true)
    .maybeSingle();

  return {
    title: article
      ? `${article.title} — ${therapist.full_name} | מטפל מומלץ`
      : "כתבה לא נמצאה | מטפל מומלץ",
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string; articleSlug: string }>;
}) {
  const { slug, articleSlug } = await params;
  const supabase = await createClient();

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id, slug, full_name, title")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!therapist) notFound();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("therapist_id", therapist.id)
    .eq("slug", articleSlug)
    .eq("published", true)
    .maybeSingle();

  if (!article) notFound();

  return (
    <article className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href={`/therapists/${therapist.slug}`}
        className="text-sm text-[var(--tp-muted)] hover:underline"
      >
        ← חזרה לעמוד של {therapist.full_name}
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{article.title}</h1>
      <p className="mt-1 text-sm text-[var(--tp-muted)]">
        מאת {therapist.full_name}, {therapist.title}
      </p>
      <div className="mt-8 whitespace-pre-wrap leading-relaxed">{article.content}</div>
    </article>
  );
}
