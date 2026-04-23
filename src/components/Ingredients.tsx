/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const mainIngredients = [
  {
    id: "ing-1",
    name: "Hialuronato de sodio",
    highlight: "Hidratar",
    description: "Hidrata rápidamente el estrato córneo y alivia la sequedad y la tirantez de forma instantánea.",
    image: "/molécula quimica.png",
    level: "Superficie"
  },
  {
    id: "ing-2",
    name: "Ácido hialurónico hidrolizado",
    highlight: "Penetrar",
    description: "Moléculas ultra-pequeñas que penetran profundamente y aumentan el nivel de hidratación estructural.",
    image: "/acido-hialuronico.png",
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
  const [selectedId, setSelectedId] = useState<string | null>("ing-1");

  return (
    <section className="py-40 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          
          {/* Side A: The Molecular Bond Graph */}
          <div className="relative w-full lg:w-1/2 aspect-square max-w-2xl">
            {/* Background blur/glow */}
            <div className="absolute inset-0 bg-radial-[circle_at_50%_50%] from-gold/5 via-transparent to-transparent scale-150" />
            
            {/* Visual Connections (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="bond-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#C5A059" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {/* Lines from center to nodes */}
              {mainIngredients.map((ing, i) => {
                const angle = (i / mainIngredients.length) * 2 * Math.PI - (Math.PI / 2);
                const x2 = 50 + Math.cos(angle) * 35;
                const y2 = 50 + Math.sin(angle) * 35;
                return (
                  <motion.line
                    key={`line-${i}`}
                    x1="50" y1="50" x2={x2} y2={y2}
                    stroke="url(#bond-grad)"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                  />
                );
              })}
            </svg>

            {/* Central Hub */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border border-gold/20 shadow-[0_0_40px_rgba(197,160,89,0.1)] flex items-center justify-center p-6 backdrop-blur-sm"
              >
                <img src="/acido-hialuronico.png" className="w-full h-full object-contain opacity-50" />
              </motion.div>
              <div className="absolute -inset-4 border border-gold/10 rounded-full animate-ping" />
            </div>

            {/* Orbiting Ingredient Nodes */}
            {mainIngredients.map((ingredient, i) => {
              const angle = (i / mainIngredients.length) * 2 * Math.PI - (Math.PI / 2);
              const x = 50 + Math.cos(angle) * 35;
              const y = 50 + Math.sin(angle) * 35;
              const isSelected = selectedId === ingredient.id;

              return (
                <motion.div
                  key={ingredient.id}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  <button
                    onClick={() => setSelectedId(ingredient.id)}
                    className="relative group p-2"
                  >
                    <motion.div
                      animate={{ 
                        scale: isSelected ? 1.2 : 1,
                        backgroundColor: isSelected ? "#C5A059" : "#FFFFFF"
                      }}
                      className={`w-12 h-12 md:w-20 md:h-20 rounded-full border border-gold/20 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-500
                        ${isSelected ? 'shadow-gold/20 ring-4 ring-gold/5' : 'hover:scale-110 hover:border-gold/50'}
                      `}
                    >
                      <img 
                        src={ingredient.image} 
                        className={`w-3/4 h-3/4 object-contain transition-all duration-500 ${isSelected ? 'brightness-0 invert' : 'group-hover:scale-110'}`} 
                      />
                    </motion.div>
                    
                    {/* Node Label */}
                    <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-500
                      ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                    `}>
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink bg-white/80 px-3 py-1 rounded-full border border-neutral-100">
                        {ingredient.name}
                      </span>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Side B: Clinical Insight Deck */}
          <div className="flex-1 w-full max-w-xl">
            <AnimatePresence mode="wait">
              {selectedId && (
                <motion.div
                  key={selectedId}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Registro Molecular</span>
                      <div className="h-px w-20 bg-gold/20" />
                      <span className="text-[10px] uppercase font-mono text-gray-400">ID: EV-0{mainIngredients.findIndex(i => i.id === selectedId) + 1}</span>
                    </div>
                    
                    <h2 className="text-5xl md:text-6xl font-serif text-ink tracking-tight leading-tight">
                      {mainIngredients.find(i => i.id === selectedId)?.name}
                    </h2>
                    
                    <div className="flex gap-10 pt-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Impacto</p>
                        <p className="text-sm font-serif italic text-gold">{mainIngredients.find(i => i.id === selectedId)?.level}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Mecanismo</p>
                        <p className="text-sm font-serif italic text-gold">{mainIngredients.find(i => i.id === selectedId)?.highlight}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 top-0 bottom-0 w-px bg-neutral-100" />
                    <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed italic">
                      "{mainIngredients.find(i => i.id === selectedId)?.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-8">
                    <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Bio-Sinergia</p>
                      <ul className="space-y-3">
                        {secondaryIngredients.map((ing, i) => (
                          <li key={i} className="flex items-center gap-3 text-[11px] text-ink font-medium">
                            <div className="w-1 h-1 rounded-full bg-gold" />
                            {ing.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      <Link 
                        to="/ingredientes"
                        className="group inline-flex items-center gap-4 text-ink"
                      >
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold border-b border-transparent group-hover:border-gold transition-all">Ver Informe</span>
                        <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-gold group-hover:text-gold transition-all">
                          →
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Background Typography decoration */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 font-serif text-[25vh] text-neutral-50 opacity-5 pointer-events-none select-none tracking-tighter">
        MOLECULE
      </div>
    </section>
  );
}
