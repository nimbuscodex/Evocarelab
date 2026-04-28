/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { getLocalizedPath, translatePath } from '../lib/i18n-utils';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { itemCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const currentLang = i18n.language.split('-')[0];
    const nextLang = currentLang === 'es' ? 'en' : 'es';
    
    const newPath = translatePath(location.pathname, nextLang);
    navigate(newPath);
    i18n.changeLanguage(nextLang);
  };

  const menuLinks = [
    { label: t('nav.store'), to: getLocalizedPath('product') },
    { label: t('nav.science'), to: getLocalizedPath('ingredients') },
    { label: t('nav.ritual'), to: getLocalizedPath('ritual') },
    { label: t('nav.contact'), to: getLocalizedPath('contact') }
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-[50] bg-white/80 backdrop-blur-md border-b border-gray-100/50 h-20 md:h-24 flex items-center"
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-ink p-2 -ml-2"
              aria-label="Menú"
            >
              <Menu size={24} />
            </button>

            <Link to={getLocalizedPath('home')} className="font-serif text-xl md:text-2xl text-ink leading-none relative group">
              Evocare
              <span className="text-[10px] md:text-[14px] absolute -bottom-2 md:-bottom-3 -right-2 md:-right-3 lowercase">lab</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-[10px] uppercase tracking-[0.25em] font-medium text-gray-500">
            {menuLinks.map((link) => (
              <motion.div key={link.label} initial="initial" whileHover="hover" className="relative group/nav">
                <Link 
                  to={link.to} 
                  className="relative py-2 px-6 hover:text-ink transition-colors z-10 block"
                >
                  {link.label}
                </Link>
                <motion.div
                  variants={{
                    initial: { opacity: 0, scale: 0.8, y: -5 },
                    hover: { opacity: 1, scale: 1.1, y: 0 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
                >
                  <div className="w-full h-full relative">
                    <svg 
                      viewBox="0 0 100 40" 
                      className="w-full h-full drop-shadow-[0_2px_4px_rgba(243,229,208,0.4)]"
                      preserveAspectRatio="none"
                    >
                      <path 
                        d="M 5,20 Q 20,5 50,8 Q 80,11 95,22 Q 80,35 50,32 Q 20,29 5,20" 
                        fill="#f7f0e6" 
                      />
                    </svg>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium text-gray-400 hover:text-ink transition-colors"
            >
              <Globe size={14} className="opacity-50" />
              {i18n.language.startsWith('es') ? 'EN' : 'ES'}
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-[10px] uppercase tracking-widest font-medium border-b border-ink pb-1 cursor-pointer transition-all hover:opacity-70 flex items-center gap-2"
            >
              {t('cart.bag')} ({itemCount})
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white z-[70] p-10 flex flex-col"
            >
              <div className="flex items-center justify-between mb-16">
                <Link to={getLocalizedPath('home')} onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-2xl text-ink leading-none">
                  Evocarelab
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-ink p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-8">
                {menuLinks.map((link) => (
                  <Link 
                    key={link.label}
                    to={link.to} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-serif text-ink tracking-tight hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                
                <button 
                  onClick={() => {
                    toggleLanguage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-lg font-serif text-gray-400 hover:text-ink flex items-center gap-2"
                >
                  <Globe size={18} />
                  {i18n.language.startsWith('es') ? 'English (EN)' : 'Español (ES)'}
                </button>
              </div>

              <div className="mt-auto pt-10 border-t border-gray-100 italic font-light text-gray-500 text-sm">
                {t('nav.moto')}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
