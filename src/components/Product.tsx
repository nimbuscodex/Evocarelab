/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { useCart } from '../context/CartContext';

export default function Product() {
  const { addItem } = useCart();
  
  // Parallax / Rotation logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-300, 300], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-15, 15]), { stiffness: 100, damping: 30 });

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const handleAdd = () => {
    addItem({
      id: 'triple-h-mask-1',
      name: 'Triple Hyaluronic Acid Mask',
      price: 29.95,
      image: 'https://www.kiyobeauty.com/cdn/shop/files/biodance-bio-collagen-real-deep-mask-1pc-PURESEOUL-UK-KBeauty-shop-2_1800x1800_0d187b16-fead-4418-b39a-2debfafbc0c3.webp?v=1756371372&width=1500'
    });
  };

  return (
    <section id="coleccion" className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 relative [perspective:1000px] py-0"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="aspect-[4/5] bg-neutral-200 rounded-[40px] overflow-hidden relative shadow-2xl group border-2 border-ink/5"
            >
               <motion.img 
                 src="https://th.bing.com/th/id/R.311a84bb7398659c45d7548094b77c9e?rik=7XqFw3PWIm8F%2fQ&riu=http%3a%2f%2fcdn.shopify.com%2fs%2ffiles%2f1%2f0014%2f3232%2f2131%2farticles%2f1020_GT_BlogImages_28_1.jpg%3fv%3d1619664561&ehk=cdoSOWPPopzMIcgGVNba9r3Mor9j%2bauwHUCFo%2bEYKzU%3d&risl=&pid=ImgRaw&r=0" 
                 alt="Lifestyle Mask Ritual"
                 className="w-full h-full object-cover transition-all duration-1000"
                 style={{ translateZ: 80 }}
                 loading="eager"
               />
               
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
               
               {/* Lighting highlight that follows mouse */}
               <motion.div 
                 className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                 style={{ 
                   background: useTransform(
                     [x, y], 
                     ([latestX, latestY]) => `radial-gradient(circle at ${50 + (latestX as number)/5}% ${50 + (latestY as number)/5}%, rgba(255,255,255,0.3) 0%, transparent 60%)`
                   )
                 }}
               />
            </motion.div>
            
            {/* Float badge with its own parallax */}
            <motion.div 
              style={{ 
                rotateX: useTransform(rotateX, (v) => -v * 0.5), 
                rotateY: useTransform(rotateY, (v) => -v * 0.5),
                translateZ: 100
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -right-6 lg:-right-12 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/50 max-w-[200px] z-20"
            >
              <p className="text-[10px] text-gold uppercase tracking-widest mb-2 font-bold">Textura Luxury</p>
              <p className="text-sm font-medium leading-relaxed italic text-ink">"Una caricia de seda que se funde instantáneamente con tu piel."</p>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1"
          >
            <span className="text-[10px] text-gray-400 uppercase tracking-[0.4em] mb-6 block font-medium">Fórmula Avanzada</span>
            <h2 className="text-5xl lg:text-6xl font-serif mb-8 leading-tight text-ink text-balance">Triple Hyaluronic Mask</h2>
            <p className="text-lg text-gray-500 font-light leading-relaxed mb-10">
              Hidratación profunda, retención prolongada y refuerzo de la barrera cutánea. 
              Esta mascarilla construye una estructura tridimensional que revitaliza la piel seca y apagada al instante.
            </p>
            
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-ink">Efecto</p>
                <p className="text-sm text-gray-500 font-light">Lifting inmediato</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-ink">Acabado</p>
                <p className="text-sm text-gray-500 font-light">Piel rellena y luminosa</p>
              </div>
            </div>

            <motion.button 
              onClick={handleAdd}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="cta-btn px-10 py-5 bg-ink text-white text-[10px] uppercase tracking-[0.2em] font-bold shadow-2xl transition-shadow hover:shadow-gray-200"
            >
              Añadir al carrito — 29.95€
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
