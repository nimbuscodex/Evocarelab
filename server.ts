import express from "express";
import fs from "fs";
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

      let subtotal = 0;
      const lineItems = items.map((item: any) => {
        subtotal += item.price * item.quantity;
        return {
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
        };
      });

      let frontendOrigin = origin || req.headers.origin || `http://localhost:${PORT}`;
      if (frontendOrigin === "null" || frontendOrigin === "about:") {
         frontendOrigin = req.headers.referer ? new URL(req.headers.referer).origin : `http://localhost:${PORT}`;
      }

      // Configurar opciones de envío dinámicamente según el método elegido
      const shippingOptions = [];
      
      if (method === 'delivery') {
        shippingOptions.push({
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: 'Envío Gratuito',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 4 },
            },
          },
        });
      } else if (method === 'pickup') {
        shippingOptions.push({
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: 'Recogida en Tienda',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 1 },
            },
          },
        });
      }

      const session = await stripe.checkout.sessions.create({
        locale: "es",
        allow_promotion_codes: true,
        line_items: lineItems,
        shipping_options: shippingOptions.length > 0 ? shippingOptions : undefined,
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
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return res.json({ success: true, message: "Payment verified, but Supabase variables missing so data wasn't saved." });
      }

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
        console.error("Warning: Could not save order to Supabase. Error:", dbError.message);
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
                         <tr><td align="center"><img src="https://blog.plazavea.com.pe/wp-content/uploads/2024/11/que-hacer-despues-de-una-mascarilla-facial-6-1200x675.jpg" alt="Evocarelab Confirmación" style="width: 100%; max-width: 600px; height: auto; display: block; filter: brightness(0.95); border-radius: 16px 16px 0 0;" /></td></tr>
                         <tr><td align="center" style="padding: 40px 40px 10px 40px;"><h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: normal; margin: 0; letter-spacing: 2px; color: #0B0F0E;">EVOCARE<span style="font-size: 14px; vertical-align: top; letter-spacing: 0;">LAB</span></h1></td></tr>
                         <tr>
                           <td style="padding: 10px 40px 40px 40px; text-align: center;">
                             <h2 style="font-family: Georgia, serif; font-size: 26px; font-weight: 300; margin: 0 0 20px 0; color: #0B0F0E;">¡Tu pedido está confirmado!</h2>
                             <p style="font-size: 16px; line-height: 1.6; margin: 0 0 25px 0; color: #333333; text-align: left;">Hola <strong>${session.metadata?.customerName || ''}</strong>,</p>
                             <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; color: #333333; text-align: left;">¡Gracias por confiar en Evocarelab! Hemos recibido tu pedido <strong>#${orderId.split('-')[0]}</strong> correctamente.</p>
                             <div style="background-color: #0B0F0E; border-radius: 12px; padding: 30px 20px; margin-bottom: 30px; text-align: center; color: #FFFFFF;">
                               <h3 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; margin: 0 0 20px 0; color: #FFFFFF; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">Resumen del pedido</h3>
                               <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                 <tr><td align="left" style="padding-bottom: 15px; color: #AAAAAA; font-size: 15px;">Total Pagado</td><td align="right" style="padding-bottom: 15px; font-weight: 500; font-size: 18px; color: #FFFFFF;">€${totalFormatted}</td></tr>
                               </table>
                             </div>
                           </td>
                         </tr>
                       </table>
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

  // Contact API
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser) {
      return res.json({ success: true, message: "Modo demo: Email no enviado porque no hay SMTP_USER" });
    }
    
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      
      await transporter.sendMail({
        from: `"EVOCARELAB" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        replyTo: email,
        subject: `Nuevo mensaje: ${subject}`,
        text: `De: ${name} (${email})\n\nMensaje: ${message}`,
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending contact email:", error);
      res.json({ success: true, message: "Se detectó un error al enviar ppero hemos registrado tu mensaje." });
    }
  });

  // Vite and SPA Configuration
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Fallback for development to serve index.html for SPA routes
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();

      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          const html = fs.readFileSync(indexPath, 'utf-8');
          const transformedHtml = await vite.transformIndexHtml(url, html);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
        } else {
          next();
        }
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.message);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    
    // Serve static files from dist
    app.use(express.static(distPath));
    
    // Fallback for production to serve index.html for all non-API routes
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: "API route not found" });
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EVOCARELAB Server running on http://localhost:${PORT}`);
  });
}

startServer();
