import Link from "next/link";

export default function BookPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <span className="text-sm uppercase tracking-[0.3em] text-gold-soft">
        בקרוב
      </span>
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
        <span className="text-gradient-gold">קביעת פגישה</span> לפי היומן שלי
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-foreground/70">
        טופס ההזמנה, שיציג בזמן אמת את הזמן הפנוי ביומן Google Calendar
        שלי, בבנייה כרגע. בינתיים אפשר ליצור קשר דרך הרשתות החברתיות.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-gold/40 px-8 py-3 font-semibold transition hover:border-gold"
      >
        חזרה לעמוד הבית
      </Link>
    </div>
  );
}
