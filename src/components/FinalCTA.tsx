/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useProduct } from '../hooks/useProduct';
import { getImageUrl } from '../lib/supabase';

export default function FinalCTA() {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { product, loading } = useProduct();

  const handleBuy = () => {
    navigate('/producto');
  };

  return (
    <section className="py-32 shimmer-bg relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={getImageUrl("collage.png")} className="w-full h-full object-cover opacity-80 mix-blend-multiply" alt="" />
        <div className="absolute inset-0 bg-white/30"></div>
      </div>
      <div className="container mx-auto px-12 text-center max-w-6xl relative z-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="bg-white/60 backdrop-blur-md p-16 md:p-32 rounded-[64px] shadow-2xl border border-white/80 flex flex-col items-center"
        >
          <h2 className="text-5xl md:text-8xl font-serif mb-12 text-ink italic tracking-tight">{t('finalcta.title')}</h2>
          <p className="text-xl text-gray-500 font-light mb-16 max-w-md leading-relaxed">
            {t('finalcta.description')}
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleBuy}
            className="cta-btn px-16 py-8 bg-ink text-white text-[11px] uppercase tracking-[0.4em] font-bold shadow-2xl transition-all duration-300"
          >
            {t('finalcta.cta')} {product ? `— ${product.price.toFixed(2)}€` : ''}
          </motion.button>
          
          <div className="mt-24 flex gap-12 text-gray-400">
            <Link to="/contacto" className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-ink transition-colors">
               <Mail size={14} /> {t('finalcta.contact')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
