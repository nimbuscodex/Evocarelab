import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Droplets, Sparkles, Wand2, ShieldCheck, Microscope, Thermometer, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProduct } from '../hooks/useProduct';

export default function ProductDetail() {
  const { product, loading } = useProduct();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-ink border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!product) return null;

  return <ProductDetailContent product={product} />;
}

function ProductDetailContent({ product }: { product: any }) {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scienceRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scienceRef,
    offset: ["start end", "end start"]
  });

  const images = [
    '/sobre.png',
    '/caja.png',
    '/fondo blanco.png',
    '/modelo 1.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityScroll = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[currentImageIndex]
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Immersive Hero Header */}
      <div className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#fdfaf6] to-white -z-10 opacity-60"></div>
        
        {/* Back Button */}
        <div className="container mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-ink transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>

        {/* Essential Info Grid */}
        <section className="container mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-24 items-start py-8">
          
          {/* Left: Dynamic Gallery */}
          <div className="lg:col-span-7 sticky top-32">
            <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={images[currentImageIndex]}
                  src={images[currentImageIndex]} 
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-full h-full object-cover"
                  alt={product.name}
                />
              </AnimatePresence>
              
              {/* Gallery Nav Overlay */}
              <div className="absolute bottom-10 left-10 flex gap-2 z-20">
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-1 transition-all duration-500 rounded-full ${idx === currentImageIndex ? 'w-10 bg-ink' : 'w-2 bg-black/10'}`}
                  />
                ))}
              </div>

              {/* Floating Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute top-10 right-10 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/50 shadow-sm pointer-events-none"
              >
                <p className="text-[10px] uppercase tracking-widest font-bold text-ink mb-1">Authentic Lab Seal</p>
                <Sparkles size={16} className="text-gold" />
              </motion.div>
            </div>
            
            {/* Gallery Thumbnails */}
            <div className="flex gap-4 mt-8">
              {images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-ink scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Technical Specs */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold block mb-2">Biorremodelación Dérmica</span>
              <h1 className="text-5xl md:text-7xl font-serif text-ink leading-[1.1]">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 py-4 border-y border-neutral-100">
                <div className="text-2xl font-serif text-ink">{product.price.toFixed(2)}€</div>
                <div className="h-4 w-px bg-neutral-200"></div>
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => <Sparkles key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">(4.9/5 Reviews)</span>
              </div>
              <p className="text-gray-500 text-lg font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-ink">Ingredientes Clave</h3>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: <Droplets size={18} />, title: "Bio-Colágeno Marino", desc: "Absorción profunda 200Da para hidratación celular." },
                  { icon: <FlaskConical size={18} />, title: "Ácido Hialurónico Triple", desc: "Malla 3D que retiene 1000 veces su peso en agua." },
                  { icon: <ShieldCheck size={18} />, title: "Ectoína Celular", desc: "Protección frente al estrés ambiental y luz azul." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-[#fdfaf6] rounded-3xl border border-neutral-100">
                    <div className="text-ink">{item.icon}</div>
                    <div>
                      <h4 className="text-sm font-bold text-ink mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full bg-ink text-white py-6 text-[11px] uppercase tracking-[0.4em] font-bold rounded-2xl shadow-2xl hover:shadow-gray-200 transition-shadow"
              >
                Añadir al ritual — {product.price.toFixed(2)}€
              </motion.button>
              <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em]">Envío Express gratuito en 24h</p>
            </div>
          </div>
        </section>
      </div>

      {/* Advanced Science Section */}
      <section ref={scienceRef} className="py-40 bg-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/fondo-rosa.png" className="w-full h-full object-cover opacity-5 mix-blend-overlay" alt="" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <motion.span 
                style={{ opacity: opacityScroll }}
                className="inline-block px-4 py-2 bg-white/5 rounded-full text-[10px] uppercase tracking-[0.4em]"
              >
                La ciencia de la piel
              </motion.span>
              <h2 className="text-5xl md:text-6xl font-serif leading-tight italic">
                Estructura Molecular Avanzada
              </h2>
              <p className="text-gray-400 text-lg font-light leading-relaxed max-w-xl">
                Nuestra mascarilla no es una simple aplicación superficial. Es un sistema de entrega de activos patentado que interactúa con la temperatura de tu piel para una permeabilización óptima.
              </p>
              
              <div className="space-y-8 pt-8">
                {[
                  { icon: <Microscope size={24} />, title: "Tecnología Polimérica", text: "Hidrogel que se vuelve transparente a medida que los activos son absorbidos por la dermis." },
                  { icon: <Thermometer size={24} />, title: "Termo-Sensibilidad", text: "Reacciona al calor corporal para una liberación controlada y constante de nutrientes." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 max-w-lg">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-serif mb-2">{item.title}</h4>
                      <p className="text-gray-500 font-light text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div 
               style={{ y: parallaxY }}
               className="relative"
            >
              <div className="aspect-square relative flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-white/5 rounded-full"
                ></motion.div>
                <img 
                  src="/molécula quimica.png" 
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]" 
                  alt="Molecular Structure" 
                />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="absolute inset-0 bg-white/20 rounded-full blur-[100px] -z-10"
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clinical Visuals Section */}
      <section className="py-32 bg-[#fdfaf6] -mt-1 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1 relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="rounded-[32px] overflow-hidden shadow-xl aspect-[3/4]"
                >
                  <img src="/efectos.png" className="w-full h-full object-cover" alt="Clinical Effect" />
                </motion.div>
                <motion.div 
                  initial={{ y: 50 }}
                  whileInView={{ y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-[32px] overflow-hidden shadow-xl aspect-[3/4]"
                >
                  <img src="/collage.png" className="w-full h-full object-cover" alt="Collage Ritual" />
                </motion.div>
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center border border-neutral-100 shadow-2xl p-6 text-center italic font-serif text-ink z-20">
                <span className="text-3xl font-bold not-italic font-sans mb-1">98%</span>
                <span className="text-[9px] uppercase tracking-widest leading-tight">Efectividad Probada</span>
              </div>
            </div>

            <div className="flex-1 space-y-12 order-1 lg:order-2">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold block">Estudios Clínicos</span>
              <h2 className="text-5xl font-serif text-ink leading-tight">Resultados que puedes ver y sentir.</h2>
              
              <div className="space-y-8">
                {[
                  { label: "Hidratación Profunda", val: "94%", color: "bg-ink" },
                  { label: "Reducción de Líneas", val: "82%", color: "bg-gold" },
                  { label: "Elasticidad Cutánea", val: "88%", color: "bg-neutral-300" }
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-serif italic text-ink">{stat.label}</span>
                      <span className="text-lg font-bold text-ink">{stat.val}</span>
                    </div>
                    <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: stat.val }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full ${stat.color}`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-gray-400 text-sm font-light leading-relaxed max-w-lg">
                *Resultados basados en pruebas clínicas realizadas a 50 mujeres durante 4 semanas de uso continuado (2 sesiones semanales).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action */}
      <section className="py-32 container mx-auto px-6">
        <div className="bg-ink p-12 md:p-24 rounded-[64px] text-white text-center relative overflow-hidden flex flex-col items-center">
          <img src="/fondo-rosa.png" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-screen" alt="" />
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-2xl"
          >
            <p className="text-[11px] uppercase tracking-[0.5em] opacity-60 mb-10 font-bold">Tu piel merece Evocare</p>
            <h2 className="text-5xl md:text-7xl font-serif mb-12 leading-tight">Transformación desde la primera aplicación.</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
               <button 
                onClick={handleAddToCart}
                className="bg-white text-ink px-16 py-7 text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-neutral-50 transition-all hover:scale-105 active:scale-95 shadow-2xl"
               >
                 Obtener mi tratamiento
               </button>
               <span className="text-xl font-serif italic opacity-80">{product.price.toFixed(2)}€ / Unidad pack</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
