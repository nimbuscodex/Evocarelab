/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith('es');

  return (
    <div className="bg-pearl min-h-screen pt-40 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">{t('pages.privacy.badge')}</span>
            <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tighter italic">{t('pages.privacy.title')}</h1>
          </div>

          <div className="prose prose-neutral max-w-none space-y-8 text-gray-500 font-light leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{t('pages.privacy.h1')}</h2>
              <p>
                {isSpanish 
                  ? 'Evocarelab Science S.L. (en adelante, "Evocarelab"), con domicilio social en Barcelona, España, es la responsable del tratamiento de sus datos personales. Nos comprometemos a proteger su privacidad de acuerdo con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos y Garantía de Derechos Digitales (LOPDGDD).'
                  : 'Evocarelab Science S.L. (hereinafter, "Evocarelab"), with its registered office in Barcelona, Spain, is responsible for processing your personal data. We are committed to protecting your privacy in accordance with the General Data Protection Regulation (GDPR) and the Organic Law on Data Protection and Guarantee of Digital Rights (LOPDGDD).'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{t('pages.privacy.h2')}</h2>
              <p>
                {isSpanish ? 'Tratamos sus datos personales con las siguientes finalidades:' : 'We process your personal data for the following purposes:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                {isSpanish ? (
                  <>
                    <li>Gestionar la compra y envío de nuestros productos científicos.</li>
                    <li>Proporcionar asesoramiento dermatológico basado en los datos proporcionados.</li>
                    <li>Enviar comunicaciones comerciales sobre novedades biotecnológicas, siempre que haya otorgado su consentimiento.</li>
                    <li>Mejorar la arquitectura de nuestra plataforma digital mediante análisis estadísticos.</li>
                  </>
                ) : (
                  <>
                    <li>Manage the purchase and shipment of our scientific products.</li>
                    <li>Provide dermatological advice based on the data provided.</li>
                    <li>Send commercial communications about biotechnological news, provided you have given your consent.</li>
                    <li>Improve the architecture of our digital platform through statistical analysis.</li>
                  </>
                )}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{t('pages.privacy.h3')}</h2>
              <p>
                {isSpanish
                  ? 'La base legal para el tratamiento de sus datos es la ejecución del contrato de compraventa, el cumplimiento de obligaciones legales y el consentimiento explícito brindado para finalidades específicas de marketing o análisis biométrico.'
                  : 'The legal basis for the processing of your data is the execution of the sales contract, compliance with legal obligations and the explicit consent provided for specific purposes of marketing or biometric analysis.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{t('pages.privacy.h4')}</h2>
              <p>
                {isSpanish
                  ? 'Sus datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recabados y para determinar las posibles responsabilidades que se pudieran derivar de dicha finalidad y del tratamiento de los datos.'
                  : 'Your personal data will be kept for the time necessary to fulfill the purpose for which it was collected and to determine the possible responsibilities that could derive from said purpose and from the processing of data.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{t('pages.privacy.h5')}</h2>
              <p>
                {isSpanish
                  ? 'Usted tiene derecho a acceder, rectificar, suprimir, oponerse, limitar el tratamiento y solicitar la portabilidad de sus datos. Puede ejercer estos derechos enviando una comunicación a legal@evocarelab.com adjuntando copia de su documento de identidad.'
                  : 'You have the right to access, rectify, delete, oppose, limit the processing and request the portability of your data. You can exercise these rights by sending a communication to legal@evocarelab.com attaching a copy of your identity document.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{t('pages.privacy.h6')}</h2>
              <p>
                {isSpanish
                  ? 'Implementamos medidas técnicas y organizativas de nivel de laboratorio para garantizar que sus datos personales estén protegidos contra pérdida, uso indebido o acceso no autorizado.'
                  : 'We implement technical and organizational measures at a laboratory level to ensure that your personal data is protected against loss, misuse or unauthorized access.'}
              </p>
            </section>
          </div>
          
          <div className="pt-12 border-t border-neutral-100 italic text-xs text-gray-400">
            {t('pages.privacy.footer')}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
