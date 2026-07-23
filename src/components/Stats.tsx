import { socialLinks } from "@/data/social";

const stats = [
  { label: "עוקבים באינסטגרם", value: "114K+" },
  { label: "עוקבים בטיקטוק", value: "258K+" },
  { label: "לייקים בטיקטוק", value: "12.2M+" },
  { label: "פרקי פודקאסט \"השראה\"", value: "44+" },
];

export function Stats() {
  return (
    <section className="border-b border-gold/10 bg-panel px-6 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-bold text-gold-soft sm:text-4xl">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-foreground/70">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-4 text-sm">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gold/30 px-4 py-1.5 text-foreground/80 transition hover:border-gold hover:text-gold-soft"
          >
            {link.name} {link.handle}
          </a>
        ))}
      </div>
    </section>
  );
}
