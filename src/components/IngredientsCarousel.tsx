/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../lib/supabase';

const mainIngredients = [
  {
    name: "Hialuronato de sodio",
    highlight: "Hidratar",
    description: "Su estructura de alto peso molecular forma una película viscoelástica no oclusiva en la superficie epidérmica, regulando de forma inteligente la evaporación del agua transepidérmica y proporcionando un alivio higroscópico inmediato.",
    image: getImageUrl("molécula quimica.png"),
    level: "Superficie",
    benefit: "Barrera hídrica"
  },
  {
    name: "Ácido hialurónico hidrolizado",
    highlight: "Penetrar",
    description: "Nano-moléculas de bajo peso molecular que atraviesan la barrera lipídica para interactuar con los queratinocitos profundos, estimulando la síntesis biológica de colágeno y elastina.",
    image: getImageUrl("acido-hialuronico.png"),
    level: "Profundo",
    benefit: "Renovación endógena"
  },
  {
    name: "Hialuronato de sodio acetilado",
    highlight: "Retener",
    description: "Conocido como 'Súper Ácido Hialurónico', su modificación acetilada incremente la afinidad lipofílica, permitiendo un anclaje molecular que duplica la retención hídrica y repara la cohesión celular.",
    image: "https://png.pngtree.com/png-vector/20231229/ourlarge/pngtree-molecule-3d-physics-png-image_11244259.png",
    level: "Prolongado",
    benefit: "Adhesión cutánea"
  }
];

const secondaryIngredients = [
  { 
    name: "β-glucano", 
    role: "Inmunomodulador Celular",
    description: "Derivado de levaduras biotecnológicas, este polisacárido actúa mediante la activación de receptores Dectin-1 en macrófagos. Estudios clínicos demuestran una aceleración del 30% en la reparación del estrato córneo y una reducción significativa de la pérdida de agua transepidérmica (TEWL).",
    data: "Refueza la inmunidad cutánea innata"
  },
  { 
    name: "Trehalosa", 
    role: "Chaperona Osmoprotectora",
    description: "Una molécula de 'supervivencia' que sustituye el agua en las membranas celulares durante el estrés hídrico extremo. Su estructura química previene la desnaturalización de proteínas estructurales, actuando como un escudo protector contra la agregación celular.",
    data: "Preservación de la integridad biomolecular"
  },
  { 
    name: "Glicosaminoglicanos", 
    role: "Soporte de Matriz Extracelular",
    description: "Componentes fundamentales del andamiaje dérmico. Actúan como precursores biológicos que aumentan la densidad de la matriz extracelular, mejorando la turgencia y la elasticidad mediante la estabilización de las fibras de colágeno y elastina.",
    data: "Redensificación tisular profunda"
  }
];

