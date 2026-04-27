import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Droplets, Sparkles, Wand2, ShieldCheck, Microscope, Thermometer, FlaskConical, ChevronDown } from 'lucide-react';
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
        <section className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start py-8 lg:py-12">
          
          {/* Left: Dynamic Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 w-full max-w-2xl mx-auto lg:ml-auto lg:mr-0">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:max-h-[85vh] rounded-[32px] md:rounded-[48px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] group">
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
          <div className="lg:col-span-6 space-y-12 lg:max-w-xl lg:mr-auto lg:ml-0">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold block mb-2">Biorremodelación Dérmica</span>
              <h1 className="text-4xl lg:text-5xl xl:text-7xl font-serif text-ink leading-[1.1]">
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

            <div className="pt-2 pb-10 border-b border-neutral-100">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full relative overflow-hidden bg-black text-white py-6 px-8 sm:px-10 flex items-center justify-between group rounded-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
              >
                {/* Elegant overlay transition */}
                <div className="absolute inset-0 bg-neutral-800 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
                
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-bold relative z-10 flex items-center gap-4 transition-transform duration-500 group-hover:translate-x-2">
                  <span>Añadir al ritual</span>
                  <span className="opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 hidden sm:block">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 1L13 5M13 5L9 9M13 5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </span>
                <span className="text-[11px] sm:text-[12px] uppercase tracking-widest font-light opacity-90 relative z-10 transition-transform duration-500 group-hover:-translate-x-2">
                  {product.price.toFixed(2)}€
                </span>
              </motion.button>
              <div className="flex justify-between items-center mt-6 px-2">
                <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2 pointer-events-none"><Sparkles size={11} strokeWidth={1.5} /> Envío Expedito</span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2 pointer-events-none"><ShieldCheck size={11} strokeWidth={1.5} /> Garantía Evocare</span>
              </div>
            </div>

            <div className="pt-8">
              <h3 className="text-[9px] uppercase tracking-[0.5em] font-bold text-gray-400 mb-8 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-gray-200"></span>
                Ingredientes Activos
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { icon: <Droplets size={16} strokeWidth={1.5} />, title: "Bio-Colágeno", desc: "Hidratación profunda 200Da." },
                  { icon: <FlaskConical size={16} strokeWidth={1.5} />, title: "Hialurónico", desc: "Retiene 1000x su peso en agua." },
                  { icon: <ShieldCheck size={16} strokeWidth={1.5} />, title: "Ectoína", desc: "Escudo biológico contra luz azul y estrés ambiental." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-5 p-4 rounded-2xl hover:bg-neutral-50/80 border border-transparent hover:border-neutral-100 transition-all group cursor-default">
                    <div className="w-10 h-10 border border-neutral-200 rounded-full bg-white flex items-center justify-center text-ink shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      {item.icon}
                    </div>
                    <div className="pt-0.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink mb-1.5">{item.title}</h4>
                      <p className="text-[13px] text-gray-500 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
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
               className="relative flex items-center justify-center p-4 lg:p-8"
            >
              <div className="relative w-full max-w-lg lg:max-w-xl mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-10%] lg:inset-[-20%] border border-white/5 rounded-full"
                ></motion.div>
                <motion.div
                  className="relative z-10 w-full rounded-[32px] md:rounded-[48px] p-4 lg:p-6 shadow-[0_40px_80px_rgba(0,0,0,0.6),inset_0_2px_15px_rgba(255,255,255,0.1),inset_0_-5px_15px_rgba(0,0,0,0.5)] border border-white/10 bg-neutral-900/40 backdrop-blur-md transform-gpu"
                  style={{ transformStyle: "preserve-3d", transformPerspective: 1000 }}
                  initial={{ rotateY: -5, rotateX: 5 }}
                  animate={{ rotateY: [0, 5, 0, -5, 0], rotateX: [0, 3, 0, -3, 0], y: [0, -10, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="relative w-full aspect-[4/5] rounded-[24px] md:rounded-[36px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)] bg-neutral-800" style={{ transform: "translateZ(30px)" }}>
                    <img 
                      src="/efectos.png" 
                      className="w-full h-full object-cover" 
                      alt="Clinical Effects" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none rounded-[24px] md:rounded-[36px]"></div>
                  </div>
                </motion.div>
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

      {/* FAQ Section */}
      <FAQAccordion />
    </div>
  );
}

const faqs = [
  {
    question: "¿Cómo y cuándo debo usar la mascarilla Hialuronic Acid Mask?",
    answer: "Recomendamos usarla de 1 a 2 veces por semana, preferiblemente por la noche después de la limpieza facial. Aplícala sobre la piel seca, déjala actuar durante 15-20 minutos y retírala. Masajea el sérum restante hasta su completa absorción."
  },
  {
    question: "¿Es adecuada para mi tipo de piel?",
    answer: "Sí, su fórmula clínica avanzada y libre de irritantes ha sido diseñada para ser tolerada por todo tipo de pieles, incluyendo las más sensibles, reactivas o con tendencia acnéica."
  },
  {
    question: "¿Cuáles son los beneficios a largo plazo?",
    answer: "A corto plazo notarás una hidratación y luminosidad instantánea. A partir de las 4 semanas de uso continuo, el Bio-Colágeno y el Ácido Hialurónico Triple estimulan la producción natural de colágeno, reduciendo visiblemente las líneas de expresión y mejorando la elasticidad cutánea."
  },
  {
    question: "¿Puedo usarla junto a mis otros productos de cuidado?",
    answer: "¡Por supuesto! La mascarilla se integra perfectamente en cualquier rutina. Úsala después de tu tónico o esencia y antes de cremas hidratantes o aceites para sellar todos los activos."
  }
];

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-32 bg-white relative">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold block mb-4">Resolviendo Dudas</span>
          <h2 className="text-4xl md:text-5xl font-serif text-ink mb-6">Preguntas Frecuentes</h2>
          <p className="text-gray-500 font-light max-w-xl mx-auto">
            Todo lo que necesitas saber sobre el uso, beneficios y ciencia detrás de tu nuevo ritual de belleza.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-neutral-100 rounded-2xl overflow-hidden bg-[#fdfaf6]/50 transition-all hover:bg-[#fdfaf6] hover:shadow-sm"
            >
              <button 
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-6 md:px-8 md:py-6 text-left"
              >
                <span className="font-serif text-lg text-ink pr-8">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="shrink-0 text-ink/40"
                >
                  <ChevronDown size={20} strokeWidth={1.5} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 md:px-8 pb-6 pt-2 text-gray-500 font-light leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
