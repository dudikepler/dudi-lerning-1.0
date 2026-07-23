"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

async function setTherapistStatus(therapistId: string, status: "approved" | "rejected") {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: therapist } = await supabase
    .from("therapists")
    .select("slug")
    .eq("id", therapistId)
    .maybeSingle();

  await supabase.from("therapists").update({ status }).eq("id", therapistId);

  revalidatePath("/admin/therapists");
  revalidatePath("/therapists");
  if (therapist?.slug) revalidatePath(`/therapists/${therapist.slug}`);
}

export async function approveTherapist(therapistId: string, _formData: FormData) {
  await setTherapistStatus(therapistId, "approved");
}

export async function rejectTherapist(therapistId: string, _formData: FormData) {
  await setTherapistStatus(therapistId, "rejected");
}

async function setReviewStatus(reviewId: string, status: "approved" | "rejected") {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("therapist_id")
    .eq("id", reviewId)
    .maybeSingle();

  await supabase.from("reviews").update({ status }).eq("id", reviewId);

  revalidatePath("/admin/reviews");
  if (review?.therapist_id) {
    const { data: therapist } = await supabase
      .from("therapists")
      .select("slug")
      .eq("id", review.therapist_id)
      .maybeSingle();
    if (therapist?.slug) revalidatePath(`/therapists/${therapist.slug}`);
  }
}

export async function approveReview(reviewId: string, _formData: FormData) {
  await setReviewStatus(reviewId, "approved");
}

export async function rejectReview(reviewId: string, _formData: FormData) {
  await setReviewStatus(reviewId, "rejected");
}
