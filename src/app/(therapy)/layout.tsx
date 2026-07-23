import Link from "next/link";
import { getSessionUser } from "@/lib/auth/dal";

export const metadata = {
  title: "מטפל מומלץ | ביקורות דיסקרטיות על מטפלים ופסיכולוגים",
  description:
    "מצאו מטפל או פסיכולוג לפי ביקורות דיסקרטיות ואנונימיות מאנשים אמיתיים, וקראו כתבות מקצועיות שכתבו המטפלים בעצמם.",
};

export default async function TherapyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div data-scope="therapy" className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-[var(--tp-border)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/therapists" className="text-lg font-bold text-[var(--tp-primary)]">
            מטפל מומלץ
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/therapists" className="hover:underline">
              דירוג מטפלים
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-[var(--tp-primary)] px-4 py-2 font-semibold text-white hover:opacity-90"
              >
                אזור המטפל שלי
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:underline">
                  כניסה למטפלים
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[var(--tp-primary)] px-4 py-2 font-semibold text-white hover:opacity-90"
                >
                  הרשמת מטפלים
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-[var(--tp-border)] px-6 py-6 text-center text-sm text-[var(--tp-muted)]">
        כל חוות דעת מוגשת באופן אנונימי ועוברת אישור מנהל לפני פרסום. הפלטפורמה
        אינה תחליף לייעוץ מקצועי או חירום נפשי.
      </footer>
    </div>
  );
}
