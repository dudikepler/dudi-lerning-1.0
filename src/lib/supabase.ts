import { createClient } from "@supabase/supabase-js";

// נופל חזרה לערכי placeholder כדי שהבנייה לא תיכשל לפני שמוגדרים משתני
// הסביבה האמיתיים - קריאות בפועל ל-Supabase ייכשלו בזמן ריצה עד שיוגדרו.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
