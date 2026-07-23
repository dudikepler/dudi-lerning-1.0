export function computeRatingStats(reviews: { rating: number }[]) {
  if (reviews.length === 0) return { average: null as number | null, count: 0 };
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
