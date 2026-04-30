/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function CookiesPolicy() {
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
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">{t('pages.cookies_page.badge')}</span>
            <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tighter italic">{t('pages.cookies_page.title')}</h1>
          </div>

          <div className="prose prose-neutral max-w-none space-y-8 text-gray-500 font-light leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{t('pages.cookies_page.h1')}</h2>
              <p>
                {isSpanish
                  ? 'Las cookies son pequeños archivos de texto que se descargan en su dispositivo al acceder a Evocarelab. Estas nos permiten reconocer su navegador y recordar ciertas preferencias para que su próxima visita sea más fluida y personalizada científicamente.'
                  : 'Cookies are small text files that are downloaded to your device when accessing Evocarelab. These allow us to recognize your browser and remember certain preferences so that your next visit is more fluid and scientifically personalized.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{t('pages.cookies_page.h2')}</h2>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong className="text-ink">{isSpanish ? 'Cookies Técnicas:' : 'Technical Cookies:'}</strong> {isSpanish 
                    ? 'Esenciales para el funcionamiento del laboratorio digital, permitiendo la navegación y el uso de opciones como la bolsa de compra.'
                    : 'Essential for the functioning of the digital laboratory, allowing navigation and use of options such as the shopping bag.'}
                </li>
                <li>
                  <strong className="text-ink">{isSpanish ? 'Cookies de Personalización:' : 'Personalization Cookies:'}</strong> {isSpanish
                    ? 'Permiten recordar sus preferencias de idioma o configuración regional para ofrecer una experiencia de lujo adaptada.'
                    : 'They allow remembering your language preferences or regional configuration to offer a tailored luxury experience.'}
                </li>
                <li>
                  <strong className="text-ink">{isSpanish ? 'Cookies de Análisis:' : 'Analysis Cookies:'}</strong> {isSpanish
                    ? 'Realizan un seguimiento anónimo del comportamiento de los usuarios para optimizar la arquitectura de la web y el rendimiento de carga.'
                    : 'They perform anonymous tracking of user behavior to optimize the architecture of the website and loading performance.'}
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{t('pages.cookies_page.h3')}</h2>
              <p>
                {isSpanish
                  ? 'Usted puede restringir, bloquear o borrar las cookies de Evocarelab utilizando la configuración de su navegador. Cada navegador tiene una operativa diferente; consulte la función de "Ayuda" de su navegador para conocer cómo hacerlo.'
                  : 'You can restrict, block or delete cookies from Evocarelab using your browser settings. Each browser has a different operation; Consult your browser\'s "Help" function to learn how to do it.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{isSpanish ? '4. Consentimiento' : '4. Consent'}</h2>
              <p>
                {isSpanish
                  ? 'Al navegar y continuar en nuestro sitio web sin desactivar las cookies, usted consiente el uso de las mismas en las condiciones contenidas en esta Política de Cookies.'
                  : 'By browsing and continuing on our website without deactivating cookies, you consent to the use of cookies under the conditions contained in this Cookies Policy.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-ink uppercase tracking-widest">{isSpanish ? '5. Actualizaciones' : '5. Updates'}</h2>
              <p>
                {isSpanish
                  ? 'Podemos modificar esta Política de Cookies en función de exigencias legislativas, reglamentarias o con la finalidad de adaptar dicha política a las instrucciones dictadas por la Agencia Española de Protección de Datos (AEPD).'
                  : 'We may modify this Cookies Policy based on legislative or regulatory requirements or with the aim of adapting said policy to the instructions issued by the Spanish Data Protection Agency (AEPD).'}
              </p>
            </section>
          </div>
          
          <div className="pt-12 border-t border-neutral-100 italic text-xs text-gray-400">
            {t('pages.cookies_page.footer')}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
