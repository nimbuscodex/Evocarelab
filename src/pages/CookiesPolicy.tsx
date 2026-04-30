/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function CookiesPolicy() {
  return (
    <div className="bg-pearl min-h-screen pt-40 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Transparencia Digital</span>
            <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tighter italic">Política de Cookies</h1>
          </div>

          <div className="prose prose-neutral max-w-none space-y-8 text-gray-500 font-light leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">1. ¿Qué son las Cookies?</h2>
              <p>
                Las cookies son pequeños archivos de texto que se descargan en su dispositivo al acceder a Evocarelab. Estas nos permiten reconocer su navegador y recordar ciertas preferencias para que su próxima visita sea más fluida y personalizada científicamente.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">2. Tipos de Cookies que utilizamos</h2>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong className="text-ink">Cookies Técnicas:</strong> Esenciales para el funcionamiento del laboratorio digital, permitiendo la navegación y el uso de opciones como la bolsa de compra.
                </li>
                <li>
                  <strong className="text-ink">Cookies de Personalización:</strong> Permiten recordar sus preferencias de idioma o configuración regional para ofrecer una experiencia de lujo adaptada.
                </li>
                <li>
                  <strong className="text-ink">Cookies de Análisis:</strong> Realizan un seguimiento anónimo del comportamiento de los usuarios para optimizar la arquitectura de la web y el rendimiento de carga.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">3. Configuración y Desactivación</h2>
              <p>
                Usted puede restringir, bloquear o borrar las cookies de Evocarelab utilizando la configuración de su navegador. Cada navegador tiene una operativa diferente; consulte la función de 'Ayuda' de su navegador para conocer cómo hacerlo.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">4. Consentimiento</h2>
              <p>
                Al navegar y continuar en nuestro sitio web sin desactivar las cookies, usted consiente el uso de las mismas en las condiciones contenidas en esta Política de Cookies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">5. Actualizaciones</h2>
              <p>
                Podemos modificar esta Política de Cookies en función de exigencias legislativas, reglamentarias o con la finalidad de adaptar dicha política a las instrucciones dictadas por la Agencia Española de Protección de Datos (AEPD).
              </p>
            </section>
          </div>
          
          <div className="pt-12 border-t border-neutral-100 italic text-xs text-gray-400">
            Última actualización: 22 de Abril de 2026. Evocarelab Science Digital Experience.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
