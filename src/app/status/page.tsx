import Link from "next/link";

const steps = [
  {
    title: "מתחברים",
    body: "סורקים קוד QR עם וואטסאפ בטלפון, בדיוק כמו בוואטסאפ למחשב.",
  },
  {
    title: "בוחרים אנשי קשר",
    body: "מסמנים את מי שרוצים לעקוב אחריו מתוך רשימת אנשי הקשר שלכם.",
  },
  {
    title: "רואים הכל במקום אחד",
    body: "כל עדכוני הסטטוס שלהם מוצגים בפיד אחד נוח, בלי לפתוח כל צ'אט בנפרד.",
  },
];

export default function StatusLandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-gold/20 px-6 py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(212,175,55,0.18),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="mb-6 rounded-full border border-gold/40 px-4 py-1 text-sm tracking-wide text-gold-soft">
            עדכוני סטטוס וואטסאפ, במקום אחד
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight sm:text-6xl">
            כל הסטטוסים <span className="text-gradient-gold">שמעניינים אתכם</span>,
            <br />
            בפיד אחד
          </h1>
          <p className="mt-6 max-w-xl text-lg text-foreground/80">
            מתחברים עם קוד QR, בוחרים את אנשי הקשר שרוצים לעקוב אחריהם, ורואים
            את כל עדכוני הסטטוס שלהם בלי לפתוח את וואטסאפ.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/status/signup"
              className="rounded-full bg-gold px-8 py-3 text-base font-semibold text-black transition hover:bg-gold-soft"
            >
              הרשמה בחינם
            </Link>
            <Link
              href="/status/login"
              className="rounded-full border border-gold/40 px-8 py-3 text-base font-semibold transition hover:border-gold"
            >
              יש לי כבר חשבון
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-gold/20 bg-panel p-6">
              <span className="text-sm font-semibold text-gold-soft">שלב {i + 1}</span>
              <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-foreground/70">{step.body}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-foreground/60">
          החיבור נעשה ישירות מהחשבון שלכם, ומציג רק סטטוסים שכבר גלויים לכם
          דרך אנשי הקשר שבחרתם. השירות אינו קשור או מסונף לוואטסאפ / Meta.
        </p>
      </section>
    </div>
  );
}
