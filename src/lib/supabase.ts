import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env.local file or secrets.')
}

// Ensure the URL doesn't have the /rest/v1/ suffix for the client SDK if unnecessary
const cleanUrl = supabaseUrl?.replace(/\/rest\/v1\/?$/, '')

// Initialize only if we have the required keys to avoid a top-level crash
export const supabase = (cleanUrl && supabaseAnonKey) 
  ? createClient(cleanUrl, supabaseAnonKey)
  : null as any; 

if (!supabase) {
  console.warn('Supabase client not initialized: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}
