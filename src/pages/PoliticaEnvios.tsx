import { useEffect } from 'react';
import { motion } from 'motion/react';

export default function PoliticaEnvios() {
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
              Legal y Soporte
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight">
              Política de Envíos y <span className="italic font-light">Devoluciones</span>
            </h1>
            <p className="text-gray-500 font-light max-w-2xl">
              Condiciones sobre el envío de nuestros productos y las políticas aplicables a cambios y devoluciones.
            </p>
          </div>

          <div className="prose prose-lg prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-p:text-gray-600 prose-p:font-light prose-a:text-gold hover:prose-a:text-ink max-w-none">
            
            <section className="mt-12">
              <h2>1. Política de Envíos</h2>
              <p>
                En EVOCARELAB realizamos envíos a todo el territorio nacional (Península y Baleares) e internacional (consulta disponibilidad para tu región en el checkout).
              </p>
              <h3>Plazos de entrega</h3>
              <ul>
                <li><strong>Envío Estándar:</strong> El tiempo estimado de preparación y tránsito es de 3 a 5 días laborables.</li>
                <li><strong>Envío Express:</strong> El tiempo estimado es de 24 a 48 horas laborables para pedidos realizados antes de las 14:00h.</li>
              </ul>
              <p>
                <em>*Los plazos de entrega pueden verse afectados en periodos de alta demanda (como Black Friday, rebajas o Navidad) o por causas de fuerza mayor externas a nuestra empresa de logística.</em>
              </p>
              <h3>Gastos de envío</h3>
              <p>
                Los gastos de envío se calcularán automáticamente durante el proceso de pago ("Checkout") antes de finalizar el pedido. Generalmente, ofrecemos envío gratuito para pedidos superiores a un importe determinado que será anunciado en la web.
              </p>
            </section>

            <section className="mt-12">
              <h2>2. Política de Devoluciones y Derecho de Desistimiento</h2>
              <p>
                De acuerdo con la legislación vigente, dispones de un plazo de <strong>14 días naturales</strong> desde la recepción del pedido para ejercer tu derecho de desistimiento y solicitar la devolución del producto.
              </p>
              <h3>Condiciones para la devolución</h3>
              <p>
                Dado que los productos de EVOCARELAB son cosméticos y bienes precintados relacionados con la salud o la higiene, <strong>no se aceptará la devolución de productos que hayan sido desprecintados, abiertos o utilizados</strong> tras la entrega. 
              </p>
              <p>
                Para aceptar la devolución, el producto debe estar en su embalaje original intacto, con sus precintos de seguridad y en perfectas condiciones.
              </p>
            </section>

            <section className="mt-12">
              <h2>3. Productos Defectuosos o Dañados</h2>
              <p>
                Si al recibir tu pedido detectas que la caja está dañada, el producto presenta algún defecto de fábrica o no coincide con tu compra, ponte en contacto con nosotros lo antes posible (en un plazo máximo de 48 horas desde la recepción).
              </p>
              <p>
                En estos casos, EVOCARELAB se hará cargo de los gastos de recogida del producto defectuoso y del envío del nuevo producto de reemplazo, o bien procederá a un reembolso completo del importe pagado.
              </p>
            </section>

            <section className="mt-12">
              <h2>4. Proceso de Devolución</h2>
              <p>Para solicitar una devolución, sigue estos pasos:</p>
              <ol>
                <li>Escribe un correo electrónico a <strong>nimbuscodex@gmail.com</strong> indicando tu número de pedido y los motivos de la devolución.</li>
                <li>Nuestro equipo de atención al cliente revisará tu caso y te proporcionará las instrucciones y la etiqueta de envío si procede.</li>
                <li>Empaqueta el artículo de forma segura, preferiblemente en la misma caja de envío en la que lo recibiste.</li>
                <li>Una vez recibamos el paquete en nuestros almacenes (Calle Lisboa 6, Nave 23, Valdemoro, Madrid) y comprobemos que cumple con las condiciones arriba mencionadas, procesaremos el reembolso.</li>
              </ol>
              <p>
                El reembolso se realizará a través del mismo método de pago que utilizaste para la compra, en un plazo de 5 a 10 días laborables desde la recepción y revisión del producto devuelto. Salvo que el motivo de la devolución sea por producto defectuoso, <strong>el cliente deberá asumir los gastos de envío de la devolución</strong>.
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
