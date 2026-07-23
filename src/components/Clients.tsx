import { clients } from "@/data/clients";

export function Clients() {
  return (
    <section id="clients" className="px-6 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <span className="text-sm uppercase tracking-[0.3em] text-gold-soft">
          כבר עובדים איתי
        </span>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
          מותגים <span className="text-gradient-gold">שסומכים עליי</span>
        </h2>

        {clients.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-dashed border-gold/30 bg-panel px-8 py-16 text-foreground/60">
            <p className="text-lg">
              הרשימה בדרך - החברות שאיתן עבדתי בשנתיים האחרונות יופיעו כאן
              בקרוב.
            </p>
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {clients.map((client) => (
              <div
                key={client.domain}
                className="group flex aspect-[3/2] items-center justify-center rounded-2xl border border-gold/20 bg-panel p-6 transition hover:border-gold hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.6)]"
              >
                <img
                  src={`https://logo.clearbit.com/${client.domain}`}
                  alt={client.name}
                  className="max-h-12 w-full object-contain grayscale transition group-hover:grayscale-0"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
