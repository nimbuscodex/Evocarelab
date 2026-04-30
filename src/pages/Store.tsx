/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { getLocalizedPath } from '../lib/i18n-utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  badge?: string;
}

export default function Store() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  const isSpanish = i18n.language.startsWith('es');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // Fallback if no products in Supabase
          setProducts([
            {
              id: 'triple-h-mask-1',
              name: isSpanish ? 'Máscara Triple Ácido Hialurónico' : 'Triple Hyaluronic Acid Mask',
              description: isSpanish 
                ? 'Nuestra fórmula magistral que combina colágeno biomimético de bajo peso molecular con un complejo de triple ácido hialurónico.'
                : 'Our master formula that combines low molecular weight biomimetic collagen with a triple hyaluronic acid complex.',
              price: 29.95,
              image_url: 'https://www.kiyobeauty.com/cdn/shop/files/biodance-bio-collagen-real-deep-mask-1pc-PURESEOUL-UK-KBeauty-shop-2_1800x1800_0d187b16-fead-4418-b39a-2debfafbc0c3.webp?v=1756371372&width=1500',
              category: isSpanish ? 'Mascarillas' : 'Masks',
              badge: t('store.bestseller')
            }
          ]);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err.message);
        setError(isSpanish ? 'No pudimos cargar los productos desde Supabase.' : 'We could not load the products from Supabase.');
        
        // Fallback for visual purposes if no database is connected
        setProducts([
          {
            id: 'triple-h-mask-1',
            name: isSpanish ? 'Máscara Triple Ácido Hialurónico' : 'Triple Hyaluronic Acid Mask',
            description: isSpanish 
              ? 'Nuestra fórmula magistral que combina colágeno biomimético de bajo peso molecular con un complejo de triple ácido hialurónico.'
              : 'Our master formula that combines low molecular weight biomimetic collagen with a triple hyaluronic acid complex.',
            price: 29.95,
            image_url: 'https://www.kiyobeauty.com/cdn/shop/files/biodance-bio-collagen-real-deep-mask-1pc-PURESEOUL-UK-KBeauty-shop-2_1800x1800_0d187b16-fead-4418-b39a-2debfafbc0c3.webp?v=1756371372&width=1500',
            category: isSpanish ? 'Mascarillas' : 'Masks',
            badge: t('store.bestseller')
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [isSpanish, t]);

  const handleAdd = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url
    });
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      {/* Header */}
      <section className="container mx-auto px-6 text-center mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4 block">Evocarelab</span>
          <h1 className="text-5xl md:text-6xl font-serif text-ink mb-6">
            {t('store.title')}<span className="italic">{t('store.titleItalic')}</span>
          </h1>
          <p className="text-gray-500 font-light leading-relaxed">
            {t('store.subtitle')}
          </p>
        </motion.div>
      </section>

      {/* Connectivity Alert */}
      {error && (
        <div className="container mx-auto px-6 mb-12">
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl flex items-start gap-4 text-sm font-light border border-amber-100/50">
            <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-500" />
            <div>
              <strong className="font-medium block mb-1">{t('store.connectivityNote')}</strong>
              {error} {isSpanish 
                ? 'Asegúrate de haber configurado correctamente el archivo .env.local con tus credenciales de Vercel/Supabase y de haber creado la tabla products. Mostrando productos de demostración.'
                : 'Make sure you have correctly configured the .env.local file with your Vercel/Supabase credentials and created the products table. Showing demo products.'}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="container mx-auto px-6 flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-t-2 border-gold animate-spin"></div>
        </div>
      ) : (
        /* Products Grid */
        <section className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-50 mb-6 w-full">
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-ink shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-white/50">
                      {product.badge}
                    </div>
                  )}
                  <Link to={getLocalizedPath('product')} className="block w-full h-full">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>
                  
                  {/* Quick Add Button Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleAdd(product);
                      }}
                      className="w-full py-4 bg-ink text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 hover:bg-gold transition-colors"
                    >
                      {t('store.add')} <span className="opacity-50 mx-2">|</span> {product.price.toFixed(2)}€
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-grow flex flex-col items-center text-center space-y-3 px-4">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                    {product.category || t('store.treatment')}
                  </span>
                  <Link to={getLocalizedPath('product')}>
                    <h3 className="text-xl font-serif text-ink tracking-tight hover:text-gold transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 font-light line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-center w-full">
                    <span className="text-lg text-ink font-mono">{product.price.toFixed(2)} €</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Routine Banner */}
      <section className="container mx-auto px-6 mt-32">
        <div className="bg-pearl/30 rounded-[40px] p-12 md:p-20 text-center border border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute top-10 right-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
             <div className="absolute bottom-10 left-10 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl"></div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-2xl mx-auto space-y-8"
          >
            <Sparkles className="w-8 h-8 text-gold mx-auto opacity-50" />
            <h2 className="text-4xl md:text-5xl font-serif text-ink">{t('store.completeSystem')}</h2>
            <p className="text-gray-500 font-light text-lg">
              {t('store.completeDesc')}
            </p>
            <Link 
              to={getLocalizedPath('ritual')} 
              className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-ink border-b border-ink/20 pb-2 hover:border-ink transition-colors"
            >
              {t('store.discoverRitual')} <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
