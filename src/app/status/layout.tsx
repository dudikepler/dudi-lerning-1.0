import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-gold/20 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/status" className="text-lg font-bold">
            <span className="text-gradient-gold">סטטוסים</span> לייב
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/status/contacts" className="text-foreground/80 hover:text-gold-soft">
                  אנשי קשר
                </Link>
                <Link href="/status/feed" className="text-foreground/80 hover:text-gold-soft">
                  פיד
                </Link>
                <form action={logout}>
                  <button className="rounded-full border border-gold/40 px-4 py-1.5 font-semibold transition hover:border-gold">
                    התנתקות
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/status/login" className="text-foreground/80 hover:text-gold-soft">
                  התחברות
                </Link>
                <Link
                  href="/status/signup"
                  className="rounded-full bg-gold px-4 py-1.5 font-semibold text-black transition hover:bg-gold-soft"
                >
                  הרשמה
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
