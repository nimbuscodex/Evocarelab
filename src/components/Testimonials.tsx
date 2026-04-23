/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Elena Rodriguez",
    role: "Beauty Editor",
    quote: "Es la primera mascarilla que realmente cambia la textura de mi piel en solo 15 minutos. Imprescindible.",
    stars: 5
  },
  {
    name: "Marco V.",
    role: "Skin Enthusiast",
    quote: "Minimalismo llevado a la cosmética. Los resultados son tan limpios como su diseño.",
    stars: 5
  },
  {
    name: "Sophia Chen",
    role: "Model",
    quote: "Mi secreto antes de cada sesión de fotos. Un boost de luz que no he encontrado en ninguna otra marca.",
    stars: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-serif">Voces de la <span className="italic text-accent">comunidad</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[32px] bg-shimmer border border-neutral-100 flex flex-col"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={14} className="fill-dark text-dark" />
                ))}
              </div>
              <p className="text-lg font-light mb-8 italic leading-relaxed text-neutral-600 flex-grow">"{t.quote}"</p>
              <div>
                <p className="font-medium text-dark">{t.name}</p>
                <p className="text-xs text-accent uppercase tracking-widest mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
