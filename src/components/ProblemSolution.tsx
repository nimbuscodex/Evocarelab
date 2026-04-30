/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function ProblemSolution() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-serif mb-10 leading-tight">
              ¿Por qué conformarse con menos cuando <span className="italic text-accent">tu piel</span> merece el resplandor de la perfección?
            </h2>
            <div className="h-px w-24 bg-dark/10 mx-auto mb-10" />
            <p className="text-xl text-neutral-500 font-light leading-relaxed">
              Mientras las soluciones convencionales solo hidratan superficialmente, Evocarelab trabaja desde el interior, 
              fusionando biotecnología avanzada con ingredientes naturales de lujo para un efecto lifting inmediato y duradero.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
