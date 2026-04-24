import { createClient } from "@supabase/supabase-js";
try {
  createClient("eyJhb...", "eyJhb...");
} catch (e) {
  console.log(e);
}
