import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RatingStars } from "@/components/therapy/RatingStars";
import { computeRatingStats } from "@/lib/reviews";
import { ReviewForm } from "./ReviewForm";
import type { Article, Review, Therapist } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: therapist } = await supabase
    .from("therapists")
    .select("full_name, title")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!therapist) return { title: "מטפל לא נמצא | מטפל מומלץ" };
  return { title: `${therapist.full_name} — ${therapist.title} | מטפל מומלץ` };
}

export default async function TherapistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: therapist } = await supabase
    .from("therapists")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle<Therapist>();

  if (!therapist) notFound();

  const [{ data: articles }, { data: reviews }] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .eq("therapist_id", therapist.id)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .returns<Article[]>(),
    supabase
      .from("reviews")
      .select("*")
      .eq("therapist_id", therapist.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .returns<Review[]>(),
  ]);

  const stats = computeRatingStats((reviews ?? []).map((r) => ({ rating: r.rating })));

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {therapist.photo_url && (
          <Image
            src={therapist.photo_url}
            alt={therapist.full_name}
            width={128}
            height={128}
            className="h-32 w-32 shrink-0 rounded-2xl object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{therapist.full_name}</h1>
          <p className="mt-1 text-[var(--tp-muted)]">
            {therapist.title}
            {therapist.city ? ` · ${therapist.city}` : ""}
          </p>
          <div className="mt-3">
            <RatingStars average={stats.average} count={stats.count} />
          </div>
          {therapist.specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {therapist.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-full bg-[var(--tp-primary-soft)] px-3 py-1 text-xs text-[var(--tp-primary)]"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {therapist.bio && (
        <p className="mt-8 whitespace-pre-wrap leading-relaxed">{therapist.bio}</p>
      )}

      {(therapist.phone || therapist.email || therapist.website) && (
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          {therapist.phone && <span>טלפון: {therapist.phone}</span>}
          {therapist.email && <span>אימייל: {therapist.email}</span>}
          {therapist.website && (
            <a href={therapist.website} target="_blank" rel="noreferrer" className="underline">
              אתר אישי
            </a>
          )}
        </div>
      )}

      {articles && articles.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">כתבות מאת {therapist.full_name}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/therapists/${therapist.slug}/articles/${article.slug}`}
                  className="block rounded-xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4 hover:border-[var(--tp-primary)]"
                >
                  <h3 className="font-semibold">{article.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-bold">חוות דעת</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {(reviews ?? []).map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4"
            >
              <RatingStars average={review.rating} count={1} size="sm" showCount={false} />
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{review.body}</p>
            </li>
          ))}
          {(reviews ?? []).length === 0 && (
            <p className="text-[var(--tp-muted)]">אין עדיין חוות דעת מאושרות למטפל/ת זו.</p>
          )}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">כתבו חוות דעת אנונימית</h2>
        <p className="mt-1 text-sm text-[var(--tp-muted)]">
          לא נשמר שום פרט מזהה לגביכם. חוות הדעת תוצג לציבור רק לאחר אישור מנהל.
        </p>
        <div className="mt-4">
          <ReviewForm therapistId={therapist.id} />
        </div>
      </section>
    </div>
  );
}
