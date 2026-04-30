
import i18n from 'i18next';

/**
 * Generates a localized path based on the current or target language and a route key.
 * @param routeKey The key from the 'routes' object in translations
 * @param targetLang Optional target language (defaults to current)
 * @returns The localized URL path
 */
export function getLocalizedPath(routeKey: string, targetLang?: string): string {
  const lang = targetLang || i18n.language.split('-')[0];
  const routes = i18n.getResourceBundle(lang, 'translation')?.routes || {};
  const slug = routes[routeKey];
  
  if (routeKey === 'home') return `/${lang}`;
  return `/${lang}${slug ? '/' + slug : ''}`;
}

/**
 * Translates a full URL path from one language to another
 * @param currentPath The current full path (e.g., /es/contacto)
 * @param targetLang The language to translate to (e.g., en)
 * @returns The new full path (e.g., /en/contact)
 */
export function translatePath(currentPath: string, targetLang: string): string {
  const parts = currentPath.split('/').filter(Boolean);
  if (parts.length === 0) return `/${targetLang}`;
  
  // parts[0] is the current lang prefix
  const currentLang = parts[0];
  const currentSlug = parts.slice(1).join('/');
  
  const currentRoutes = i18n.getResourceBundle(currentLang, 'translation')?.routes || {};
  const targetRoutes = i18n.getResourceBundle(targetLang, 'translation')?.routes || {};
  
  // Find the route key matching the current slug
  let routeKey = Object.keys(currentRoutes).find(key => currentRoutes[key] === currentSlug);
  
  // Special case for home
  if (!currentSlug) routeKey = 'home';
  
  if (routeKey) {
    const targetSlug = targetRoutes[routeKey];
    if (routeKey === 'home') return `/${targetLang}`;
    return `/${targetLang}${targetSlug ? '/' + targetSlug : ''}`;
  }
  
  // Fallback to just switching the language prefix if key not found
  return `/${targetLang}${currentSlug ? '/' + currentSlug : ''}`;
}
