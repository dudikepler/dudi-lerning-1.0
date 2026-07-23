import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RatingStars } from "@/components/therapy/RatingStars";
import { computeRatingStats } from "@/lib/reviews";
import type { Therapist } from "@/lib/types";

export const metadata = {
  title: "דירוג מטפלים ופסיכולוגים | מטפל מומלץ",
};

type SearchParams = {
  q?: string;
  city?: string;
  specialty?: string;
  sort?: string;
};

async function getTherapists(params: SearchParams) {
  const supabase = await createClient();
  let query = supabase.from("therapists").select("*").eq("status", "approved");

  if (params.q) {
    query = query.ilike("full_name", `%${params.q}%`);
  }
  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }
  if (params.specialty) {
    query = query.contains("specialties", [params.specialty]);
  }

  const { data: therapists } = await query.order("created_at", {
    ascending: false,
  });

  const list = (therapists ?? []) as Therapist[];
  const ids = list.map((t) => t.id);

  const { data: reviews } = ids.length
    ? await supabase
        .from("reviews")
        .select("therapist_id, rating")
        .eq("status", "approved")
        .in("therapist_id", ids)
    : { data: [] as { therapist_id: string; rating: number }[] };

  const statsByTherapist = new Map<string, { average: number | null; count: number }>();
  for (const id of ids) {
    const ratingsForTherapist = (reviews ?? []).filter((r) => r.therapist_id === id);
    statsByTherapist.set(id, computeRatingStats(ratingsForTherapist));
  }

  if (params.sort === "rating") {
    list.sort((a, b) => {
      const avgA = statsByTherapist.get(a.id)?.average ?? -1;
      const avgB = statsByTherapist.get(b.id)?.average ?? -1;
      return avgB - avgA;
    });
  }

  return { list, statsByTherapist };
}

export default async function TherapistsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { list, statsByTherapist } = await getTherapists(params);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold">מצאו מטפל או פסיכולוג</h1>
      <p className="mt-2 max-w-2xl text-[var(--tp-muted)]">
        כל חוות דעת כאן הוגשה באופן אנונימי ואושרה על ידי מנהל האתר לפני
        פרסום.
      </p>

      <form className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-4" method="get">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="חיפוש לפי שם"
          className="rounded-lg border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 outline-none focus:border-[var(--tp-primary)] sm:col-span-2"
        />
        <input
          name="city"
          defaultValue={params.city}
          placeholder="עיר"
          className="rounded-lg border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 outline-none focus:border-[var(--tp-primary)]"
        />
        <select
          name="sort"
          defaultValue={params.sort ?? ""}
          className="rounded-lg border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 outline-none focus:border-[var(--tp-primary)]"
        >
          <option value="">מיון: חדש ביותר</option>
          <option value="rating">מיון: דירוג גבוה</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[var(--tp-primary)] px-4 py-2 font-semibold text-white sm:col-span-4 sm:w-fit"
        >
          סינון
        </button>
      </form>

      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {list.map((therapist) => {
          const stats = statsByTherapist.get(therapist.id) ?? {
            average: null,
            count: 0,
          };
          return (
            <li
              key={therapist.id}
              className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-5"
            >
              <Link href={`/therapists/${therapist.slug}`} className="block">
                <h2 className="text-lg font-bold">{therapist.full_name}</h2>
                <p className="text-sm text-[var(--tp-muted)]">
                  {therapist.title}
                  {therapist.city ? ` · ${therapist.city}` : ""}
                </p>
                <div className="mt-3">
                  <RatingStars average={stats.average} count={stats.count} size="sm" />
                </div>
                {therapist.specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {therapist.specialties.slice(0, 4).map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full bg-[var(--tp-primary-soft)] px-3 py-1 text-xs text-[var(--tp-primary)]"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {list.length === 0 && (
        <p className="mt-12 text-center text-[var(--tp-muted)]">
          לא נמצאו מטפלים מתאימים. נסו לשנות את הסינון.
        </p>
      )}
    </div>
  );
}
