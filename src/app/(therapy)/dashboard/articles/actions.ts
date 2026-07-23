"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireTherapistUser, getCurrentTherapist } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { ArticleSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";

export type ArticleFormState = { error?: string } | undefined;

export async function createArticle(
  _state: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireTherapistUser();
  const therapist = await getCurrentTherapist();
  if (!therapist) return { error: "לא נמצא פרופיל מטפל" };

  const parsed = ArticleSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "שגיאה בטופס" };
  }

  const supabase = await createClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.from("articles").insert({
      therapist_id: therapist.id,
      slug: slugify(parsed.data.title),
      title: parsed.data.title,
      content: parsed.data.content,
      published: parsed.data.published,
    });

    if (!error) {
      revalidatePath("/dashboard/articles");
      revalidatePath(`/therapists/${therapist.slug}`);
      redirect("/dashboard/articles");
    }
    if (error.code !== "23505") {
      return { error: "יצירת הכתבה נכשלה" };
    }
  }

  return { error: "יצירת הכתבה נכשלה, נסו שוב" };
}

export async function updateArticle(
  articleId: string,
  _state: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireTherapistUser();
  const therapist = await getCurrentTherapist();
  if (!therapist) return { error: "לא נמצא פרופיל מטפל" };

  const parsed = ArticleSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "שגיאה בטופס" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("articles")
    .select("id, therapist_id")
    .eq("id", articleId)
    .maybeSingle();

  if (!existing || existing.therapist_id !== therapist.id) {
    return { error: "אין הרשאה לערוך כתבה זו" };
  }

  const { error } = await supabase
    .from("articles")
    .update({
      title: parsed.data.title,
      content: parsed.data.content,
      published: parsed.data.published,
    })
    .eq("id", articleId);

  if (error) return { error: "עדכון הכתבה נכשל" };

  revalidatePath("/dashboard/articles");
  revalidatePath(`/therapists/${therapist.slug}`);
  redirect("/dashboard/articles");
}

export async function deleteArticle(articleId: string, _formData: FormData) {
  await requireTherapistUser();
  const therapist = await getCurrentTherapist();
  if (!therapist) return;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("articles")
    .select("id, therapist_id")
    .eq("id", articleId)
    .maybeSingle();

  if (!existing || existing.therapist_id !== therapist.id) return;

  await supabase.from("articles").delete().eq("id", articleId);

  revalidatePath("/dashboard/articles");
  revalidatePath(`/therapists/${therapist.slug}`);
}
