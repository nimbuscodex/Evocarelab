/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-pearl min-h-screen pt-40 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Documentación Legal</span>
            <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tighter italic">Política de Privacidad</h1>
          </div>

          <div className="prose prose-neutral max-w-none space-y-8 text-gray-500 font-light leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">1. Responsable del Tratamiento</h2>
              <p>
                Evocarelab Science S.L. (en adelante, "Evocarelab"), con domicilio social en Barcelona, España, es la responsable del tratamiento de sus datos personales. Nos comprometemos a proteger su privacidad de acuerdo con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos y Garantía de Derechos Digitales (LOPDGDD).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">2. Finalidad del Tratamiento</h2>
              <p>
                Tratamos sus datos personales con las siguientes finalidades:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestionar la compra y envío de nuestros productos científicos.</li>
                <li>Proporcionar asesoramiento dermatológico basado en los datos proporcionados.</li>
                <li>Enviar comunicaciones comerciales sobre novedades biotecnológicas, siempre que haya otorgado su consentimiento.</li>
                <li>Mejorar la arquitectura de nuestra plataforma digital mediante análisis estadísticos.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">3. Legitimación</h2>
              <p>
                La base legal para el tratamiento de sus datos es la ejecución del contrato de compraventa, el cumplimiento de obligaciones legales y el consentimiento explícito brindado para finalidades específicas de marketing o análisis biométrico.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">4. Conservación de Datos</h2>
              <p>
                Sus datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recabados y para determinar las posibles responsabilidades que se pudieran derivar de dicha finalidad y del tratamiento de los datos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">5. Sus Derechos</h2>
              <p>
                Usted tiene derecho a acceder, rectificar, suprimir, oponerse, limitar el tratamiento y solicitar la portabilidad de sus datos. Puede ejercer estos derechos enviando una comunicación a legal@evocarelab.com adjuntando copia de su documento de identidad.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">6. Seguridad</h2>
              <p>
                Implementamos medidas técnicas y organizativas de nivel de laboratorio para garantizar que sus datos personales estén protegidos contra pérdida, uso indebido o acceso no autorizado.
              </p>
            </section>
          </div>
          
          <div className="pt-12 border-t border-neutral-100 italic text-xs text-gray-400">
            Última actualización: 22 de Abril de 2026. Evocarelab Science Legal Department.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
