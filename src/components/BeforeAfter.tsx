/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, MoveHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../lib/supabase';

export default function BeforeAfter() {
  const { t } = useTranslation();
  const [sliderPos, setSliderPos] = useState(50);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  return (
    <section className="py-32 bg-white overflow-hidden" id="results">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
              <Eye size={12} className="text-gold" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold">{t('results.badge')}</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-serif text-ink tracking-tighter leading-[1.1]">
              {t('results.title')} <br />
              <span className="italic text-gray-400">{t('results.titleItalic')}</span>
            </h2>
            
            <p className="text-lg text-gray-500 font-light leading-relaxed max-w-lg">
              {t('results.description')}
            </p>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div>
                <span className="block text-4xl font-serif text-ink">+42%</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-2 block">{t('results.stat1')}</span>
              </div>
              <div>
                <span className="block text-4xl font-serif text-ink">-28%</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-2 block">{t('results.stat2')}</span>
              </div>
            </div>

            {/* Quick Proof Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-4 bg-[#fdfaf6] rounded-[32px] border border-neutral-100 flex items-center gap-4 group"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-neutral-200">
                <img src={getImageUrl("efectos.png")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Clinical Effects" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-ink mb-1">{t('results.cardTitle')}</h4>
                <p className="text-[11px] text-gray-500 font-light leading-relaxed">{t('results.cardDesc')}</p>
              </div>
            </motion.div>
          </div>

          {/* Interactive Slider */}
          <div className="lg:w-1/2 w-full">
            <div 
              className="relative aspect-[4/5] md:aspect-square rounded-[40px] overflow-hidden cursor-ew-resize select-none shadow-2xl group"
              onMouseMove={handleMove}
              onTouchMove={handleMove}
            >
              {/* After Image (Background) */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=2000&auto=format&fit=crop")' }}
              >
                <div className="absolute top-6 right-6 px-4 py-2 bg-ink/80 backdrop-blur-md rounded-full text-white text-[10px] uppercase tracking-widest font-bold">
                  {t('results.day28')}
                </div>
              </div>

              {/* Before Image (Foreground) */}
              <div 
                className="absolute inset-0 bg-cover bg-center grayscale shadow-[10px_0_30px_rgba(0,0,0,0.5)]"
                style={{ 
                  backgroundImage: 'url("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=2000&auto=format&fit=crop")',
                  clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                }}
              >
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-ink text-[10px] uppercase tracking-widest font-bold">
                  {t('results.day0')}
                </div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white/50 backdrop-blur-sm z-20 group-hover:bg-gold transition-colors"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-ink group-hover:scale-110 transition-transform">
                  <MoveHorizontal size={20} className="text-ink" />
                </div>
              </div>
            </div>
            
            <p className="text-center mt-8 text-[9px] text-gray-400 uppercase tracking-[0.4em] font-medium animate-pulse">
              {t('results.help')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
