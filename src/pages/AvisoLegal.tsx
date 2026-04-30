import { useEffect } from 'react';
import { motion } from 'motion/react';

export default function AvisoLegal() {
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
              Aviso <span className="italic font-light">Legal</span>
            </h1>
            <p className="text-gray-500 font-light max-w-2xl">
              Información legal y condiciones generales de uso del sitio web de EVOCARELAB.
            </p>
          </div>

          <div className="prose prose-lg prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-p:text-gray-600 prose-p:font-light prose-a:text-gold hover:prose-a:text-ink max-w-none">
            
            <section className="mt-12">
              <h2>1. Datos Identificativos</h2>
              <p>
                En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSICE), a continuación se reflejan los siguientes datos:
              </p>
              <ul>
                <li><strong>Empresa titular:</strong> EVOCARELAB SCIENCE (en adelante, EVOCARELAB)</li>
                <li><strong>Domicilio social:</strong> Calle Lisboa 6, Nave 23, Polígono Industrial Albresa, Valdemoro, 28340, Madrid, España</li>
                <li><strong>Correo electrónico de contacto:</strong> <a href="mailto:nimbuscodex@gmail.com">nimbuscodex@gmail.com</a></li>
              </ul>
            </section>

            <section className="mt-12">
              <h2>2. Usuarios</h2>
              <p>
                El acceso y/o uso de este portal de EVOCARELAB atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.
              </p>
            </section>

            <section className="mt-12">
              <h2>3. Uso del portal</h2>
              <p>
                Nuestra página web proporciona el acceso a multitud de informaciones, servicios, programas o datos (en adelante, "los contenidos") en Internet pertenecientes a EVOCARELAB o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro que fuese necesario para acceder a determinados servicios o contenidos.
              </p>
              <p>
                En dicho registro el USUARIO será responsable de aportar información veraz y lícita. El USUARIO se compromete a hacer un uso adecuado de los contenidos y servicios que EVOCARELAB ofrece a través de su portal y con carácter enunciativo pero no limitativo, a no emplearlos para incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.
              </p>
            </section>

            <section className="mt-12">
              <h2>4. Propiedad Intelectual e Industrial</h2>
              <p>
                EVOCARELAB por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo: imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.), titularidad de EVOCARELAB o bien de sus licenciantes.
              </p>
              <p>
                <strong>Todos los derechos reservados.</strong> En virtud de lo dispuesto en los artículos 8 y 32.1, párrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de EVOCARELAB.
              </p>
            </section>

            <section className="mt-12">
              <h2>5. Exclusión de garantías y responsabilidad</h2>
              <p>
                EVOCARELAB no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
              </p>
            </section>

            <section className="mt-12">
              <h2>6. Modificaciones</h2>
              <p>
                EVOCARELAB se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.
              </p>
            </section>

            <section className="mt-12">
              <h2>7. Legislación aplicable y jurisdicción</h2>
              <p>
                La relación entre EVOCARELAB y el USUARIO se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Madrid, España, salvo que la ley aplicable disponga otra cosa en materia de jurisdicción competente.
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
