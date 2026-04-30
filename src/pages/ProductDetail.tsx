import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Droplets, Sparkles, Wand2, ShieldCheck, Microscope, Thermometer, FlaskConical, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useProduct } from '../hooks/useProduct';
import { supabase, getImageUrl } from '../lib/supabase';
import { getLocalizedPath } from '../lib/i18n-utils';

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
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith('es');
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPack, setSelectedPack] = useState(1);
  const scienceRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scienceRef,
    offset: ["start end", "end start"]
  });

  const packs = [
    { id: 1, name: t('pages.product.pack1'), description: t('pages.product.pack1_desc'), discount: 0, count: 1 },
    { id: 2, name: t('pages.product.pack2'), description: t('pages.product.pack2_desc'), discount: 5, count: 2 },
    { id: 3, name: t('pages.product.pack3'), description: t('pages.product.pack3_desc'), discount: 10, count: 3 },
  ];

  const currentPrice = selectedPack === 1 
    ? product.price 
    : selectedPack === 2 
      ? product.price * 0.95 
      : product.price * 0.9;
  
  const totalPrice = currentPrice * selectedPack;

  const images = [
    getImageUrl('sobre.png'),
    getImageUrl('caja.png'),
    getImageUrl('fondoblanco.png'),
    getImageUrl('modelo1.png')
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
      name: isSpanish ? product.name : "Hyaluronic Acid Mask",
      price: product.price, // Base price, context handles discount
      image: images[currentImageIndex]
    }, selectedPack);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Immersive Hero Header */}
      <div className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#fdfaf6] to-white -z-10 opacity-60"></div>
        
        {/* Back Button */}
        <div className="container mx-auto px-6 py-4">
          <Link 
            to={getLocalizedPath('home')} 
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-ink transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {t('pages.product.backToHome')}
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
                <p className="text-[10px] uppercase tracking-widest font-bold text-ink mb-1">{t('pages.product.labSeal')}</p>
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
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold block mb-2">{t('pages.product.badge')}</span>
              <h1 className="text-4xl lg:text-5xl xl:text-7xl font-serif text-ink leading-[1.1]">
                {isSpanish ? product.name : "Hyaluronic Acid Mask"}
              </h1>
              <div className="flex items-center gap-4 py-4 border-y border-neutral-100">
                <div className="text-2xl font-serif text-ink">{product.price.toFixed(2)}€</div>
                <div className="h-4 w-px bg-neutral-200"></div>
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => <Sparkles key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('pages.product.reviews')}</span>
              </div>
              <p className="text-gray-500 text-lg font-light leading-relaxed">
                {isSpanish ? product.description : "High-performance hydration treatment with bio-collagen and 200Da hyaluronic acid for structural skin revitalization."}
              </p>
            </div>
            
            {/* Pack Selection */}
            <div className="space-y-4">
              <span className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-bold block mb-4">{t('pages.product.selectRitual')}</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packs.map((pack) => {
                  const packUnitPrice = pack.id === 1 ? product.price : pack.id === 2 ? product.price * 0.95 : product.price * 0.9;
                  const isSelected = selectedPack === pack.id;
                  
                  return (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPack(pack.id)}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                        isSelected 
                        ? 'border-ink bg-neutral-50 shadow-md ring-4 ring-neutral-50' 
                        : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50/50'
                      }`}
                    >
                      {pack.discount > 0 && (
                        <div className="absolute -top-3 -right-3 bg-gold text-ink text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-sm z-10">
                          -{pack.discount}%
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <p className={`text-[10px] uppercase tracking-widest font-bold ${isSelected ? 'text-ink' : 'text-gray-400'}`}>
                          {pack.name}
                        </p>
                        <p className="text-[13px] font-serif text-ink">
                          {packUnitPrice.toFixed(2)}€ <span className="text-[10px] text-gray-400 font-sans not-italic">/u</span>
                        </p>
                      </div>
                      
                      <div className={`mt-3 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-ink border-ink' : 'bg-white border-neutral-200'
                      }`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
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
                  <span>{t('pages.product.addToRitual')}</span>
                  <span className="opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 hidden sm:block">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 1L13 5M13 5L9 9M13 5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </span>
                <span className="text-[11px] sm:text-[12px] uppercase tracking-widest font-light opacity-90 relative z-10 transition-transform duration-500 group-hover:-translate-x-2">
                  {totalPrice.toFixed(2)}€
                </span>
              </motion.button>
              <div className="flex justify-between items-center mt-6 px-2">
                <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2 pointer-events-none"><Sparkles size={11} strokeWidth={1.5} /> {t('pages.product.freeShipping')}</span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2 pointer-events-none"><ShieldCheck size={11} strokeWidth={1.5} /> {t('pages.product.guarantee')}</span>
              </div>
            </div>

            <div className="pt-8">
              <h3 className="text-[9px] uppercase tracking-[0.5em] font-bold text-gray-400 mb-8 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-gray-200"></span>
                {t('pages.product.activeIngredients')}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { icon: <Droplets size={16} strokeWidth={1.5} />, title: isSpanish ? "Bio-Colágeno" : "Bio-Collagen", desc: isSpanish ? "Hidratación profunda 200Da." : "Deep 200Da hydration." },
                  { icon: <FlaskConical size={16} strokeWidth={1.5} />, title: isSpanish ? "Hialurónico" : "Hyaluronic", desc: isSpanish ? "Retiene 1000x su peso en agua." : "Holds 1000x its weight in water." },
                  { icon: <ShieldCheck size={16} strokeWidth={1.5} />, title: "Ectoína", desc: isSpanish ? "Escudo biológico contra luz azul y estrés ambiental." : "Biological shield against blue light and environmental stress." },
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
          <img src={getImageUrl("fondo-rosa.png")} className="w-full h-full object-cover opacity-5 mix-blend-overlay" alt="" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <motion.span 
                style={{ opacity: opacityScroll }}
                className="inline-block px-4 py-2 bg-white/5 rounded-full text-[10px] uppercase tracking-[0.4em]"
              >
                {t('pages.product.scienceBadge')}
              </motion.span>
              <h2 className="text-5xl md:text-6xl font-serif leading-tight italic">
                {t('pages.product.scienceTitle')}
              </h2>
              <p className="text-gray-400 text-lg font-light leading-relaxed max-w-xl">
                {t('pages.product.scienceDesc')}
              </p>
              
              <div className="space-y-8 pt-8">
                {[
                  { icon: <Microscope size={24} />, title: t('pages.product.tech1_title'), text: t('pages.product.tech1_desc') },
                  { icon: <Thermometer size={24} />, title: t('pages.product.tech2_title'), text: t('pages.product.tech2_desc') }
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
                      src={getImageUrl("efectos.png")} 
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
                  <img src={getImageUrl("efectos.png")} className="w-full h-full object-cover" alt="Clinical Effect" />
                </motion.div>
                <motion.div 
                  initial={{ y: 50 }}
                  whileInView={{ y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-[32px] overflow-hidden shadow-xl aspect-[3/4]"
                >
                  <img src={getImageUrl("collage.png")} className="w-full h-full object-cover" alt="Collage Ritual" />
                </motion.div>
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center border border-neutral-100 shadow-2xl p-6 text-center italic font-serif text-ink z-20">
                <span className="text-3xl font-bold not-italic font-sans mb-1">98%</span>
                <span className="text-[9px] uppercase tracking-widest leading-tight">{isSpanish ? "Efectividad Probada" : "Proven Effectiveness"}</span>
              </div>
            </div>

            <div className="flex-1 space-y-12 order-1 lg:order-2">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold block">{t('pages.product.clinicalBadge')}</span>
              <h2 className="text-5xl font-serif text-ink leading-tight">{t('pages.product.clinicalTitle')}</h2>
              
              <div className="space-y-8">
                {[
                  { label: t('pages.product.stat1'), val: "94%", color: "bg-ink" },
                  { label: t('pages.product.stat2'), val: "82%", color: "bg-gold" },
                  { label: t('pages.product.stat3'), val: "88%", color: "bg-neutral-300" }
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
                {t('pages.product.clinicalFooter')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQAccordion />

      {/* Security Check Section */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-100">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-ink text-white rounded-full text-[9px] uppercase tracking-[0.3em] font-bold">
              <Microscope size={12} />
              {t('pages.product.protocolBadge')}
            </div>
            <h3 className="text-3xl font-serif text-ink italic italic">{t('pages.product.protocolTitle')}</h3>
            <p className="text-gray-500 font-light leading-relaxed">
              {t('pages.product.protocolDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const faqs_es = [
  {
    question: "¿Cómo y cuándo debo usar la mascarilla Hialuronic Acid Mask?",
    answer: "Recomendamos usarla de 1 a 2 veces por semana, preferiblemente por la noche después de la limpieza facial. Aplícala sobre la piel seca, déjala actuar durante 15-20 minutos, retírala y aclara suavemente el rostro con agua tibia."
  },
  {
    question: "¿Es adecuada para mi tipo de piel?",
    answer: "Nuestra fórmula es de grado clínico y está diseñada para la máxima tolerancia. Sin embargo, dado que cada piel es un ecosistema biológico único, recomendamos aplicar una pequeña gota detrás del lóbulo de la oreja y esperar 2 horas. Si no hay reactividad, disfruta del ritual con total seguridad."
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

const faqs_en = [
  {
    question: "How and when should I use the Hyaluronic Acid Mask?",
    answer: "We recommend using it 1 to 2 times a week, preferably at night after facial cleansing. Apply it to dry skin, let it act for 15-20 minutes, remove it, and gently rinse your face with lukewarm water."
  },
  {
    question: "Is it suitable for my skin type?",
    answer: "Our clinical-grade formula is designed for maximum tolerance. However, since every skin is a unique biological ecosystem, we recommend applying a small drop behind the earlobe and waiting 2 hours. If there is no reactivity, enjoy the ritual with total safety."
  },
  {
    question: "What are the long-term benefits?",
    answer: "In the short term, you will notice instant hydration and luminosity. After 4 weeks of continuous use, the Bio-Collagen and Triple Hyaluronic Acid stimulate natural collagen production, visibly reducing expression lines and improving skin elasticity."
  },
  {
    question: "Can I use it with my other skincare products?",
    answer: "Of course! The mask integrates perfectly into any routine. Use it after your toner or essence and before moisturizers or oils to seal in all the active ingredients."
  }
];

function FAQAccordion() {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith('es');
  const faqs = isSpanish ? faqs_es : faqs_en;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-32 bg-white relative">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold block mb-4">{t('pages.product.faqBadge')}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-ink mb-6">{t('pages.product.faqTitle')}</h2>
          <p className="text-gray-500 font-light max-w-xl mx-auto">
            {t('pages.product.faqDesc')}
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
