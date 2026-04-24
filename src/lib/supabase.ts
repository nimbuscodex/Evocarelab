/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env.local file or secrets.')
}

// Ensure the URL doesn't have the /rest/v1/ suffix for the client SDK if unnecessary
const cleanUrl = supabaseUrl?.replace(/\/rest\/v1\/?$/, '')

let finalUrl = cleanUrl || 'https://placeholder.supabase.co';
try {
  new URL(finalUrl);
} catch (error) {
  console.warn('Invalid Supabase URL provided. Falling back to placeholder.');
  finalUrl = 'https://placeholder.supabase.co';
}

export const supabase = createClient(
  finalUrl,
  supabaseAnonKey || 'placeholder-anon-key'
)
