const services = [
  {
    title: "צילום תוכן ממותג",
    description:
      "סרטונים ותמונות איכותיים המספרים את הסיפור של המותג שלכם בשפה האותנטית שהקהל שלי מכיר ואוהב.",
  },
  {
    title: "קמפיין פרסום ממומן",
    description:
      "חשיפה בפיד, בסטורי ובריל, מותאמת לקהל הרלוונטי, עם מעורבות גבוהה ותוצאות מדידות.",
  },
  {
    title: "שיתוף פעולה מתמשך",
    description:
      "ליווי מותגים לאורך זמן - מפוסט חד פעמי ועד נוכחות קבועה בתוכן השוטף שלי.",
  },
];

export function Services() {
  return (
    <section id="services" className="border-t border-gold/10 bg-panel px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          <span className="text-gradient-gold">שירותי צילום ופרסום</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-foreground/70">
          כל שיתוף פעולה נבנה אישית, כדי שהמותג שלכם יידבר בקול אמיתי אל
          הקהל שלי.
        </p>
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-gold/20 bg-background/60 p-6"
            >
              <h3 className="text-xl font-semibold text-gold-soft">
                {service.title}
              </h3>
              <p className="mt-3 text-foreground/75">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
