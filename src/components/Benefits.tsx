/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from 'motion/react';
import { Star } from 'lucide-react';
import { useRef } from 'react';

const benefits = [
  {
    title: "Luminosidad",
    id: "01",
    description: "Brillo natural instantáneo."
  },
  {
    title: "Efecto Revitalizante",
    id: "02",
    description: "Energía celular profunda."
  },
  {
    title: "Protección Barrera",
    id: "03",
    description: "Escudo invisible ambiental."
  }
];

export default function Benefits() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax for subtle depth
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section ref={containerRef} className="py-32 overflow-hidden bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          {/* Clover Layout (Trebol de 3 hojas) */}
          <div className="relative h-[600px] flex items-center justify-center">
            {/* Horizontal Continuous Motion Wrapper */}
            <motion.div 
              animate={{ x: [-20, 20, -20] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <motion.div 
                style={{ y: parallaxY }}
                className="relative flex items-center justify-center"
              >
                {/* Central Stem */}
                <div className="absolute w-[2px] h-32 bg-gold/20 -bottom-16 rounded-full -z-10 origin-top rotate-[5deg]"></div>

                {/* Leaf 01 - Top Left Petal */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: -35 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: -15 }}
                  viewport={{ once: true }}
                  className="absolute -translate-y-28 -translate-x-24 w-60 h-60 p-10 bg-white rounded-[100%_100%_100%_10%] border border-neutral-100 flex flex-col justify-center text-center shadow-2xl hover:scale-110 transition-transform duration-700 cursor-default group z-20 origin-bottom-right"
                >
                  <span className="text-gold font-mono text-[10px] mb-2 font-bold group-hover:scale-125 transition-transform">01</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-ink mb-3 group-hover:text-gold transition-colors">{benefits[0].title}</h4>
                  <p className="text-[10px] text-gray-400 font-light leading-relaxed px-2">{benefits[0].description}</p>
                </motion.div>

                {/* Leaf 02 - Top Right Petal */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: 35 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 15 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="absolute -translate-y-28 translate-x-24 w-60 h-60 p-10 bg-white rounded-[100%_100%_10%_100%] border border-neutral-100 flex flex-col justify-center text-center shadow-2xl hover:scale-110 transition-transform duration-700 cursor-default group z-20 origin-bottom-left"
                >
                  <span className="text-gold font-mono text-[10px] mb-2 font-bold group-hover:scale-125 transition-transform">02</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-ink mb-3 group-hover:text-gold transition-colors">{benefits[1].title}</h4>
                  <p className="text-[10px] text-gray-400 font-light leading-relaxed px-2">{benefits[1].description}</p>
                </motion.div>

                {/* Leaf 03 - Bottom Center Petal */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 100 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="absolute translate-y-36 w-60 h-60 p-10 bg-white rounded-[10%_100%_100%_100%] border border-neutral-100 flex flex-col justify-center text-center shadow-2xl hover:scale-110 transition-transform duration-700 cursor-default group z-20 origin-top"
                >
                  <span className="text-gold font-mono text-[10px] mb-2 font-bold group-hover:scale-125 transition-transform">03</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-ink mb-3 group-hover:text-gold transition-colors">{benefits[2].title}</h4>
                  <p className="text-[10px] text-gray-400 font-light leading-relaxed px-2">{benefits[2].description}</p>
                </motion.div>

                {/* Energy Rings */}
                <div className="absolute w-[400px] h-[400px] border border-gold/5 rounded-full -z-10 animate-spin-slow"></div>
                <div className="absolute w-[500px] h-[500px] border border-neutral-100 rounded-full -z-20"></div>
              </motion.div>
            </motion.div>
          </div>

          {/* Testimonial Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Reseñas Reales</span>
              <h3 className="text-4xl md:text-5xl font-serif text-ink italic leading-tight">
                "La transformación de mi piel ha sido absoluta en solo 20 minutos."
              </h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-gold font-serif text-2xl italic">E</div>
              <div>
                <p className="text-sm font-bold tracking-widest text-ink uppercase">ELENA R.</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Clienta Verificada • Barcelona</p>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-gold text-gold" />)}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-100 italic text-gray-400 font-light text-sm max-w-md">
              Evaluación dermatológica basada en la regeneración dermo-epidérmica tras el uso continuado de Evocarelab Science.
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
