/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from 'motion/react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProduct } from '../hooks/useProduct';

export default function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -50]);
  const navigate = useNavigate();
  const { product, loading } = useProduct();

  const handleBuy = () => {
    navigate('/producto');
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden shimmer-bg">
      <div className="container mx-auto px-12 relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-4"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-medium">Pureza Biotecnológica</span>
              <h1 className="text-6xl lg:text-7xl font-serif leading-[1.1] text-ink text-balance">
                Piel perfecta.<br />
                <span className="italic font-light">Sin esfuerzo.</span>
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-lg text-gray-500 font-light max-w-sm leading-relaxed"
            >
              Triple ácido hialurónico para una hidratación tridimensional profunda. La nueva generación en cuidado facial biotecnológico.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center gap-6"
            >
              <button 
                onClick={handleBuy}
                className="cta-btn bg-ink text-white px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-semibold active:scale-95"
              >
                Comprar ahora
              </button>
              <Link 
                to="/producto"
                className="cta-btn border border-gray-200 px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-semibold text-gray-400 active:scale-95 inline-block text-center"
              >
                Descubrir más
              </Link>
            </motion.div>
          </div>

          <div className="md:col-span-7 flex justify-center relative [perspective:1000px]">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-gray-100/50 rounded-full opacity-50 blur-3xl"></div>
            
            <motion.div 
              style={{ y: y1, transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              className="mask-visual w-64 h-[420px] sm:w-80 sm:h-[520px] md:w-[400px] md:h-[540px] lg:w-[480px] lg:h-[640px] flex items-center justify-center relative z-10 overflow-visible"
            >
              <motion.img 
                src="/modelo 1.png"
                className="w-[75%] h-[75%] object-cover relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 bg-white/5 p-1"
                alt="3D Isolated Sheet Mask"
                loading="eager"
                animate={{ rotateY: 360 }}
                whileHover={{ scale: 1.05 }}
                transition={{ 
                  rotateY: { duration: 25, repeat: Infinity, ease: "linear" },
                  scale: { duration: 0.4 }
                }}
                style={{ 
                  translateZ: 100,
                  borderRadius: "0% 100% 100% 100% / 0% 100% 100% 100%" 
                }}
              />
              <div className="absolute inset-0 bg-black/[0.01] pointer-events-none" style={{ borderRadius: 'inherit' }}></div>
              
              <div className="font-serif text-[80px] md:text-[100px] opacity-10 absolute text-ink leading-none flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="uppercase tracking-widest">Evocare</span>
                <span className="text-[0.4em] -mt-2 tracking-[0.5em]">lab</span>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1 }}
                className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm absolute -bottom-8 -right-8 w-44 md:w-48"
              >
                <p className="text-[9px] uppercase tracking-widest font-bold mb-1 text-ink">Resultados</p>
                <p className="text-2xl font-serif font-semibold text-ink">+84%</p>
                <p className="text-[10px] text-gray-400 leading-tight">Incremento en hidratación dérmica tras el primer uso.</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-12">
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-16 bg-ink/10"
        />
      </div>
    </section>
  );
}
