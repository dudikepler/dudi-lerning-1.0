export function RatingStars({
  average,
  count,
  size = "md",
  showCount = true,
}: {
  average: number | null;
  count: number;
  size?: "sm" | "md";
  showCount?: boolean;
}) {
  const textSize = size === "sm" ? "text-sm" : "text-base";

  if (average === null) {
    return (
      <span className={`text-[var(--tp-muted)] ${textSize}`}>
        אין עדיין חוות דעת מאושרות
      </span>
    );
  }

  const rounded = Math.round(average);

  return (
    <span className={`inline-flex items-center gap-1.5 ${textSize}`}>
      <span aria-hidden className="text-[var(--tp-accent)]" dir="ltr">
        {"★".repeat(rounded)}
        {"☆".repeat(5 - rounded)}
      </span>
      {showCount && (
        <>
          <span className="font-semibold">{average.toFixed(1)}</span>
          <span className="text-[var(--tp-muted)]">
            ({count} חוות {count === 1 ? "דעת" : "דעות"})
          </span>
        </>
      )}
    </span>
  );
}
