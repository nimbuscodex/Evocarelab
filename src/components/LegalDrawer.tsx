/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Beaker, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { getLocalizedPath } from '../lib/i18n-utils';

export default function LegalDrawer() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const legalLinks = [
    { 
      title: t('discover_drawer.links.philosophy.title'), 
      icon: <Beaker className="w-4 h-4" />,
      to: getLocalizedPath('philosophy'),
      content: t('discover_drawer.links.philosophy.content')
    },
    { 
      title: t('discover_drawer.links.secret.title'), 
      icon: <Sparkles className="w-4 h-4" />,
      to: getLocalizedPath('secret'),
      content: t('discover_drawer.links.secret.content')
    }
  ];

  return (
    <>
      {/* Side Toggle Button ... */}
      {/* (Unchanged part ...) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-ink text-white p-3 rounded-l-xl border-l border-y border-white/10 hover:bg-gold transition-colors duration-500 shadow-2xl group flex flex-col items-center gap-2"
      >
        <Menu className="w-4 h-4" />
        <span className="[writing-mode:vertical-lr] rotate-180 text-[8px] uppercase tracking-[0.3em] font-bold py-2">{t('hero.ctaLearn')}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60]"
            />

            {/* Sidebar */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 md:w-96 bg-white z-[70] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] p-12 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-16">
                <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">{t('discover_drawer.badge')}</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-ink" />
                </button>
              </div>

              <div className="space-y-16">
                {legalLinks.map((link, i) => (
                  <div key={i} className="space-y-6">
                    <div className="flex items-center gap-4 text-ink">
                      <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-gold">
                        {link.icon}
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-widest">{link.title}</h3>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-light text-justify border-l border-neutral-100 pl-6">
                      {link.content}
                    </p>
                    <Link 
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className="text-[9px] uppercase tracking-widest text-gold font-bold border-b border-transparent hover:border-gold transition-all inline-block"
                    >
                      {t('discover_drawer.discover_more')}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-32 pt-8 border-t border-neutral-100">
                <p className="text-[9px] text-gray-300 uppercase tracking-widest leading-loose">
                  {t('discover_drawer.company')}<br />
                  {t('discover_drawer.version')}<br />
                  {t('discover_drawer.rights')}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
