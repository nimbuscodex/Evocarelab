import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DiscountPopup() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const discountCode = 'EVO10';

  useEffect(() => {
    // Check if the user has already seen the popup
    const hasSeenPopup = localStorage.getItem('hasSeenDiscountPopup');
    
    if (!hasSeenPopup) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenDiscountPopup', 'true');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="fixed inset-0 bg-ink/70 z-[100] backdrop-blur-md"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          
          {/* Popup Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl bg-white rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row pointer-events-auto min-h-[500px]"
            >
              {/* Image Section - WIDER (65%) */}
              <div className="relative w-full md:w-[65%] h-72 md:h-auto overflow-hidden">
                <img 
                  src="https://iiuxmreplcrjqmsprzvk.supabase.co/storage/v1/object/public/product-images/fondoEVO10.png" 
                  alt="Evocarelab Experience"
                  className="absolute inset-0 w-full h-full object-cover object-[15%_center] grayscale-[10%] hover:scale-110 transition-transform duration-[10s] ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/5" />
                
                {/* Mobile Branding Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white md:hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={10} className="text-gold" />
                    <span className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-80">{t('discount_popup.title')}</span>
                  </div>
                  <h3 className="text-3xl font-serif leading-tight italic">{t('discount_popup.subtitle')}</h3>
                </div>
              </div>

              {/* Content Section - NARROWER (35%) */}
              <div className="relative w-full md:w-[35%] p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white">
                <button 
                  onClick={closePopup}
                  className="absolute top-6 right-6 p-2 text-ink/20 hover:text-ink hover:bg-neutral-100 transition-all rounded-full"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="hidden md:block space-y-3 mb-10">
                  <div className="flex items-center gap-3 text-gold">
                    <Sparkles size={14} className="animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.6em] font-bold">{t('discount_popup.title')}</span>
                  </div>
                  <h3 className="text-4xl lg:text-6xl font-serif text-ink tracking-tighter leading-none italic">
                    {t('discount_popup.subtitle')}
                  </h3>
                </div>

                <p className="text-gray-500 font-light leading-relaxed mb-10 md:text-lg lg:text-xl">
                  {t('discount_popup.description')}
                </p>

                <div className="space-y-6">
                  <div className="group relative">
                    <div className="absolute -top-2.5 left-6 px-3 bg-white text-[9px] uppercase tracking-widest text-gold font-bold z-10">
                      {t('discount_popup.codeLabel')}
                    </div>
                    <div className="flex items-center justify-between p-6 bg-neutral-50 border border-neutral-100 rounded-2xl group-hover:border-gold/30 transition-all duration-500">
                      <span className="font-mono text-2xl lg:text-3xl font-bold tracking-[0.2em] text-ink">{discountCode}</span>
                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-gold hover:text-ink transition-all shadow-xl shadow-ink/10 active:scale-95"
                      >
                        {copied ? (
                          <><CheckCircle className="w-4 h-4" /> {t('discount_popup.copied')}</>
                        ) : (
                          <><Copy className="w-4 h-4" /> {t('discount_popup.copy')}</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <button
                      onClick={closePopup}
                      className="w-full py-6 bg-gold text-ink text-[10px] uppercase tracking-[0.5em] font-bold rounded-2xl shadow-2xl shadow-gold/20 hover:shadow-gold/40 hover:-translate-y-1 transition-all active:translate-y-0"
                    >
                      {t('discount_popup.continue')}
                    </button>
                    <button
                      onClick={closePopup}
                      className="w-full text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold hover:text-ink transition-colors py-2"
                    >
                      {t('discount_popup.noThanks')}
                    </button>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-100 flex items-center justify-center gap-6 opacity-20">
                  <div className="h-px w-8 bg-ink" />
                  <span className="text-[8px] uppercase tracking-[1.5em] font-bold">EVOCARELAB</span>
                  <div className="h-px w-8 bg-ink" />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
