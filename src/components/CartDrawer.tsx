/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalSubtotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-ink/90 backdrop-blur-3xl z-[100]"
          />
          
          {/* Circular Stage */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotate: 10 }}
            className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
          >
            <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
              {/* Header Info */}
              <div className="absolute top-10 left-10 text-white z-50">
                <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-2">Protocolo de Adquisición</p>
                <h2 className="text-3xl font-serif tracking-tight">Sistema de Pureza Molecular</h2>
              </div>

              <button 
                onClick={() => setIsCartOpen(false)}
                className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all z-50 text-white"
              >
                <X size={24} />
              </button>

              {/* Molecular Core */}
              <div className="relative z-20 group">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 40px rgba(197,160,89,0.1)',
                      '0 0 80px rgba(197,160,89,0.3)',
                      '0 0 40px rgba(197,160,89,0.1)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 md:w-48 md:h-48 bg-white border border-gold/20 rounded-full flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-radial-[circle_at_30%_30%] from-white via-pearl to-gold/5" />
                  <div className="relative z-10 text-center space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold">Núcleo</p>
                    <p className="text-2xl md:text-3xl font-serif text-ink">{totalSubtotal}€</p>
                  </div>
                </motion.div>
                
                {/* Orbital Paths and Decorative Particles */}
                <div className="absolute inset-[-50%] border border-gold/10 rounded-full pointer-events-none animate-spin-slow" />
                <div className="absolute inset-[-100%] border border-gold/5 rounded-full pointer-events-none animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
                
                {/* Small floating Atoms */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, delay: i * 0.5 }
                    }}
                    className="absolute inset-[-120%] pointer-events-none"
                  >
                    <div 
                      className="w-2 h-2 bg-gold/40 rounded-full blur-[1px]" 
                      style={{ 
                        marginLeft: `${Math.random() * 100}%`,
                        marginTop: `${Math.random() * 100}%`
                      }} 
                    />
                  </motion.div>
                ))}
              </div>

              {/* Orbiting Items */}
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <ShoppingBag size={48} className="text-gray-200" />
                  <p className="text-gray-400 font-light italic">Su sistema de pureza está vacío.</p>
                </motion.div>
              ) : (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  {items.map((item, index) => {
                    const angle = (index / items.length) * 2 * Math.PI;
                    const radius = window.innerWidth < 768 ? 140 : 280;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          x,
                          y,
                        }}
                        transition={{ delay: index * 0.1, type: 'spring' }}
                        className="absolute left-1/2 top-1/2 -ml-12 -mt-16 md:-ml-16 md:-mt-20 w-24 md:w-32 z-30"
                      >
                        <motion.div 
                          animate={{ rotate: -360 }}
                          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                          className="relative group"
                        >
                          {/* Item Card */}
                          <div className="relative bg-white rounded-2xl p-2 shadow-xl border border-gold/10 group-hover:border-gold/30 transition-all hover:scale-105">
                             <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-shimmer">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             </div>
                             
                             <div className="space-y-2">
                               <div className="flex justify-between items-start gap-1">
                                 <h4 className="text-[9px] font-bold uppercase tracking-wider leading-tight text-ink">{item.name}</h4>
                                 <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                                   <X size={10} />
                                 </button>
                               </div>
                               
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 bg-pearl px-1.5 py-0.5 rounded-md">
                                   <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-ink"><Minus size={10} /></button>
                                   <span className="text-[9px] font-bold w-3 text-center">{item.quantity}</span>
                                   <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-ink"><Plus size={10} /></button>
                                 </div>
                                 <span className="text-[9px] font-bold text-gold">{item.price * item.quantity}€</span>
                               </div>
                             </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Bottom Actions */}
            {items.length > 0 && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 pointer-events-auto"
              >
                <div className="bg-ink text-white p-2 rounded-full flex items-center justify-between shadow-2xl">
                  <div className="px-6">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/50 mb-0.5">Total Selección</p>
                    <p className="text-lg font-serif">{totalSubtotal}€</p>
                  </div>
                  <Link 
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="h-12 px-8 bg-gold text-ink rounded-full text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    Verificado <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
