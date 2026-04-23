import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, Check, Droplets, Sparkles, Wand2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { addItem } = useCart();
  const scienceRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scienceRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const handleAddToCart = () => {
    addItem({
      id: "triple-h-mask-1",
      name: "Triple Hyaluronic Acid Mask",
      price: 29.95,
      image: "https://www.kiyobeauty.com/cdn/shop/files/biodance-bio-collagen-real-deep-mask-1pc-PURESEOUL-UK-KBeauty-shop-2_1800x1800_0d187b16-fead-4418-b39a-2debfafbc0c3.webp?v=1756371372&width=1500"
    });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {/* Back Button */}
      <div className="container mx-auto px-6 py-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center py-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-[4/5] rounded-[40px] overflow-hidden bg-neutral-100 shadow-2xl">
            <img 
              src="https://www.kiyobeauty.com/cdn/shop/files/biodance-bio-collagen-real-deep-mask-1pc-PURESEOUL-UK-KBeauty-shop-2_1800x1800_0d187b16-fead-4418-b39a-2debfafbc0c3.webp?v=1756371372&width=1500" 
              className="w-full h-full object-cover"
              alt="Bio-Collagen Mask"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#fdfaf6] rounded-full flex items-center justify-center p-8 shadow-xl border border-neutral-100 italic font-serif text-ink text-center">
            Resultados visibles desde la 1ª sesión
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4 block">Biotecnología Facial</span>
            <h1 className="text-5xl md:text-6xl font-serif text-ink leading-tight mb-6">
              Bio-Collagen <br /> 
              <span className="italic">Deep Hydration</span>
            </h1>
            <p className="text-gray-500 text-lg font-light leading-relaxed max-w-xl">
              Nuestra fórmula magistral combina colágeno biomimético de bajo peso molecular con un complejo de triple ácido hialurónico para atravesar las barreras dérmicas y restaurar la elasticidad perdida.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: <Droplets size={20} />, title: "Ultra Hidratante", desc: "+85% retención de agua" },
              { icon: <Sparkles size={20} />, title: "Luminosidad", desc: "Efecto glass-skin" },
              { icon: <ShieldCheck size={20} />, title: "Barrera Dérmica", desc: "Fortalece y protege" },
              { icon: <Wand2 size={20} />, title: "Efecto Lift", desc: "Tensión natural" },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-3"
              >
                <div className="text-ink bg-neutral-50 w-10 h-10 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-ink">{feature.title}</h3>
                  <p className="text-xs text-gray-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Science Section with Clover Layout */}
      <section ref={scienceRef} className="bg-neutral-50 py-32 mt-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-4 block">Molecular Blueprint</span>
            <h2 className="text-4xl md:text-5xl font-serif text-ink mb-6">La Ciencia Detrás</h2>
            <p className="text-gray-500 font-light italic text-lg">
              "No solo hidratamos la superficie, reestructuramos la arquitectura dérmica desde el interior."
            </p>
          </div>

          <div className="relative h-[500px] md:h-[650px] flex items-center justify-center scale-75 md:scale-100">
            {/* Wobbly Motion Wrapper */}
            <motion.div 
              animate={{ x: [-15, 15, -15], y: [-10, 10, -10] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center transform-gpu"
            >
              <motion.div 
                style={{ y: parallaxY }}
                className="relative flex items-center justify-center"
              >
                {/* Petal 01 - Absorción Molecular */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: -35 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: -15 }}
                  viewport={{ once: true }}
                  className="absolute -translate-y-28 -translate-x-24 md:-translate-y-40 md:-translate-x-32 w-56 h-56 md:w-72 md:h-72 p-6 md:p-10 bg-white rounded-[100%_100%_100%_10%] border border-neutral-100 flex flex-col justify-center text-center shadow-2xl hover:scale-105 transition-transform duration-700 cursor-default group z-20 origin-bottom-right"
                >
                  <span className="text-gold font-mono text-[10px] mb-2 md:mb-4 font-bold">01</span>
                  <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-ink mb-2 md:mb-4 group-hover:text-gold transition-colors">Absorción Molecular</h4>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-light leading-relaxed">El colágeno de 200Da penetra profundamente, a diferencia de las mascarillas convencionales.</p>
                </motion.div>

                {/* Petal 02 - Infusión Activa */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: 35 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 15 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="absolute -translate-y-28 translate-x-24 md:-translate-y-40 md:translate-x-32 w-56 h-56 md:w-72 md:h-72 p-6 md:p-10 bg-white rounded-[100%_100%_10%_100%] border border-neutral-100 flex flex-col justify-center text-center shadow-2xl hover:scale-105 transition-transform duration-700 cursor-default group z-20 origin-bottom-left"
                >
                  <span className="text-gold font-mono text-[10px] mb-2 md:mb-4 font-bold">02</span>
                  <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-ink mb-2 md:mb-4 group-hover:text-gold transition-colors">Infusión Activa</h4>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-light leading-relaxed">El polímero de hidrogel libera los nutrientes gradualmente durante 3 horas de contacto continuo.</p>
                </motion.div>

                {/* Petal 03 - Sellado de Nutrientes */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 100 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="absolute translate-y-24 md:translate-y-32 w-56 h-56 md:w-72 md:h-72 p-6 md:p-10 bg-white rounded-[10%_100%_100%_100%] border border-neutral-100 flex flex-col justify-center text-center shadow-2xl hover:scale-105 transition-transform duration-700 cursor-default group z-20 origin-top"
                >
                  <span className="text-gold font-mono text-[10px] mb-2 md:mb-4 font-bold">03</span>
                  <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-ink mb-2 md:mb-4 group-hover:text-gold transition-colors">Sellado de Nutrientes</h4>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-light leading-relaxed">Crea una barrera semi-permeable que evita la evaporación transdérmica del agua.</p>
                </motion.div>

                {/* Energy Rings Accent */}
                <div className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] border border-gold/10 rounded-full -z-10 animate-spin-slow"></div>
                <div className="absolute w-1 h-1 bg-gold rounded-full blur-[1px]"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clinical Results */}
      <section className="container mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-serif text-ink">Resultados Clínicos</h2>
            <div className="space-y-6">
              {[
                "Reducción del 24% en líneas de expresión finas.",
                "Incremento del 134% en la elasticidad cutánea.",
                "98% de las usuarias reportan piel más tersa.",
                "0% irritación en pieles sensibles (testado dermatológicamente)."
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-4 text-gray-500 font-light">
                  <div className="bg-ink rounded-full p-1">
                    <Check size={12} className="text-white" />
                  </div>
                  {point}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-ink p-16 rounded-[40px] text-white text-center relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-6">EMPIEZA AHORA</p>
                <div className="text-6xl font-serif mb-8">29,95€</div>
                <button 
                  onClick={handleAddToCart}
                  className="bg-white text-ink px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-100 transition-colors"
                >
                  Añadir a la bolsa
                </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
