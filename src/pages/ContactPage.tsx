/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, Send, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();
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
          <span className="text-[10px] uppercase tracking-[0.6em] text-gold font-bold">{t('pages.contact.badge')}</span>
          <h1 className="text-5xl md:text-8xl font-serif text-ink tracking-tighter leading-none">
            {t('pages.contact.title')}<br /><span className="italic font-light opacity-80">{t('pages.contact.titleItalic')}</span>
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
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">{t('pages.contact.channels')}</h3>
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
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">{t('pages.contact.location')}</h3>
                <div className="flex gap-4">
                  <MapPin className="text-gold shrink-0 mt-1" size={18} />
                  <p className="text-ink font-light leading-relaxed">
                    {address}
                  </p>
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
                    {t('pages.contact.form.name')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    className="w-full bg-transparent border-b border-ink/10 py-3 focus:border-gold transition-colors outline-none font-light text-lg"
                    placeholder={t('pages.contact.form.namePlaceholder')}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">
                    {t('pages.contact.form.email')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full bg-transparent border-b border-ink/10 py-3 focus:border-gold transition-colors outline-none font-light text-lg"
                    placeholder={t('pages.contact.form.emailPlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">
                  {t('pages.contact.form.subject')} <span className="text-red-500">*</span>
                </label>
                <select 
                  name="subject" 
                  required 
                  className="w-full bg-transparent border-b border-ink/10 py-3 focus:border-gold transition-colors outline-none font-light text-lg appearance-none cursor-pointer"
                >
                  <option value="">{t('pages.contact.form.subjectSelect')}</option>
                  <option value="Consulta">{t('pages.contact.form.subjectGeneral')}</option>
                  <option value="Soporte">{t('pages.contact.form.subjectSupport')}</option>
                  <option value="Colaboración">{t('pages.contact.form.subjectColab')}</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">
                  {t('pages.contact.form.message')} <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  className="w-full bg-transparent border-b border-ink/10 py-3 focus:border-gold transition-colors outline-none font-light text-lg resize-none"
                  placeholder={t('pages.contact.form.messagePlaceholder')}
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
                  {t('pages.contact.form.privacy')} <a href="/privacidad" className="text-gold underline underline-offset-2">{t('pages.contact.form.privacyLink')}</a>. <span className="text-red-500">*</span>
                </label>
              </div>

              {formState === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {t('pages.contact.form.error')}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={formState === 'submitting' || formState === 'success'}
                className={`w-full py-6 bg-ink text-white text-[10px] uppercase tracking-[0.5em] font-bold rounded-full transition-all hover:bg-gold hover:text-ink shadow-lg flex items-center justify-center gap-4 ${formState === 'error' ? 'animate-shake' : ''}`}
              >
                {formState === 'submitting' ? t('pages.contact.form.submitting') : formState === 'success' ? t('pages.contact.form.success') : t('pages.contact.form.send')}
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
            title={t('pages.contact.mapTitle')}
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
