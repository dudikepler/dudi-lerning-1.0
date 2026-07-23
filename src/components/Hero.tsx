import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-gold/20 px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(212,175,55,0.18),transparent_60%)]" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="mb-6 rounded-full border border-gold/40 px-4 py-1 text-sm tracking-wide text-gold-soft">
          הפרופסור · דודי קפלר
        </span>
        <h1 className="text-balance text-4xl font-bold leading-tight sm:text-6xl">
          תוכן שמניע אנשים,
          <br />
          <span className="text-gradient-gold">פרסום שמניע לקוחות</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground/80 sm:text-xl">
          יוצר תוכן ומרצה עם קהילה של מאות אלפי עוקבים. מזמין אתכם לצלם,
          לספר ולפרסם את המותג שלכם בצורה אמיתית שמדברת אל הלב.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/book"
            className="rounded-full bg-gold px-8 py-3 text-base font-semibold text-black transition hover:bg-gold-soft"
          >
            קביעת פגישה ביומן
          </Link>
          <a
            href="#services"
            className="rounded-full border border-gold/40 px-8 py-3 text-base font-semibold text-foreground transition hover:border-gold"
          >
            השירותים שלי
          </a>
        </div>
      </div>
    </section>
  );
}
