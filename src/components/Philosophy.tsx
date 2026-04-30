/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function Philosophy() {
  return (
    <section className="py-32 bg-white flex items-center justify-center text-center">
      <div className="container mx-auto px-6">
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1.5 }}
           className="max-w-3xl mx-auto"
        >
          <h2 className="text-xs uppercase tracking-[0.5em] text-accent mb-8">Nuestra Filosofía</h2>
          <p className="text-2xl md:text-4xl font-serif italic leading-snug">
            "Creemos que el lujo real reside en la simplicidad de lo esencial y en la honestidad de lo que aplicas sobre tu piel."
          </p>
          <div className="mt-12 flex justify-center gap-12">
            <div className="flex flex-col">
               <span className="text-3xl font-serif">100%</span>
               <span className="text-[10px] uppercase tracking-widest text-accent">Orgánico</span>
            </div>
            <div className="flex flex-col">
               <span className="text-3xl font-serif">0%</span>
               <span className="text-[10px] uppercase tracking-widest text-accent">Tóxicos</span>
            </div>
            <div className="flex flex-col">
               <span className="text-3xl font-serif">∞</span>
               <span className="text-[10px] uppercase tracking-widest text-accent">Resplandor</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
