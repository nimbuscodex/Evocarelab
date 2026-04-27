/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalSubtotal, clearCart } = useCart();

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
            className="fixed inset-0 bg-ink/95 backdrop-blur-2xl z-[100]"
          />
          
          {/* Global Actions (Close / Clear) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-6 right-6 lg:top-10 lg:right-10 flex gap-2 z-[150]"
          >
            {items.length > 0 && (
              <button 
                onClick={clearCart}
                className="w-12 h-12 bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all text-white/70 hover:text-white flex items-center justify-center group relative pointer-events-auto"
                title="Vaciar bolsa"
              >
                <Trash2 size={20} />
                <span className="absolute right-full mr-4 text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-ink/80 px-3 py-1.5 rounded-md border border-white/10 text-white pointer-events-none">
                  Vaciar
                </span>
              </button>
            )}
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-12 h-12 bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all text-white/70 hover:text-white flex items-center justify-center group relative pointer-events-auto"
              title="Cerrar bolsa"
            >
              <X size={24} />
              <span className="absolute right-full mr-4 text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-ink/80 px-3 py-1.5 rounded-md border border-white/10 text-white pointer-events-none">
                Cerrar
              </span>
            </button>
          </motion.div>

          {/* Circular Stage */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
          >
            <div className="relative w-full max-w-4xl aspect-square flex items-center justify-center pointer-events-auto">
              {/* Molecular Core */}
              <div className="relative z-20 group">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 40px rgba(197,160,89,0.1)',
                      '0 0 80px rgba(197,160,89,0.4)',
                      '0 0 40px rgba(197,160,89,0.1)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 md:w-48 md:h-48 bg-ink/40 backdrop-blur-xl border border-gold/30 rounded-full flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-radial-[circle_at_30%_30%] from-gold/10 via-transparent to-transparent" />
                  <div className="relative z-10 text-center space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold">Núcleo</p>
                    <p className="text-2xl md:text-3xl font-serif text-white">{totalSubtotal.toFixed(2)}€</p>
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
                  <ShoppingBag size={48} className="text-white/20" />
                  <p className="text-white/40 font-light italic">Su sistema de pureza está vacío.</p>
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
                          <div className="relative bg-ink/60 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/10 group-hover:border-gold/50 transition-all hover:scale-105">
                             <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             </div>
                             
                             <div className="space-y-2">
                               <div className="flex justify-between items-start gap-1">
                                 <h4 className="text-[9px] font-bold uppercase tracking-wider leading-tight text-white">{item.name}</h4>
                                 <button onClick={() => removeItem(item.id)} className="text-white/30 hover:text-red-400 transition-colors">
                                   <X size={10} />
                                 </button>
                               </div>
                               
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 bg-white/10 px-1.5 py-0.5 rounded-md text-white">
                                   <button onClick={() => updateQuantity(item.id, -1)} className="text-white/40 hover:text-white transition-colors"><Minus size={10} /></button>
                                   <span className="text-[9px] font-bold w-3 text-center">{item.quantity}</span>
                                   <button onClick={() => updateQuantity(item.id, 1)} className="text-white/40 hover:text-white transition-colors"><Plus size={10} /></button>
                                 </div>
                                 <span className="text-[9px] font-bold text-gold">{(item.price * item.quantity).toFixed(2)}€</span>
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
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 text-white p-2 rounded-full flex items-center justify-between shadow-2xl">
                  <div className="px-6">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/40 mb-0.5">Total Selección</p>
                    <p className="text-lg font-serif">{totalSubtotal.toFixed(2)}€</p>
                  </div>
                  <Link 
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="h-12 px-8 bg-gold text-ink rounded-full text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2 hover:bg-white transition-all"
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
