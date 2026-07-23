import Link from "next/link";
import { socialLinks } from "@/data/social";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/10 bg-panel px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          מוכנים <span className="text-gradient-gold">לספר את הסיפור</span>{" "}
          שלכם?
        </h2>
        <Link
          href="/book"
          className="rounded-full bg-gold px-8 py-3 text-base font-semibold text-black transition hover:bg-gold-soft"
        >
          קביעת פגישה ביומן
        </Link>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-foreground/70">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-gold-soft"
            >
              {link.name}
            </a>
          ))}
        </div>
        <p className="text-xs text-foreground/40">
          © {new Date().getFullYear()} דודי קפלר · כל הזכויות שמורות
        </p>
      </div>
    </footer>
  );
}
