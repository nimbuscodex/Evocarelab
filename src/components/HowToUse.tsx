/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

const steps = [
  {
    number: "01",
    title: "Preparar",
    description: "Limpia profundamente tu piel para asegurar la absorción máxima de los micronutrientes."
  },
  {
    number: "02",
    title: "Aplicar",
    description: "Extiende la mascarilla sobre el rostro limpio durante 15–20 minutos."
  },
  {
    number: "03",
    title: "Frecuencia",
    description: "Usar 2–3 veces por semana o según las necesidades específicas de tu piel."
  },
  {
    number: "04",
    title: "Revelar",
    description: "Retira y masajea el exceso de esencia para un acabado suave, relleno y luminoso."
  }
];

export default function HowToUse() {
  return (
    <section className="py-24 bg-dark text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 mb-6 block">The Ritual</span>
            <h2 className="text-4xl md:text-6xl font-serif mb-12">El arte de <br /><span className="italic text-neutral-400">cuidarte.</span></h2>
            
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
