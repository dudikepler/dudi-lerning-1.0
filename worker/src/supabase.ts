import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Service-role client: bypasses RLS. Only ever runs inside this trusted
 * worker process, never exposed to the browser or the Next.js app.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
