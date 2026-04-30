/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedPath } from '../lib/i18n-utils';

export default function CookieGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [consent, setConsent] = useState<'accepted' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedConsent = localStorage.getItem('evocare-consent');
    if (savedConsent) {
      setConsent(savedConsent as any);
    }
    setLoading(false);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('evocare-consent', 'accepted');
    setConsent('accepted');
  };

  const handleReject = () => {
    localStorage.setItem('evocare-consent', 'rejected');
    setConsent('rejected');
  };

  if (loading) return null;

  return (
    <>
      {children}
      
      <AnimatePresence>
        {consent === null && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="bg-ink/95 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                {/* Subtle light effect */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <Shield className="text-gold" size={14} />
                      <span className="text-gold text-[9px] uppercase tracking-[0.4em] font-bold">{t('cookies.badge')}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif text-white tracking-tight">{t('cookies.title')}</h2>
                    <p className="text-sm text-gray-400 font-light leading-relaxed max-w-2xl">
                      {t('cookies.description')}
                      <a href={getLocalizedPath('privacy')} className="ml-1 text-gold hover:underline underline-offset-4 decoration-gold/30">{t('footer.cookies')}</a>.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                    <button 
                      onClick={handleAccept}
                      className="group px-8 py-3 bg-gold text-ink text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      {t('cookies.accept')}
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                      onClick={handleReject}
                      className="px-8 py-3 border border-white/10 text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/5 hover:text-white transition-all rounded-full"
                    >
                      {t('cookies.reject')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {consent === 'rejected' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setConsent(null)}
            className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-ink border border-white/10 rounded-full flex items-center justify-center text-gold shadow-lg hover:bg-white/5 transition-all"
            title={t('cookies.config')}
          >
            <Shield size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
