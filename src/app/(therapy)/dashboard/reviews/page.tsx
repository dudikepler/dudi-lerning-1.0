import { getCurrentTherapist } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { RatingStars } from "@/components/therapy/RatingStars";
import { computeRatingStats } from "@/lib/reviews";
import type { Review } from "@/lib/types";

export default async function DashboardReviewsPage() {
  const therapist = await getCurrentTherapist();
  if (!therapist) return null;

  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("therapist_id", therapist.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .returns<Review[]>();

  const stats = computeRatingStats((reviews ?? []).map((r) => ({ rating: r.rating })));

  return (
    <div>
      <h1 className="text-2xl font-bold">חוות דעת שאושרו</h1>
      <p className="mt-1 text-sm text-[var(--tp-muted)]">
        חוות דעת ממתינות לאישור מנהל אינן מוצגות כאן כדי לשמור על הדיסקרטיות
        של הכותבים עד לאישור סופי.
      </p>
      <div className="mt-4">
        <RatingStars average={stats.average} count={stats.count} />
      </div>
      <ul className="mt-6 flex flex-col gap-4">
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
          <p className="text-[var(--tp-muted)]">אין עדיין חוות דעת מאושרות.</p>
        )}
      </ul>
    </div>
  );
}
