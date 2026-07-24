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
                key={client.name}
                className={`group relative flex aspect-[3/2] items-center justify-center rounded-2xl border p-6 transition ${
                  client.needsReview
                    ? "border-dashed border-gold/30"
                    : "border-gold/20 hover:border-gold hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.6)]"
                } bg-panel`}
              >
                {client.needsReview && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-black">
                    לבדוק
                  </span>
                )}
                {client.domain ? (
                  <img
                    src={`https://logo.clearbit.com/${client.domain}`}
                    alt={client.name}
                    className="max-h-12 w-full object-contain grayscale transition group-hover:grayscale-0"
                    loading="lazy"
                  />
                ) : (
                  <span className="px-2 text-center text-sm font-medium text-foreground/70">
                    {client.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
