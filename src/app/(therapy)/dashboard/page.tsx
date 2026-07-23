import Link from "next/link";
import { getCurrentTherapist } from "@/lib/auth/dal";
import { ProfileForm } from "./ProfileForm";

export default async function DashboardPage() {
  const therapist = await getCurrentTherapist();

  if (!therapist) {
    return (
      <p className="text-[var(--tp-muted)]">
        לא נמצא פרופיל מטפל עבור המשתמש הזה. נסו{" "}
        <Link href="/login" className="underline">
          להתחבר מחדש
        </Link>
        .
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">העמוד האישי שלי</h1>
      <p className="mt-1 text-sm text-[var(--tp-muted)]">
        כך תראה הכתובת הציבורית של העמוד שלכם:{" "}
        <span className="font-mono">/therapists/{therapist.slug}</span>
      </p>
      <ProfileForm therapist={therapist} />
    </div>
  );
}
