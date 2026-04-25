/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, Send, ChevronRight } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const address = "Calle Lisboa 6, Nave 23, Polígono Industrial Albresa, Valdemoro, 28340, Madrid, España";
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3052.0624!2d-3.682!3d40.19!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd421f57!2zQ2FsbGUgTGlzYm9hLCA2LCAyODM0MCBWYWxkZW1vcm8sIE1hZHJpZCwgRXNwYcOxYQ!5e0!3m2!1ses!2ses!4v1713830000000!5m2!1ses!2ses`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      setFormState('error');
      setTimeout(() => setFormState('idle'), 3000);
      return;
    }

    setFormState('submitting');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setFormState('success');
        form.reset();
        setTimeout(() => setFormState('idle'), 5000);
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      console.error(error);
      setFormState('error');
      setTimeout(() => setFormState('idle'), 3000);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-32">
      {/* Minimalist Header */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <span className="text-[10px] uppercase tracking-[0.6em] text-gold font-bold">Atención Evocarelab</span>
          <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tight">
            Contacta con <span className="italic font-light">nosotros</span>
          </h1>
          <div className="w-20 h-px bg-gold/30 mx-auto"></div>
        </motion.div>
      </section>

      {/* Main Grid */}
      <section className="container mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-32">
          
          {/* Info Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4 space-y-16"
          >
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Canales Directos</h3>
                <div className="space-y-6">
                  <div className="group">
                    <p className="text-[10px] text-gold uppercase tracking-widest mb-1">Email</p>
                    <a href="mailto:nimbuscodex@gmail.com" className="text-xl font-serif italic text-ink hover:text-gold transition-colors">
                      nimbuscodex@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Ubicación</h3>
                <div className="flex gap-4">
                  <MapPin className="text-gold shrink-0 mt-1" size={18} />
                  <p className="text-ink font-light leading-relaxed">
                    {address}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-12 border-t border-gray-100">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Horarios</h3>
                <div className="space-y-3 text-sm font-light text-gray-500">
                  <div className="flex justify-between">
                    <span>L-V</span>
                    <span>09:00 — 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sáb</span>
                    <span>10:00 — 14:00</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 bg-pearl/30 rounded-[40px] p-8 md:p-16 border border-gray-100"
          >
            <form 
              onSubmit={handleSubmit}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    className="w-full bg-transparent border-b border-ink/10 py-3 focus:border-gold transition-colors outline-none font-light text-lg"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full bg-transparent border-b border-ink/10 py-3 focus:border-gold transition-colors outline-none font-light text-lg"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">
                  Asunto <span className="text-red-500">*</span>
                </label>
                <select 
                  name="subject" 
                  required 
                  className="w-full bg-transparent border-b border-ink/10 py-3 focus:border-gold transition-colors outline-none font-light text-lg appearance-none cursor-pointer"
                >
                  <option value="">Selecciona una opción...</option>
                  <option value="Consulta">Consulta General</option>
                  <option value="Soporte">Soporte</option>
                  <option value="Colaboración">Colaboración</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">
                  Mensaje <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  className="w-full bg-transparent border-b border-ink/10 py-3 focus:border-gold transition-colors outline-none font-light text-lg resize-none"
                  placeholder="Tu mensaje..."
                ></textarea>
              </div>

              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  name="privacy" 
                  required 
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold accent-gold cursor-pointer"
                />
                <label className="text-[10px] text-gray-500 font-light leading-snug">
                  He leído y acepto la <a href="/privacidad" className="text-gold underline underline-offset-2">Política de Privacidad</a>. <span className="text-red-500">*</span>
                </label>
              </div>

              {formState === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Completa todos los campos obligatorios (*)
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={formState === 'submitting' || formState === 'success'}
                className={`w-full py-6 bg-ink text-white text-[10px] uppercase tracking-[0.5em] font-bold rounded-full transition-all hover:bg-gold hover:text-ink shadow-lg flex items-center justify-center gap-4 ${formState === 'error' ? 'animate-shake' : ''}`}
              >
                {formState === 'submitting' ? 'Enviando...' : formState === 'success' ? 'Mensaje Enviado ✓' : 'Enviar Mensaje'}
                {formState === 'idle' && <ChevronRight size={14} />}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Minimalist Map Integration */}
        <div className="mt-16 w-full h-[500px] rounded-[40px] overflow-hidden border border-gray-100 grayscale contrast-[1.05]">
          <iframe 
            src={mapUrl}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Evocarelab"
          ></iframe>
        </div>
      </section>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          background-color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}
