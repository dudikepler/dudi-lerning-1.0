function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Builds a URL slug from a (possibly Hebrew) name. Hebrew and other non-Latin
 * text can't be transliterated reliably, so we fall back to a short random
 * code rather than producing an empty or unreadable slug.
 */
export function slugify(base: string): string {
  const latinPart = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return latinPart ? `${latinPart}-${randomSuffix()}` : randomSuffix();
}
