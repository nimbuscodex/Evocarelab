/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function HowToUse() {
  const { t } = useTranslation();

  const steps = [
    {
      number: "00",
      title: t('howtouse.step0_title'),
      description: t('howtouse.step0_desc')
    },
    {
      number: "01",
      title: t('howtouse.step1_title'),
      description: t('howtouse.step1_desc')
    },
    {
      number: "02",
      title: t('howtouse.step2_title'),
      description: t('howtouse.step2_desc')
    },
    {
      number: "03",
      title: t('howtouse.step3_title'),
      description: t('howtouse.step3_desc')
    },
    {
      number: "04",
      title: t('howtouse.step4_title'),
      description: t('howtouse.step4_desc')
    }
  ];

  return (
    <section className="py-24 bg-dark text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 mb-6 block">{t('howtouse.badge')}</span>
            <h2 className="text-4xl md:text-6xl font-serif mb-12">{t('howtouse.title')}<br /><span className="italic text-neutral-400">{t('howtouse.titleItalic')}</span></h2>
            
            <div className="space-y-12">
              {steps.map((step, index) => (
                <motion.div 
                   key={index}
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: index * 0.1 }}
                   className="flex gap-8 group"
                >
                  <span className="text-2xl font-serif italic text-neutral-600 group-hover:text-white transition-colors duration-500">{step.number}</span>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                    <p className="text-neutral-400 font-light leading-relaxed max-w-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 1.2 }}
               className="aspect-[4/5] bg-neutral-900 rounded-[60px] overflow-hidden"
            >
               <img 
                 src="https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=1000&auto=format&fit=crop&v=1.0" 
                 alt="Ritual Evocarelab"
                 className="w-full h-full object-cover transition-all duration-1000"
                 loading="eager"
               />
            </motion.div>
            
            <div className="absolute -top-10 -right-10 w-40 h-40 border border-white/10 rounded-full animate-spin-slow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
