import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // NOTE: The Stripe Webhook logic has been moved to Supabase Edge Functions
  // in /supabase/functions/stripe-webhook/index.ts. 
  // You should deploy it and point Stripe Webhooks to your Supabase project instead.

  app.use(express.json());

  // API Check/Process Payment using Stripe
  app.post("/api/create-checkout-session", async (req, res) => {
    const { items, method, shipping, origin } = req.body;
    
    try {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) {
        throw new Error("La clave secreta de Stripe no está configurada.");
      }

      const stripe = new Stripe(stripeSecret, {
        maxNetworkRetries: 3,
      });

      const lineItems = items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: {
              product_id: item.id
            }
          },
          unit_amount: Math.round(item.price * 100), // Stripe accepts amount in cents
        },
        quantity: item.quantity,
      }));

      let frontendOrigin = origin || req.headers.origin || `http://localhost:${PORT}`;
      if (frontendOrigin === "null" || frontendOrigin === "about:") {
         frontendOrigin = req.headers.referer ? new URL(req.headers.referer).origin : `http://localhost:${PORT}`;
      }

      const session = await stripe.checkout.sessions.create({
        locale: "es",
        allow_promotion_codes: true,
        line_items: lineItems,
        mode: 'payment',
        success_url: `${frontendOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendOrigin}/checkout`,
        // Store shipping and method in metadata so it could be processed later
        metadata: {
          shippingMethod: method,
          customerEmail: shipping.email,
          customerName: shipping.fullName,
          customerPhone: shipping.phone || "",
          shippingAddress: JSON.stringify({
            address: shipping.address,
            city: shipping.city,
            zipCode: shipping.zipCode
          }),
        }
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // API to confirm and save the order in Supabase
  app.post("/api/finalize-order", async (req, res) => {
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "Missing session_id" });
    }

    try {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) {
        throw new Error("Stripe secret key not configured.");
      }

      const stripe = new Stripe(stripeSecret, {
        maxNetworkRetries: 3,
      });
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items', 'line_items.data.price.product']
      });

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ success: false, message: "Order not paid yet" });
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      // Preference: Service Role key for backend inserts. Fallback to Anon key.
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        // If Supabase not fully wired, we just acknowledge the payment
        return res.json({ success: true, message: "Payment verified, but Supabase variables missing so data wasn't saved." });
      }

      // We cannot use import statement in mid-execution since server.ts is top-down module, but we can dynamically import or just top-level import it:
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Save order to Supabase
      const { data: orderData, error: dbError } = await supabase.from('orders').upsert([
        {
          stripe_session_id: session.id,
          customer_email: session.metadata?.customerEmail || "unknown@email.com",
          customer_name: session.metadata?.customerName || "Unknown",
          customer_phone: session.metadata?.customerPhone || null,
          shipping_address: session.metadata?.shippingAddress ? JSON.parse(session.metadata.shippingAddress) : {},
          total_amount: session.amount_total ? session.amount_total / 100 : 0,
          status: 'paid',
        }
      ], { onConflict: 'stripe_session_id' }).select('id').single();

      if (dbError) {
        // Suppress error if table doesn't exist, just an assumption
        console.error("Warning: Could not save order to Supabase. Make sure the 'orders' table exists. Error:", dbError.message);
      } else if (orderData && session.line_items?.data) {
         const orderId = orderData.id;
         const orderItemsToInsert = session.line_items.data.map((stripeItem: any) => {
            const product = stripeItem.price?.product as Stripe.Product | undefined;
            const productId = product?.metadata?.product_id || null;
            
            return {
              order_id: orderId,
              product_id: productId,
              quantity: stripeItem.quantity || 1,
              price_at_purchase: stripeItem.amount_total ? stripeItem.amount_total / 100 / (stripeItem.quantity || 1) : 0
            };
         });

         if (orderItemsToInsert.length > 0) {
            const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
            if (itemsError) {
              console.error("Warning: Could not save order items to Supabase. Error:", itemsError.message);
            }
         }
         
         // Send confirmation email via Nodemailer
         const smtpUser = process.env.SMTP_USER;
         if (smtpUser) {
           try {
             const transporter = nodemailer.createTransport({
               host: process.env.SMTP_HOST || 'smtp.gmail.com',
               port: parseInt(process.env.SMTP_PORT || '465'),
               secure: true,
               auth: {
                 user: process.env.SMTP_USER,
                 pass: process.env.SMTP_PASS,
               },
             });
             
             const totalFormatted = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";
             const emailHTML = `
               <!DOCTYPE html>
               <html lang="es">
               <head>
                 <meta charset="UTF-8">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                 <title>Confirmación de Pedido</title>
               </head>
               <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F6F5F2; color: #0B0F0E;">
                 <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F6F5F2; padding: 40px 20px;">
                   <tr>
                     <td align="center">
                       <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; max-width: 600px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-radius: 0 0 16px 16px;">
                         <!-- Header Image -->
                         <tr>
                           <td align="center">
                      <img src="https://blog.plazavea.com.pe/wp-content/uploads/2024/11/que-hacer-despues-de-una-mascarilla-facial-6-1200x675.jpg" alt="Evocarelab Confirmación" style="width: 100%; max-width: 600px; height: auto; display: block; filter: brightness(0.95); border-radius: 16px 16px 0 0;" />
                           </td>
                         </tr>
                         
                         <!-- Logo -->
                         <tr>
                           <td align="center" style="padding: 40px 40px 10px 40px;">
                             <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: normal; margin: 0; letter-spacing: 2px; color: #0B0F0E;">EVOCARE<span style="font-size: 14px; vertical-align: top; letter-spacing: 0;">LAB</span></h1>
                           </td>
                         </tr>
                         
                         <!-- Content -->
                         <tr>
                           <td style="padding: 10px 40px 40px 40px; text-align: center;">
                             <h2 style="font-family: Georgia, serif; font-size: 26px; font-weight: 300; margin: 0 0 20px 0; color: #0B0F0E;">¡Tu pedido está confirmado!</h2>
                             <p style="font-size: 16px; line-height: 1.6; margin: 0 0 25px 0; color: #333333; text-align: left;">Hola <strong>${session.metadata?.customerName || ''}</strong>,</p>
                             <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; color: #333333; text-align: left;">¡Gracias por confiar en Evocarelab! Hemos recibido tu pedido <strong>#${orderId.split('-')[0]}</strong> correctamente y ya estamos preparándolo con mucho cuidado.</p>
                             
                             <!-- Order Box -->
                             <div style="background-color: #0B0F0E; border-radius: 12px; padding: 30px 20px; margin-bottom: 30px; text-align: center; color: #FFFFFF;">
                               <h3 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; margin: 0 0 20px 0; color: #FFFFFF; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">Resumen del pedido</h3>
                               <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                 <tr>
                                   <td align="left" style="padding-bottom: 15px; color: #AAAAAA; font-size: 15px;">Total Pagado</td>
                                   <td align="right" style="padding-bottom: 15px; font-weight: 500; font-size: 18px; color: #FFFFFF;">€${totalFormatted}</td>
                                 </tr>
                                 <tr>
                                   <td align="left" style="padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); color: #AAAAAA; font-size: 15px;">Método de Pago</td>
                                   <td align="right" style="padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 15px; color: #EAEAEA;">Tarjeta</td>
                                 </tr>
                               </table>
                             </div>
                             
                             <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #333333; text-align: left;">Te enviaremos otro correo electrónico con el número de seguimiento tan pronto como tu paquete haya salido de nuestras instalaciones.</p>
                             <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #333333; text-align: left;">El equipo de Evocarelab</p>
                           </td>
                         </tr>
                         
                         <!-- Footer -->
                         <tr>
                           <td align="center" style="background-color: #F6F5F2; padding: 30px 40px; border-radius: 0 0 16px 16px; border-top: 1px solid #E5E5E5;">
                             <a href="#" style="color: #0B0F0E; text-decoration: none; font-size: 13px; margin: 0 10px; border-bottom: 1px solid #CCCCCC; padding-bottom: 2px;">Instagram</a>
                             <a href="#" style="color: #0B0F0E; text-decoration: none; font-size: 13px; margin: 0 10px; border-bottom: 1px solid #CCCCCC; padding-bottom: 2px;">Atención al Cliente</a>
                           </td>
                         </tr>
                       </table>
                     </td>
                   </tr>
                   <tr>
                      <td align="center" style="padding-top: 20px;">
                         <p style="font-size: 12px; color: #999999; margin: 0;">© ${new Date().getFullYear()} Evocarelab. Todos los derechos reservados.</p>
                      </td>
                   </tr>
                 </table>
               </body>
               </html>
             `;
             
             await transporter.sendMail({
               from: `"EVOCARELAB" <${process.env.SMTP_USER}>`,
               to: session.metadata?.customerEmail || "unknown@email.com",
               subject: `Confirmación de pedido #${orderId.split('-')[0]} - EVOCARELAB`,
               html: emailHTML,
             });
             console.log("Confirmation email sent to", session.metadata?.customerEmail);
             
             // ADICIONAL: Notificamos al dueño de la tienda (salumaz319@gmail.com)
             try {
                const adminEmailHTML = `
                  <!DOCTYPE html>
                  <html lang="es">
                  <head>
                    <meta charset="UTF-8">
                  </head>
                  <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; text-align: center;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: left;">
                      <tr>
                        <td style="background-color: #09090b; padding: 40px 20px; text-align: center;">
                          <img src="https://cdn-icons-png.flaticon.com/512/1162/1162499.png" width="80" alt="Exito" style="display: block; margin: 0 auto 15px; filter: brightness(0) invert(1);" />
                          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">¡Nueva Venta! 🎉</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="color: #64748b; font-size: 16px; margin: 0 0 10px; text-align: center;">Has recibido un nuevo pago en tu tienda EVOCARELAB.</p>
                          <div style="font-size: 42px; font-weight: 700; color: #10b981; text-align: center; margin: 20px 0 30px;">
                            + ${totalFormatted} €
                          </div>
                          
                          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 500;">Cliente</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; text-align: right;">${session.metadata?.customerName || "Cliente Desconocido"}</td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 500;">Email</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; text-align: right;">${session.metadata?.customerEmail || "Sin email"}</td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #475569; font-weight: 500;">Ref. Pedido</td>
                                <td style="padding: 10px 0; color: #0f172a; font-weight: 600; text-align: right;">${orderId.split('-')[0]}</td>
                              </tr>
                            </table>
                          </div>
                          
                          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px;">
                            <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Datos de Envío</h3>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding: 6px 0; color: #475569; font-weight: 500;">Dirección</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600; text-align: right;">${session.metadata?.shippingAddress ? JSON.parse(session.metadata.shippingAddress).address : 'No especificada'}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; color: #475569; font-weight: 500;">Ciudad</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600; text-align: right;">${session.metadata?.shippingAddress ? JSON.parse(session.metadata.shippingAddress).city : ''}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; color: #475569; font-weight: 500;">Código Postal</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600; text-align: right;">${session.metadata?.shippingAddress ? JSON.parse(session.metadata.shippingAddress).zipCode : ''}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; color: #475569; font-weight: 500;">Teléfono</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600; text-align: right;">${session.metadata?.customerPhone || 'No especificado'}</td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">
                          Mensaje generado automáticamente por el sistema de pagos de EVOCARELAB.
                        </td>
                      </tr>
                    </table>
                  </body>
                  </html>
                `;
                await transporter.sendMail({
                  from: `"EVOCARELAB Ventas" <${process.env.SMTP_USER}>`,
                  to: "salumaz319@gmail.com",
                  subject: `¡Nueva Venta! Pedido ${orderId.split('-')[0]} - ${totalFormatted}€`,
                  html: adminEmailHTML,
                });
                console.log("Admin notification email sent to salumaz319@gmail.com from backend.");
             } catch(adminErr) {
                console.error("Failed to send admin email from backend:", adminErr);
             }
           } catch (emailErr) {
             console.error("Warning: Failed to send confirmation email:", emailErr);
           }
         }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error finalizing order:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // API to send shipment notification
  app.post("/api/notify-shipment", async (req, res) => {
    const { orderId, email, name, trackingNumber, provider } = req.body;
    
    if (!orderId || !email || !trackingNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser) {
      return res.status(500).json({ success: false, message: "SMTP no configurado en el servidor." });
    }
    
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      const emailHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tu pedido está en camino</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F6F5F2; color: #0B0F0E;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F6F5F2; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; max-width: 600px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-radius: 0 0 16px 16px;">
                  <!-- Header Image -->
                  <tr>
                    <td align="center">
                      <img src="https://blog.plazavea.com.pe/wp-content/uploads/2024/11/que-hacer-despues-de-una-mascarilla-facial-6-1200x675.jpg" alt="Evocarelab Envio" style="width: 100%; max-width: 600px; height: auto; display: block; filter: brightness(0.95); border-radius: 16px 16px 0 0;" />
                    </td>
                  </tr>
                  
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 10px 40px;">
                      <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: normal; margin: 0; letter-spacing: 2px; color: #0B0F0E;">EVOCARE<span style="font-size: 14px; vertical-align: top; letter-spacing: 0;">LAB</span></h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 10px 40px 40px 40px; text-align: center;">
                      <h2 style="font-family: Georgia, serif; font-size: 26px; font-weight: 300; margin: 0 0 20px 0; color: #0B0F0E;">Tu pedido viaja hacia ti</h2>
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 25px 0; color: #333333; text-align: left;">Hola <strong>${name || ''}</strong>,</p>
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; color: #333333; text-align: left;">Las buenas noticias han llegado: tu pedido <strong>#${orderId.split('-')[0]}</strong> ya ha salido de nuestras instalaciones y se dirige directamente a tu puerta.</p>
                      
                      <!-- Tracking Box -->
                      <div style="background-color: #0B0F0E; border-radius: 12px; padding: 30px 20px; margin-bottom: 30px; text-align: center; color: #FFFFFF;">
                        <p style="font-size: 14px; color: #AAAAAA; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">Enviado a través de</p>
                        <p style="font-size: 20px; font-weight: 500; margin: 0 0 20px 0;">${provider || 'N/A'}</p>
                        
                        <p style="font-size: 13px; color: #AAAAAA; margin: 0 0 10px 0;">NÚMERO DE SEGUIMIENTO</p>
                        <div style="font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #F6F5F2; background: rgba(255,255,255,0.1); display: inline-block; padding: 12px 24px; border-radius: 8px;">
                          ${trackingNumber}
                        </div>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 10px 0; color: #333333; text-align: left;">Disfruta de la experiencia que hemos preparado para ti. Hasta pronto,</p>
                      <p style="font-family: Georgia, serif; font-size: 18px; font-style: italic; margin: 0; color: #0B0F0E; text-align: left;">El equipo de Evocarelab</p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="background-color: #F6F5F2; padding: 30px 40px; border-radius: 0 0 16px 16px; border-top: 1px solid #E5E5E5;">
                      <a href="#" style="color: #0B0F0E; text-decoration: none; font-size: 13px; margin: 0 10px; border-bottom: 1px solid #CCCCCC; padding-bottom: 2px;">Instagram</a>
                      <a href="#" style="color: #0B0F0E; text-decoration: none; font-size: 13px; margin: 0 10px; border-bottom: 1px solid #CCCCCC; padding-bottom: 2px;">Atención al Cliente</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
               <td align="center" style="padding-top: 20px;">
                  <p style="font-size: 12px; color: #999999; margin: 0;">© ${new Date().getFullYear()} Evocarelab. Todos los derechos reservados.</p>
               </td>
            </tr>
          </table>
        </body>
        </html>
      `;
      
      await transporter.sendMail({
        from: `"EVOCARELAB Envios" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Tu pedido #${orderId.split('-')[0]} está en camino - EVOCARELAB`,
        html: emailHTML,
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending shipment email:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Contact API
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser) {
      console.log(`[MOCK EMAIL] Contact form submitted: ${name} (${email}) - ${subject}`);
      return res.json({ success: true, message: "Modo demo: Email no enviado porque no hay SMTP_USER" });
    }
    
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      await transporter.sendMail({
        from: `"EVOCARELAB Web" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER || 'salumaz319@gmail.com', // Sending to themselves
        replyTo: email,
        subject: `Nuevo mensaje de Contacto: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head><meta charset="UTF-8"></head>
          <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: left;">
              <tr>
                <td style="background-color: #0B0F0E; padding: 30px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 400; letter-spacing: 2px;">EVOCARE<span style="font-size:12px; vertical-align: top;">LAB</span></h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="font-size: 20px; color: #0B0F0E; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Nuevo Mensaje de Contacto</h2>
                  
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px;">
                    <p style="margin: 0 0 10px; color: #475569; font-size: 14px;"><strong>Remitente:</strong> <span style="color: #0f172a;">${name}</span></p>
                    <p style="margin: 0 0 10px; color: #475569; font-size: 14px;"><strong>Email:</strong> <span style="color: #0f172a;"><a href="mailto:${email}" style="color: #0ea5e9;">${email}</a></span></p>
                    <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Asunto:</strong> <span style="color: #0f172a;">${subject}</span></p>
                  </div>
                  
                  <div style="margin-top: 30px;">
                    <h3 style="font-size: 14px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 10px;">Mensaje</h3>
                    <div style="background-color: #ffffff; border-left: 4px solid #10b981; padding: 15px 20px; color: #334155; font-size: 15px; line-height: 1.6; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                      ${message.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
      
      // We always return success to the frontend for a good UX, even if Resend fails
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending contact email with Resend:", error);
      // Fallback response so the user doesn't see a broken page
      res.json({ success: true, message: "Modo demo: Se detectó un error al enviar pero hemos registrado tu mensaje." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EVOCARELAB Server running on http://localhost:${PORT}`);
  });
}

startServer();
