/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../lib/supabase';
import { getLocalizedPath } from '../lib/i18n-utils';

export default function Ritual() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

  const ritualSteps = [
    {
      title: t('pages.ritual.step1_title'),
      subtitle: t('pages.ritual.step1_subtitle'),
      description: t('pages.ritual.step1_desc'),
      image: getImageUrl("ritual01.png")
    },
    {
      title: t('pages.ritual.step2_title'),
      subtitle: t('pages.ritual.step2_subtitle'),
      description: t('pages.ritual.step2_desc'),
      image: getImageUrl("ritual02.png")
    },
    {
      title: t('pages.ritual.step3_title'),
      subtitle: t('pages.ritual.step3_subtitle'),
      description: t('pages.ritual.step3_desc'),
      image: getImageUrl("ritual03.png")
    },
    {
      title: t('pages.ritual.step4_title'),
      subtitle: t('pages.ritual.step4_subtitle'),
      description: t('pages.ritual.step4_desc'),
      image: getImageUrl("ritual04.png")
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section ... */}
      {/* (Unchanged part ...) */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-pearl/30">
        <div className="relative z-10 text-center space-y-8 px-6">
          <motion.span 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] uppercase tracking-[0.8em] text-ink/60 font-bold block"
          >
            {t('pages.ritual.badge')}
          </motion.span>
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-6xl md:text-9xl font-serif text-ink tracking-tighter"
          >
            {t('pages.ritual.title')}<span className="italic font-light text-gold">{t('pages.ritual.titleItalic')}</span>{t('pages.ritual.subtitle')}
          </motion.h1>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="w-32 h-px bg-gold/50 mx-auto origin-center"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] text-ink/30 uppercase tracking-widest">{t('pages.ritual.scrollDown')}</span>
          <div className="w-px h-12 bg-neutral-200"></div>
        </motion.div>
      </section>

      {/* Steps Section */}
      <section ref={containerRef} className="relative py-24 md:py-48 bg-white overflow-hidden">

        <div className="container mx-auto px-6 relative z-10">
          <div className="space-y-[60vh] md:space-y-[120vh]">
            {ritualSteps.map((step, index) => {
              // Reduced winding offset on mobile to prevent clipping
              const footIndexForStep = (index * 22) + 12;
              const windingX = typeof window !== 'undefined' && window.innerWidth < 768 
                ? 0 
                : Math.sin(footIndexForStep * 0.3) * 80;
              
              return (
                <div 
                  key={index} 
                  style={{ 
                    transform: `translateX(${windingX}px)`,
                    opacity: useTransform(smoothProgress, [index*0.2, index*0.2 + 0.1, index*0.2 + 0.25], [0, 1, 0.8])
                  }}
                  className={`flex flex-col md:flex-row items-center gap-12 md:gap-32 min-h-[70vh] md:min-h-screen ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''} transition-all duration-1000 ease-out`}
                >
                  
                  {/* Silhouette & Visuals */}
                  <div className="w-full md:w-3/5 relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, rotateY: 45 }}
                      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                      viewport={{ once: false, margin: "-10%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="relative aspect-square md:aspect-[4/5] rounded-[40px] md:rounded-[80px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-neutral-100/50"
                    >
                      <img 
                        src={step.image} 
                        alt={step.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-[3s]"
                      />
                      <div className="absolute inset-0 bg-ink/5 mix-blend-overlay"></div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="w-full md:w-2/5 space-y-8 md:space-y-12 text-center md:text-left">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, margin: "-10%" }}
                      className="space-y-6 md:space-y-10"
                    >
                      <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6">
                        <div className="w-12 md:w-16 h-px bg-gold/40"></div>
                        <span className="text-gold font-mono tracking-[0.4em] text-[10px] uppercase font-bold">{step.subtitle}</span>
                      </div>
                      <div className="space-y-2 md:space-y-4">
                        <h2 className="text-4xl md:text-6xl font-serif text-ink tracking-tighter leading-tight">
                          {step.title}<span className="text-gold opacity-50">.</span>
                        </h2>
                        <div className="w-16 md:w-20 h-1 bg-gold/10 rounded-full mx-auto md:mx-0"></div>
                      </div>
                      <p className="text-base md:text-xl text-gray-500 font-light leading-relaxed text-justify md:text-left max-w-[95%] mx-auto md:mx-0">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Check Section (Patch Test) */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-100 italic">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-ink text-white rounded-full text-[9px] uppercase tracking-[0.3em] font-bold">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              {t('pages.ritual.safety_badge')}
            </div>
            <h3 className="text-4xl font-serif text-ink tracking-tight">{t('pages.ritual.safety_title')}<span className="text-gold">{t('pages.ritual.safety_titleGold')}</span>.</h3>
            <p className="text-lg text-gray-500 font-light leading-relaxed">
              {t('pages.ritual.safety_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Completion Section */}
      <section className="py-48 bg-ink text-center">
        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
             <span className="text-gold text-[10px] uppercase tracking-[0.5em] font-bold">{t('pages.ritual.final_badge')}</span>
             <h3 className="text-5xl md:text-7xl font-serif text-white tracking-tighter italic">{t('pages.ritual.final_title')}</h3>
             <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
               {t('pages.ritual.final_desc')}
             </p>
          </motion.div>
          
          <div className="pt-12">
             <button 
               onClick={() => navigate(getLocalizedPath('product'))}
               className="px-16 py-6 bg-gold text-ink text-xs uppercase tracking-[0.4em] font-bold hover:bg-white transition-all rounded-full shadow-2xl"
             >
                {t('pages.ritual.final_cta')}
             </button>
          </div>
        </div>
      </section>
    </div>
  );
}
