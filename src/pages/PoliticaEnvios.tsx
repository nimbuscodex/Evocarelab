import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function PoliticaEnvios() {
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
              {t('pages.shipping.badge')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight">
              {t('pages.shipping.title')}<span className="italic font-light">{t('pages.shipping.titleItalic')}</span>
            </h1>
            <p className="text-gray-500 font-light max-w-2xl">
              {t('pages.shipping.p1')}
            </p>
          </div>

          <div className="prose prose-lg prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-p:text-gray-600 prose-p:font-light prose-a:text-gold hover:prose-a:text-ink max-w-none">
            
            <section className="mt-12">
              <h2>{t('pages.shipping.h1')}</h2>
              {isSpanish ? (
                <>
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
                    Todos nuestros envíos son <strong>gratuitos</strong>. Los gastos de envío ya están incluidos en el precio final de los rituales que adquieres en nuestra web.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    At EVOCARELAB we ship to the entire national territory (Peninsula and Balearic Islands) and internationally (check availability for your region at checkout).
                  </p>
                  <h3>Delivery times</h3>
                  <ul>
                    <li><strong>Standard Shipping:</strong> Estimated preparation and transit time is 3 to 5 business days.</li>
                    <li><strong>Express Shipping:</strong> Estimated time is 24 to 48 business hours for orders placed before 2:00 PM.</li>
                  </ul>
                  <p>
                    <em>*Delivery times may be affected in periods of high demand (such as Black Friday, sales or Christmas) or due to force majeure reasons external to our logistics company.</em>
                  </p>
                  <h3>Shipping costs</h3>
                  <p>
                    All our shipments are <strong>free</strong>. Shipping costs are already included in the final price of the rituals you purchase on our website.
                  </p>
                </>
              )}
            </section>

            <section className="mt-12">
              <h2>{t('pages.shipping.h2')}</h2>
              {isSpanish ? (
                <>
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
                </>
              ) : (
                <>
                  <p>
                    In accordance with current legislation, you have a period of <strong>14 calendar days</strong> from the receipt of the order to exercise your right of withdrawal and request the return of the product.
                  </p>
                  <h3>Conditions for the return</h3>
                  <p>
                    Since EVOCARELAB products are cosmetics and sealed goods related to health or hygiene, <strong>returns of products that have been unsealed, opened or used</strong> after delivery will not be accepted.
                  </p>
                  <p>
                    To accept the return, the product must be in its original intact packaging, with its security seals and in perfect condition.
                  </p>
                </>
              )}
            </section>

            <section className="mt-12">
              <h2>{t('pages.shipping.h3')}</h2>
              <p>
                {isSpanish
                  ? "Si al recibir tu pedido detectas que la caja está dañada, el producto presenta algún defecto de fábrica o no coincide con tu compra, ponte en contacto con nosotros lo antes posible (en un plazo máximo de 48 horas desde la recepción)."
                  : "If upon receiving your order you detect that the box is damaged, the product has a factory defect or does not match your purchase, please contact us as soon as possible (within a maximum period of 48 hours from receipt)."}
              </p>
              <p>
                {isSpanish
                  ? "En estos casos, EVOCARELAB se hará cargo de los gastos de recogida del producto defectuoso y del envío del nuevo producto de reemplazo, o bien procederá a un reembolso completo del importe pagado."
                  : "In these cases, EVOCARELAB will take care of the collection costs of the defective product and the shipment of the new replacement product, or will proceed to a full refund of the amount paid."}
              </p>
            </section>

            <section className="mt-12">
              <h2>{t('pages.shipping.h4')}</h2>
              <p>{isSpanish ? "Para solicitar una devolución, sigue estos pasos:" : "To request a return, follow these steps:"}</p>
              {isSpanish ? (
                <ol>
                  <li>Escribe un correo electrónico a <strong>nimbuscodex@gmail.com</strong> indicando tu número de pedido y los motivos de la devolución.</li>
                  <li>Nuestro equipo de atención al cliente revisará tu caso y te proporcionará las instrucciones y la etiqueta de envío si procede.</li>
                  <li>Empaqueta el artículo de forma segura, preferiblemente en la misma caja de envío en la que lo recibiste.</li>
                  <li>Una vez recibamos el paquete en nuestros almacenes (Calle Lisboa 6, Nave 23, Valdemoro, Madrid) y comprobemos que cumple con las condiciones arriba mencionadas, procesaremos el reembolso.</li>
                </ol>
              ) : (
                <ol>
                  <li>Write an email to <strong>nimbuscodex@gmail.com</strong> indicating your order number and the reasons for the return.</li>
                  <li>Our customer service team will review your case and provide you with instructions and the shipping label if applicable.</li>
                  <li>Pack the item safely, preferably in the same shipping box in which you received it.</li>
                  <li>Once we receive the package in our warehouses (Calle Lisboa 6, Nave 23, Valdemoro, Madrid) and verify that it meets the conditions mentioned above, we will process the refund.</li>
                </ol>
              )}
              <p>
                {isSpanish
                  ? "El reembolso se realizará a través del mismo método de pago que utilizaste para la compra, en un plazo de 5 a 10 días laborables desde la recepción y revisión del producto devuelto. Salvo que el motivo de la devolución sea por producto defectuoso, el cliente deberá asumir los gastos de envío de la devolución."
                  : "The refund will be made through the same payment method you used for the purchase, within a period of 5 to 10 business days from the receipt and review of the returned product. Unless the reason for the return is a defective product, the customer must bear the return shipping costs."}
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
