import { createClient } from "@supabase/supabase-js";
try {
  createClient("eyJhb...", "eyJhb...");
  console.log("Success");
} catch (e) {
  console.log("Error:", e.message);
}
