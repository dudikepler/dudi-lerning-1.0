"use server";

import { revalidatePath } from "next/cache";
import { requireTherapistUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { ProfileSchema } from "@/lib/validation";

export type ProfileFormState = { error?: string; success?: boolean } | undefined;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function updateProfile(
  _state: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireTherapistUser();

  const parsed = ProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    title: formData.get("title"),
    city: formData.get("city"),
    bio: formData.get("bio"),
    specialties: formData.get("specialties"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "שגיאה בטופס" };
  }

  const supabase = await createClient();

  let photoUrl: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) {
      return { error: "התמונה גדולה מדי (מקסימום 5MB)" };
    }
    const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("therapist-photos")
      .upload(path, photo, { upsert: true, contentType: photo.type || undefined });

    if (uploadError) {
      return { error: "העלאת התמונה נכשלה" };
    }

    photoUrl = supabase.storage.from("therapist-photos").getPublicUrl(path).data.publicUrl;
  }

  const specialties = parsed.data.specialties
    ? parsed.data.specialties
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const { error } = await supabase
    .from("therapists")
    .update({
      full_name: parsed.data.fullName,
      title: parsed.data.title,
      city: parsed.data.city,
      bio: parsed.data.bio,
      specialties,
      phone: parsed.data.phone,
      email: parsed.data.email,
      website: parsed.data.website,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: "שמירת הפרופיל נכשלה, נסו שוב" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/therapists");
  return { success: true };
}
