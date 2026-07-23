export function About() {
  return (
    <section id="about" className="px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-5 sm:items-center">
        <div className="sm:col-span-2">
          <div className="aspect-square w-full rounded-2xl border border-gold/30 bg-gradient-to-br from-panel to-black" />
        </div>
        <div className="sm:col-span-3">
          <h2 className="text-3xl font-bold sm:text-4xl">
            מי זה <span className="text-gradient-gold">״הפרופסור״</span>?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-foreground/80">
            דודי קפלר, המוכר לקהילה שלו כ״הפרופסור״, בנה קהילה של מאות
            אלפי עוקבים באינסטגרם ובטיקטוק על בסיס סיפור אישי, כנות ותקווה.
            המסע האישי שלו - מנקודת שבירה עמוקה ועד לחיים של משמעות
            ונתינה - הוא הבסיס לכל תוכן שהוא יוצר, ומה שהופך את הקהל שלו
            למחובר ואמיתי כל כך.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            את הסיפור הזה הוא ממשיך לספר גם בפודקאסט האישי שלו,{" "}
            <span className="text-gold-soft">״השראה״</span>, שם הוא מארח
            אנשים מעוררי השראה משלל תחומים. השילוב הזה של קהל נאמן, תוכן
            אותנטי ויכולת סיפור סיפור - הוא בדיוק מה שמותגים מחפשים כשהם
            רוצים להגיע ללב של הקהל שלהם.
          </p>
        </div>
      </div>
    </section>
  );
}
