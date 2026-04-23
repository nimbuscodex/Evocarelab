/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowRight, Check } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-32 bg-ink text-white overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5">
              <Mail size={12} className="text-gold" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold">Círculo Científico</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-serif tracking-tighter leading-tight text-balance">
              Acceso al <span className="italic text-gold">Laboratorio.</span>
            </h2>
            
            <p className="text-lg text-gray-400 font-light leading-relaxed max-w-xl mx-auto">
              Únase a nuestra lista privada para recibir avances exclusivos en biotecnología celular, lanzamientos limitados y protocolos de ritual avanzados.
            </p>
          </div>

          {!subscribed ? (
            <form onSubmit={handleSubmit} className="relative max-w-md mx-auto group">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Su correo académico..."
                className="w-full bg-transparent border-b border-white/20 px-4 py-6 text-xl font-light focus:outline-none focus:border-gold transition-all text-center tracking-wide group-hover:border-white/40"
              />
              <button 
                type="submit"
                className="mt-8 group flex items-center justify-center gap-4 mx-auto py-4 px-10 rounded-full bg-gold text-ink text-xs uppercase tracking-[0.4em] font-bold hover:scale-105 transition-all"
              >
                Solicitar Acceso
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 px-8 rounded-3xl bg-gold/5 border border-gold/20 flex flex-col items-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-ink">
                <Check size={32} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-serif text-gold">Credenciales Confirmadas.</h3>
              <p className="text-gray-400 font-light italic">Recibirá una invitación en su bandeja de entrada próximamente.</p>
            </motion.div>
          )}

          <div className="pt-12 flex flex-wrap justify-center gap-10 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000">
            <span className="text-[10px] uppercase tracking-widest font-bold">Inscripción Selectiva</span>
            <span className="text-[10px] uppercase tracking-widest font-bold">Sin Propaganda</span>
            <span className="text-[10px] uppercase tracking-widest font-bold">Solo Ciencia</span>
          </div>
        </div>
      </div>
    </section>
  );
}
