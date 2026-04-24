/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProduct } from '../hooks/useProduct';

export default function FinalCTA() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { product, loading } = useProduct();

  const handleBuy = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url
    });
  };

  return (
    <section className="py-32 shimmer-bg">
      <div className="container mx-auto px-12 text-center max-w-6xl">
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="bg-white/40 backdrop-blur-sm p-16 md:p-32 rounded-[40px] shadow-sm border border-white/60 flex flex-col items-center"
        >
          <h2 className="text-5xl md:text-7xl font-serif mb-12 text-ink">¿Lista para brillar?</h2>
          <p className="text-lg text-gray-500 font-light mb-16 max-w-md leading-relaxed">
            Únete a la evolución de Evocarelab y transforma tu rutina diaria en un ritual de lujo atemporal.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleBuy}
            className="cta-btn px-12 py-6 bg-ink text-white text-[10px] uppercase tracking-[0.3em] font-bold shadow-2xl transition-all duration-300"
          >
            Comprar {product.name} — {product.price.toFixed(2)}€
          </motion.button>
          
          <div className="mt-24 flex gap-12 text-gray-400">
            <Link to="/contacto" className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-ink transition-colors">
               <Mail size={14} /> Contacto
            </Link>
          </div>
        </motion.div>
        
        <footer className="mt-20 text-[9px] uppercase tracking-[0.4em] text-gray-300 font-medium flex items-center justify-center">
          © 2024 <span className="font-serif capitalize inline-flex items-baseline ml-2 mr-2">Evocare<span className="text-[7px] lowercase translate-y-[2px] ml-0.5 opacity-80">lab</span></span> — PUREZA ATEMPORAL
        </footer>
      </div>
    </section>
  );
}
