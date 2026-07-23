import { createAdminClient } from "@/lib/supabase/admin";
import { approveTherapist, rejectTherapist } from "../actions";
import type { Therapist, TherapistStatus } from "@/lib/types";

const STATUS_LABEL: Record<TherapistStatus, string> = {
  pending: "ממתין",
  approved: "מאושר",
  rejected: "נדחה",
};

export default async function AdminTherapistsPage() {
  const supabase = createAdminClient();
  const { data: therapists } = await supabase
    .from("therapists")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Therapist[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold">מטפלים</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {(therapists ?? []).map((therapist) => (
          <li
            key={therapist.id}
            className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {therapist.full_name}{" "}
                  <span className="text-sm font-normal text-[var(--tp-muted)]">
                    — {therapist.title}
                  </span>
                </p>
                <p className="text-xs text-[var(--tp-muted)]">
                  {therapist.email || "ללא אימייל ליצירת קשר"} · סטטוס:{" "}
                  {STATUS_LABEL[therapist.status]}
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <form action={approveTherapist.bind(null, therapist.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--tp-primary)] px-4 py-1.5 font-semibold text-white"
                  >
                    אישור
                  </button>
                </form>
                <form action={rejectTherapist.bind(null, therapist.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-[var(--tp-danger)] px-4 py-1.5 font-semibold text-[var(--tp-danger)]"
                  >
                    דחייה
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
        {(therapists ?? []).length === 0 && (
          <p className="text-[var(--tp-muted)]">אין מטפלים רשומים עדיין.</p>
        )}
      </ul>
    </div>
  );
}
