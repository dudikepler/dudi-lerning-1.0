import { notFound } from "next/navigation";
import { getCurrentTherapist } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { EditArticleForm } from "./EditArticleForm";
import type { Article } from "@/lib/types";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const therapist = await getCurrentTherapist();
  if (!therapist) notFound();

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", therapist.id)
    .maybeSingle<Article>();

  if (!article) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">עריכת כתבה</h1>
      <EditArticleForm article={article} />
    </div>
  );
}
