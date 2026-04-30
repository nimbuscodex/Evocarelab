
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGS = ['es', 'en'];

export default function LanguageHandler({ children }: { children: React.ReactNode }) {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGS.includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    } else if (location.pathname === '/') {
      // Default to 'es' if at root
      navigate('/es', { replace: true });
    } else if (!lang || !SUPPORTED_LANGS.includes(lang)) {
        // If lang is missing or invalid, try to detect or fallback
        const currentLang = i18n.language.split('-')[0];
        const detectedLang = SUPPORTED_LANGS.includes(currentLang) ? currentLang : 'es';
        
        // Only redirect if we haven't already prefixed it
        const hasLangPrefix = SUPPORTED_LANGS.some(l => location.pathname.startsWith(`/${l}`));
        if (!hasLangPrefix) {
             navigate(`/${detectedLang}${location.pathname}`, { replace: true });
        }
    }
  }, [lang, i18n, navigate, location.pathname]);

  return <>{children}</>;
}
