import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function AvisoLegal() {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith('es');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-40 min-h-screen bg-pearl">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 bg-ink/5 rounded-full text-[10px] uppercase tracking-[0.3em] font-medium text-ink">
              Legal
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight">
              {t('pages.legal.title')}<span className="italic font-light">{t('pages.legal.titleItalic')}</span>
            </h1>
            <p className="text-gray-500 font-light max-w-2xl">
              {t('pages.legal.p1')}
            </p>
          </div>

          <div className="prose prose-lg prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-p:text-gray-600 prose-p:font-light prose-a:text-gold hover:prose-a:text-ink max-w-none">
            
            <section className="mt-12">
              <h2>{t('pages.legal.h1')}</h2>
              {isSpanish ? (
                <>
                  <p>
                    En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSICE), a continuación se reflejan los siguientes datos:
                  </p>
                  <ul>
                    <li><strong>Empresa titular:</strong> EVOCARELAB SCIENCE (en adelante, EVOCARELAB)</li>
                    <li><strong>Domicilio social:</strong> Calle Lisboa 6, Nave 23, Polígono Industrial Albresa, Valdemoro, 28340, Madrid, España</li>
                    <li><strong>Correo electrónico de contacto:</strong> <a href="mailto:nimbuscodex@gmail.com">nimbuscodex@gmail.com</a></li>
                  </ul>
                </>
              ) : (
                <>
                  <p>
                    In compliance with the duty of information contained in article 10 of Law 34/2002, of July 11, on Services of the Information Society and Electronic Commerce (LSSICE), the following data is reflected below:
                  </p>
                  <ul>
                    <li><strong>Owning company:</strong> EVOCARELAB SCIENCE (hereinafter, EVOCARELAB)</li>
                    <li><strong>Registered office:</strong> Calle Lisboa 6, Nave 23, Polígono Industrial Albresa, Valdemoro, 28340, Madrid, Spain</li>
                    <li><strong>Contact email:</strong> <a href="mailto:nimbuscodex@gmail.com">nimbuscodex@gmail.com</a></li>
                  </ul>
                </>
              )}
            </section>

            <section className="mt-12">
              <h2>{t('pages.legal.h2')}</h2>
              <p>
                {isSpanish 
                  ? "El acceso y/o uso de este portal de EVOCARELAB atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento."
                  : "Access and/or use of this EVOCARELAB portal attributes the condition of USER, who accepts, from said access and/or use, the General Conditions of Use reflected here. The aforementioned Conditions will apply regardless of the General Conditions of Contract that may be mandatory."}
              </p>
            </section>

            <section className="mt-12">
              <h2>{t('pages.legal.h3')}</h2>
              <p>
                {isSpanish
                  ? "Nuestra página web proporciona el acceso a multitud de informaciones, servicios, programas o datos (en adelante, 'los contenidos') en Internet pertenecientes a EVOCARELAB o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro que fuese necesario para acceder a determinados servicios o contenidos."
                  : "Our website provides access to a multitude of information, services, programs or data (hereinafter, 'the contents') on the Internet belonging to EVOCARELAB or its licensors to which the USER may have access. The USER assumes responsibility for using the portal. This responsibility extends to any registration that may be necessary to access certain services or content."}
              </p>
            </section>

            <section className="mt-12">
              <h2>{t('pages.legal.h4')}</h2>
              <p>
                {isSpanish
                  ? "EVOCARELAB por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo: imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.), titularidad de EVOCARELAB o bien de sus licenciantes."
                  : "EVOCARELAB by itself or as an assignee, is the owner of all the intellectual and industrial property rights of its website, as well as the elements contained therein (by way of example: images, sound, audio, video, software or texts; brands or logos, color combinations, structure and design, selection of materials used, computer programs necessary for its operation, access and use, etc.), owned by EVOCARELAB or its licensors."}
              </p>
              <p>
                <strong>{isSpanish ? "Todos los derechos reservados." : "All rights reserved."}</strong> {isSpanish 
                  ? "En virtud de lo dispuesto en los artículos 8 y 32.1, párrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de EVOCARELAB."
                  : "By virtue of the provisions of articles 8 and 32.1, second paragraph, of the Intellectual Property Law, the reproduction, distribution and public communication, including its modification, of all or part of the contents of this website, for commercial purposes, in any support and by any technical means, without the authorization of EVOCARELAB, are expressly prohibited."}
              </p>
            </section>

            <section className="mt-12">
              <h2>{t('pages.legal.h5')}</h2>
              <p>
                {isSpanish
                  ? "EVOCARELAB no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo."
                  : "EVOCARELAB is not responsible, in any case, for damages of any nature that could be caused, by way of example: errors or omissions in the contents, lack of availability of the portal or the transmission of viruses or malicious or harmful programs in the contents, despite having adopted all the necessary technological measures to avoid it."}
              </p>
            </section>

            <section className="mt-12">
              <h2>{t('pages.legal.h6')}</h2>
              <p>
                {isSpanish
                  ? "EVOCARELAB se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal."
                  : "EVOCARELAB reserves the right to carry out modifications it deems appropriate in its portal without prior notice, being able to change, delete or add both the contents and services provided through it and the way in which they appear presented or located in its portal."}
              </p>
            </section>

            <section className="mt-12">
              <h2>{t('pages.legal.h7')}</h2>
              <p>
                {isSpanish
                  ? "La relación entre EVOCARELAB y el USUARIO se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Madrid, España, salvo que la ley aplicable disponga otra cosa en materia de jurisdicción competente."
                  : "The relationship between EVOCARELAB and the USER will be governed by current Spanish regulations and any controversy will be submitted to the Courts and tribunals of the city of Madrid, Spain, unless the applicable law provides otherwise in matters of competent jurisdiction."}
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
