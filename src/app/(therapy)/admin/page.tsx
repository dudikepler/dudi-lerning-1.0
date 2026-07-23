import { createAdminClient } from "@/lib/supabase/admin";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-5">
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-[var(--tp-muted)]">{label}</p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  const [{ count: pendingTherapists }, { count: pendingReviews }, { count: approvedTherapists }] =
    await Promise.all([
      supabase.from("therapists").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("therapists").select("id", { count: "exact", head: true }).eq("status", "approved"),
    ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">סקירה כללית</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="מטפלים ממתינים לאישור" value={pendingTherapists ?? 0} />
        <StatCard label="חוות דעת ממתינות לאישור" value={pendingReviews ?? 0} />
        <StatCard label="מטפלים מאושרים" value={approvedTherapists ?? 0} />
      </div>
    </div>
  );
}
