import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { logout } from "@/lib/auth/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10 sm:flex-row">
      <aside className="flex shrink-0 flex-row gap-2 overflow-x-auto sm:w-48 sm:flex-col">
        <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-[var(--tp-primary-soft)]">
          סקירה
        </Link>
        <Link
          href="/admin/therapists"
          className="rounded-lg px-3 py-2 hover:bg-[var(--tp-primary-soft)]"
        >
          מטפלים
        </Link>
        <Link
          href="/admin/reviews"
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
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
