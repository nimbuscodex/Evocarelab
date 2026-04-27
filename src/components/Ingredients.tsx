/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../lib/supabase';

const mainIngredients = [
  {
    id: "ing-1",
    name: "Hialuronato de sodio",
    highlight: "Hidratar",
    description: "Hidrata rápidamente el estrato córneo y alivia la sequedad y la tirantez de forma instantánea.",
    image: getImageUrl("molécula quimica.png"),
    level: "Superficie"
  },
  {
    id: "ing-2",
    name: "Ácido hialurónico hidrolizado",
    highlight: "Penetrar",
    description: "Moléculas ultra-pequeñas que penetran profundamente y aumentan el nivel de hidratación estructural.",
    image: getImageUrl("acido-hialuronico.png"),
    level: "Profundo"
  },
  {
    id: "ing-3",
    name: "Hialuronato de sodio acetilado",
    highlight: "Retener",
    description: "Mejora la adhesión a la piel y la capacidad de retención de humedad, prolongando el efecto hidratante.",
    image: "https://png.pngtree.com/png-vector/20231229/ourlarge/pngtree-molecule-3d-physics-png-image_11244259.png",
    level: "Prolongado"
  }
];

const secondaryIngredients = [
  { name: "β-glucano", benefit: "Calma y fortalece la barrera" },
  { name: "Trehalosa", benefit: "Reduce la pérdida de agua" },
  { name: "Glicosaminoglicanos", benefit: "Elasticidad e hidratación" }
];

export default function Ingredients() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // For infinite carousel effect
  const carouselImages = [...mainIngredients, ...mainIngredients, ...mainIngredients];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-16 relative z-50">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-4 block"
          >
            Ciencia de Vanguardia
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-ink leading-tight mb-4"
          >
            Sistema de <span className="italic font-light">Pureza Molecular.</span>
          </motion.h2>
        </div>
      </div>

      {/* Infinite Scrolling Carousel */}
      <div className="relative flex overflow-hidden py-24 bg-neutral-50/50 border-y border-neutral-100">
        <motion.div 
          className="flex gap-12 whitespace-nowrap px-6"
          animate={{ x: [0, -1920] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {carouselImages.map((ingredient, idx) => (
            <motion.div 
              key={`${ingredient.id}-${idx}`}
              className="flex-shrink-0 w-[300px] md:w-[500px]"
              animate={{ 
                y: [0, -30, 0, 30, 0] 
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: idx * 0.6 
              }}
            >
              <div className="relative aspect-[4/3] rounded-[60px] overflow-hidden bg-white shadow-sm border border-neutral-100 group">
                <img 
                  src={ingredient.image} 
                  alt={ingredient.name}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-ink/5 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/90 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 border border-white/50">
                  <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1">{ingredient.highlight}</p>
                  <p className="text-sm font-serif text-ink">{ingredient.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="container mx-auto px-6 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Link 
            to="/ingredientes"
            className="group flex flex-col items-center gap-4 text-center"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-gold transition-all duration-500">
                <span className="text-2xl group-hover:text-gold transition-all group-hover:translate-x-1">→</span>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-gold/20 -m-2"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink group-hover:text-gold transition-colors block">
                Descubrir más
              </span>
              <span className="text-[9px] text-gray-400 italic">Explora la tecnología molecular completa</span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
