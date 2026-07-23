import Link from "next/link";
import { requireTherapistUser, getCurrentTherapist } from "@/lib/auth/dal";
import { logout } from "@/lib/auth/actions";
import type { TherapistStatus } from "@/lib/types";

const STATUS_LABEL: Record<TherapistStatus, string> = {
  pending: "העמוד שלכם ממתין לאישור מנהל ועדיין אינו מוצג לציבור.",
  approved: "העמוד שלכם מאושר ומוצג לציבור.",
  rejected: "העמוד שלכם לא אושר. פנו לתמיכה לפרטים נוספים.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTherapistUser();
  const therapist = await getCurrentTherapist();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10 sm:flex-row">
      <aside className="flex shrink-0 flex-row gap-2 overflow-x-auto sm:w-48 sm:flex-col">
        <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-[var(--tp-primary-soft)]">
          פרופיל
        </Link>
        <Link
          href="/dashboard/articles"
          className="rounded-lg px-3 py-2 hover:bg-[var(--tp-primary-soft)]"
        >
          כתבות
        </Link>
        <Link
          href="/dashboard/reviews"
          className="rounded-lg px-3 py-2 hover:bg-[var(--tp-primary-soft)]"
        >
          חוות דעת
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg px-3 py-2 text-right hover:bg-[var(--tp-primary-soft)]"
          >
            התנתקות
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">
        {therapist && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              therapist.status === "approved"
                ? "border-[var(--tp-primary)] bg-[var(--tp-primary-soft)] text-[var(--tp-primary)]"
                : "border-[var(--tp-border)] bg-[var(--tp-surface)] text-[var(--tp-muted)]"
            }`}
          >
            {STATUS_LABEL[therapist.status]}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
