import { createClient } from "@/lib/supabase/server";
import { ConnectFlow } from "./ConnectFlow";

export default async function ConnectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: connection } = await supabase
    .from("wa_connections")
    .select("id, status, qr_code, error_message")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-md rounded-2xl border border-gold/20 bg-panel p-8 text-center">
        <h1 className="text-2xl font-bold">חיבור לוואטסאפ</h1>
        <p className="mt-2 text-sm text-foreground/70">
          לוחצים על &quot;התחברות&quot;, פותחים וואטסאפ בטלפון ←
          הגדרות ← מכשירים מקושרים ← קישור מכשיר, וסורקים את הקוד.
        </p>
        <ConnectFlow initialConnection={connection ?? null} />
      </div>
    </div>
  );
}
