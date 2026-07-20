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

export const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const normalizedPath = cleanPath.toLowerCase().replace(/[\s_-]/g, '');

  // Local assets mapping to ensure they are loaded instantly without needing Supabase storage setup
  const localImagesMap: Record<string, string> = {
    'sobre.png': '/sobre.png',
    'caja.png': '/caja.png',
    'fondoblanco.png': '/fondo blanco.png',
    'fondoblanco': '/fondo blanco.png',
    'fondo-rosa.png': '/fondo-rosa.png',
    'fondorosa.png': '/fondo-rosa.png',
    'fondorosa': '/fondo-rosa.png',
    'modelo1.png': '/modelo 1.png',
    'modelo1': '/modelo 1.png',
    'moleculaquimica.png': '/molécula quimica.png',
    'moleculaquimica': '/molécula quimica.png',
    'hialuronatodesodio.png': '/molécula quimica.png',
    'hialuronatodesodio': '/molécula quimica.png',
    'acido-hialuronico.png': '/acido-hialuronico.png',
    'acidohialuronico.png': '/acido-hialuronico.png',
    'collage.png': '/collage.png',
    'efectos.png': '/efectos.png',
    'ritual01.png': '/ritual 01.png',
    'ritual02.png': '/ritual 02.png',
    'ritual03.png': '/ritual 03.png',
    'ritual04.png': '/ritual 04.png',
    'ritual01': '/ritual 01.png',
    'ritual02': '/ritual 02.png',
    'ritual03': '/ritual 03.png',
    'ritual04': '/ritual 04.png'
  };

  const matchedLocalPath = localImagesMap[normalizedPath] || localImagesMap[cleanPath];
  if (matchedLocalPath) {
    return matchedLocalPath;
  }
  
  const encodedPath = encodeURI(cleanPath);
  return supabase.storage.from('product-images').getPublicUrl(encodedPath).data.publicUrl;
};
