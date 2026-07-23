"use client";

import { useActionState } from "react";
import Image from "next/image";
import { FormField } from "@/components/therapy/FormField";
import { updateProfile, type ProfileFormState } from "./actions";
import type { Therapist } from "@/lib/types";

export function ProfileForm({ therapist }: { therapist: Therapist }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <FormField label="שם מלא" name="fullName" defaultValue={therapist.full_name} />
      <FormField label="תואר מקצועי" name="title" defaultValue={therapist.title} />
      <FormField label="עיר" name="city" defaultValue={therapist.city} required={false} />
      <FormField
        label="תחומי התמחות (מופרדים בפסיקים)"
        name="specialties"
        defaultValue={therapist.specialties.join(", ")}
        required={false}
        placeholder="חרדה, זוגיות, טראומה"
      />
      <FormField
        label="קצת עליי"
        name="bio"
        defaultValue={therapist.bio}
        textarea
        rows={6}
        required={false}
      />
      <FormField label="טלפון" name="phone" defaultValue={therapist.phone} required={false} />
      <FormField
        label="אימייל ליצירת קשר"
        name="email"
        type="email"
        defaultValue={therapist.email}
        required={false}
      />
      <FormField label="אתר אישי" name="website" defaultValue={therapist.website} required={false} />

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">תמונת פרופיל</span>
        {therapist.photo_url && (
          <Image
            src={therapist.photo_url}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 rounded-xl object-cover"
          />
        )}
        <input type="file" name="photo" accept="image/*" className="text-sm" />
      </label>

      {state?.error && <p className="text-sm text-[var(--tp-danger)]">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-[var(--tp-primary)]">הפרופיל נשמר בהצלחה.</p>
      )}
      <button
        disabled={pending}
        type="submit"
        className="w-fit rounded-full bg-[var(--tp-primary)] px-6 py-2.5 font-semibold text-white transition disabled:opacity-60"
      >
        {pending ? "שומר..." : "שמירה"}
      </button>
    </form>
  );
}
