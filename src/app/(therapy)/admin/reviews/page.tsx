import { createAdminClient } from "@/lib/supabase/admin";
import { approveReview, rejectReview } from "../actions";
import type { Review, ReviewStatus } from "@/lib/types";

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "ממתין",
  approved: "מאושר",
  rejected: "נדחה",
};

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Review[]>();

  const therapistIds = Array.from(new Set((reviews ?? []).map((r) => r.therapist_id)));
  const { data: therapists } = therapistIds.length
    ? await supabase
        .from("therapists")
        .select("id, full_name")
        .in("id", therapistIds)
        .returns<{ id: string; full_name: string }[]>()
    : { data: [] as { id: string; full_name: string }[] };

  const therapistById = new Map((therapists ?? []).map((t) => [t.id, t]));

  return (
    <div>
      <h1 className="text-2xl font-bold">חוות דעת</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {(reviews ?? []).map((review) => {
          const therapist = therapistById.get(review.therapist_id);
          return (
            <li
              key={review.id}
              className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4"
            >
              <p className="text-sm text-[var(--tp-muted)]">
                על {therapist?.full_name ?? "מטפל לא ידוע"} · דירוג {review.rating}/5 · סטטוס:{" "}
                {STATUS_LABEL[review.status]}
              </p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{review.body}</p>
              <div className="mt-3 flex gap-2 text-sm">
                <form action={approveReview.bind(null, review.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--tp-primary)] px-4 py-1.5 font-semibold text-white"
                  >
                    אישור
                  </button>
                </form>
                <form action={rejectReview.bind(null, review.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-[var(--tp-danger)] px-4 py-1.5 font-semibold text-[var(--tp-danger)]"
                  >
                    דחייה
                  </button>
                </form>
              </div>
            </li>
          );
        })}
        {(reviews ?? []).length === 0 && (
          <p className="text-[var(--tp-muted)]">אין חוות דעת עדיין.</p>
        )}
      </ul>
    </div>
  );
}