function IngredientSection({ ingredient, index }: { ingredient: any, index: number, key?: any }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax offsets: text and image move in opposite horizontal directions as you scroll
  const textX = useTransform(scrollYProgress, [0, 1], index % 2 === 0 ? [80, -80] : [-80, 80]);
  const imageX = useTransform(scrollYProgress, [0, 1], index % 2 === 0 ? [-40, 40] : [40, -40]);

  return (
    <div ref={containerRef} className="relative py-32 md:py-48 overflow-visible">
      <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-0`}>
        {/* Visual Section */}
        <motion.div 
          style={{ x: imageX }}
          className="w-full md:w-3/5 z-10"
        >
          <div className="relative group p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative aspect-[4/3] md:aspect-[16/10] bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-neutral-100/50"
            >
              <img 
                src={ingredient.image} 
                alt={ingredient.name}
                className={`w-full h-full transition-all duration-[3s] group-hover:scale-110 ${
                  ingredient.name.includes("hialurónico") || ingredient.name.includes("sodio") 
                    ? "object-contain p-6 md:p-12 lg:p-20" 
                    : "object-cover"
                }`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-ink/5 mix-blend-multiply opacity-20 group-hover:opacity-10 transition-opacity"></div>
            </motion.div>
            
            {/* Geometric Accent */}
            <div className={`absolute -z-10 top-1/2 -translate-y-1/2 w-64 h-64 border border-gold/10 rounded-full blur-2xl ${index % 2 === 0 ? '-left-12' : '-right-12'}`}></div>
          </div>
        </motion.div>

        {/* Overlapping Transcription Section */}
        <motion.div 
          style={{ x: textX }}
          className={`w-full md:w-1/2 z-20 md:relative ${index % 2 === 0 ? 'md:-ml-40' : 'md:-mr-40'}`}
        >
          <motion.div 
            initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="p-10 md:p-16 bg-white/90 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/50"
          >
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-mono text-gold font-bold tracking-[0.5em]">0{index + 1}</span>
                  <span className="w-12 h-px bg-gold/20"></span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-bold">{ingredient.level}</span>
                </div>
                
                <h4 className="text-4xl md:text-5xl font-serif text-ink leading-tight">
                  {ingredient.name}
                </h4>
                
                <div className="flex items-center gap-4 text-gold">
                  <div className="w-2 h-2 rounded-full bg-gold/40 animate-pulse"></div>
                  <span className="text-[11px] uppercase tracking-[0.3em] font-bold italic">{ingredient.highlight}</span>
                </div>
              </div>

              <p className="text-lg text-gray-500 font-light leading-relaxed text-justify italic">
                "{ingredient.description}"
              </p>
              
              <div className="pt-4 flex items-center justify-between border-t border-neutral-100/50">
                <div className="space-y-1">
                   <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Bio-Mecanismo</p>
                   <p className="text-sm font-serif text-ink">{ingredient.benefit}</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center text-gold/20 font-serif italic text-xl">
                  {index % 2 === 0 ? 'α' : 'β'}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function IngredientsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % mainIngredients.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + mainIngredients.length) % mainIngredients.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white overflow-hidden">
      {/* Ingredients Hero Carousel */}
      <div className="relative h-[80vh] md:h-[90vh] bg-ink flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img 
              src={mainIngredients[currentSlide].image} 
              alt={mainIngredients[currentSlide].name}
              className="w-full h-full object-cover opacity-40 grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-transparent to-ink/20"></div>
          </motion.div>
        </AnimatePresence>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <span className="w-12 h-px bg-gold"></span>
                <span className="text-gold text-[10px] uppercase tracking-[0.5em] font-bold">
                  Ingrediente Maestro {currentSlide + 1}/{mainIngredients.length}
                </span>
              </div>
              
              <h2 className="text-5xl md:text-8xl font-serif text-white leading-tight">
                {mainIngredients[currentSlide].name.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 !== 0 ? "italic font-light opacity-80" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h2>
              
              <p className="text-xl text-gray-300 font-light max-w-2xl leading-relaxed">
                {mainIngredients[currentSlide].description}
              </p>

              <div className="flex items-center gap-12 pt-8">
                <div>
                  <p className="text-[10px] uppercase text-gray-500 tracking-widest mb-1">Acción</p>
                  <p className="text-white font-medium italic">{mainIngredients[currentSlide].highlight}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 tracking-widest mb-1">Beneficio</p>
                  <p className="text-white font-medium italic">{mainIngredients[currentSlide].benefit}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-12 right-12 flex items-center gap-6 z-20">
          <button 
            onClick={prevSlide}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-ink transition-all active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-ink transition-all active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-12 flex gap-4 z-20">
          {mainIngredients.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 transition-all duration-500 ${i === currentSlide ? "w-12 bg-gold" : "w-6 bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      </div>

      {/* Structural Redesign of the Detailed Section */}
      <div className="py-24 bg-white relative">

        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[10px] uppercase tracking-[0.8em] text-gold font-bold mb-6 block"
            >
              Arquitectura Celular
            </motion.span>
            <h3 className="text-5xl md:text-8xl font-serif text-ink mb-12 tracking-tighter">
              Tratamiento <br /> <span className="italic font-light">Multi-Nivel.</span>
            </h3>
            <div className="w-32 h-px bg-gold/30 mx-auto"></div>
          </div>

          <div className="max-w-7xl mx-auto">
            {mainIngredients.map((ingredient, index) => (
              <IngredientSection key={index} ingredient={ingredient} index={index} />
            ))}
          </div>

          {/* Technical Data Cards Section */}
          <div className="mt-48 max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-4 block">Matriz de Soporte Biológico</span>
              <h3 className="text-4xl md:text-5xl font-serif text-ink tracking-tight">Complejo de <span className="italic font-light">Bio-Nutrientes.</span></h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {secondaryIngredients.map((ing, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-neutral-100 rounded-[3rem] p-10 flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 group"
                >
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-shimmer flex items-center justify-center font-serif text-gold text-xl">
                      {i + 1}
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-gray-300 font-mono">ID: SUP-0{i+1}</span>
                  </div>

                  <div className="space-y-2 mb-8">
                    <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold">{ing.role}</h5>
                    <h4 className="text-3xl font-serif text-ink group-hover:text-gold transition-colors">{ing.name}</h4>
                  </div>

                  <div className="flex-grow space-y-6">
                    <div className="h-px w-full bg-neutral-100"></div>
                    <p className="text-gray-500 font-light leading-relaxed text-sm text-justify">
                      {ing.description}
                    </p>
                  </div>

                  <div className="mt-12 p-6 bg-neutral-50 rounded-2.5xl border border-neutral-100 group-hover:border-gold/20 transition-colors">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">Evidencia Clínica</p>
                    <p className="text-xs text-ink font-medium leading-relaxed italic">
                      "{ing.data}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="mt-24 text-center"
            >
              <div className="inline-block px-10 py-4 border border-neutral-100 rounded-full bg-white shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">
                  Sinergia Molecular Validada por <span className="text-gold">Evocarelab Research</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
