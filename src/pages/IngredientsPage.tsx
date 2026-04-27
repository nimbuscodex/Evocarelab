/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { motion } from 'motion/react';
import IngredientsCarousel from '../components/IngredientsCarousel';

export default function IngredientsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 bg-white">
      {/* Editorial Header */}
      <section className="py-24 border-b border-neutral-100 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-6 block"
              >
                Ingredientes Activos
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-serif text-ink leading-[0.9] tracking-tight"
              >
                Pureza <br />
                <span className="italic font-light opacity-60">molecular.</span>
              </motion.h1>
            </div>
            <div className="lg:col-span-5 pb-4">
              <motion.p 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-500 font-light leading-relaxed text-lg italic border-l border-gold pl-8"
              >
                "Nuestra búsqueda nos llevó desde los laboratorios más avanzados de Suiza hasta los ecosistemas más resilientes del planeta. El resultado es una sinergia perfecta entre ciencia y alma botánica."
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      <IngredientsCarousel />
    </div>
  );
}
