import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Separate client for admin/staff — uses different localStorage key
// so admin login never affects customer session on the website
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storageKey: "bg_admin_session",
  },
});
