"use server";

import { createClient } from "@/lib/supabase/server";
import { ReviewSchema } from "@/lib/validation";

export type ReviewFormState = { error?: string; success?: boolean } | undefined;

export async function submitReview(
  therapistId: string,
  _state: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const parsed = ReviewSchema.safeParse({
    rating: formData.get("rating"),
    body: formData.get("body"),
    honeypot: formData.get("company"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "שגיאה בטופס" };
  }

  // Hidden field only a bot would fill in — pretend success without writing.
  if (parsed.data.honeypot) {
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    therapist_id: therapistId,
    rating: parsed.data.rating,
    body: parsed.data.body,
  });

  if (error) {
    return { error: "לא ניתן היה לשלוח את חוות הדעת כרגע, נסו שוב מאוחר יותר" };
  }

  return { success: true };
}
