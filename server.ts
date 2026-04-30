import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// API Check/Process Payment using Stripe
app.post("/api/create-checkout-session", async (req: Request, res: Response) => {
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
          metadata: { product_id: item.id }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    let frontendOrigin = origin || req.headers.origin || `http://localhost:3000`;
    if (frontendOrigin === "null" || frontendOrigin === "about:") {
       frontendOrigin = req.headers.referer ? new URL(req.headers.referer).origin : `http://localhost:3000`;
    }

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
app.post("/api/finalize-order", async (req: Request, res: Response) => {
  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ success: false, message: "Missing session_id" });
  }

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) throw new Error("Stripe secret key not configured.");

    const stripe = new Stripe(stripeSecret, { maxNetworkRetries: 3 });
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'line_items.data.price.product']
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: "Order not paid yet" });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

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

      if (!dbError && orderData && session.line_items?.data) {
        const orderId = orderData.id;
        const orderItemsToInsert = session.line_items.data.map((stripeItem: any) => {
          const product = stripeItem.price?.product as Stripe.Product | undefined;
          return {
            order_id: orderId,
            product_id: product?.metadata?.product_id || null,
            quantity: stripeItem.quantity || 1,
            price_at_purchase: stripeItem.amount_total ? stripeItem.amount_total / 100 / (stripeItem.quantity || 1) : 0
          };
        });

        if (orderItemsToInsert.length > 0) {
          await supabase.from('order_items').insert(orderItemsToInsert);
        }
        
        // Email confirmation logic
        const smtpUser = process.env.SMTP_USER;
        if (smtpUser) {
          try {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST || 'smtp.gmail.com',
              port: parseInt(process.env.SMTP_PORT || '465'),
              secure: true,
              auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            });
            
            const totalFormatted = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";
            const emailHTML = `<h1>Confirmación de Pedido</h1><p>Hola ${session.metadata?.customerName}, tu pedido #${orderId.split('-')[0]} ha sido confirmado por €${totalFormatted}.</p>`;
            
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
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error finalizing order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Contact API
app.post("/api/contact", async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  
  const smtpUser = process.env.SMTP_USER;
  if (!smtpUser) return res.json({ success: true, message: "Modo demo: Email no enviado" });
  
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
    res.json({ success: true, message: "Error al enviar pero mensaje registrado." });
  }
});

// API to notify shipment
app.post("/api/notify-shipment", async (req: Request, res: Response) => {
  const { orderId, email, name, trackingNumber, provider } = req.body;
  
  const smtpUser = process.env.SMTP_USER;
  if (!smtpUser) return res.json({ success: true, message: "Modo demo: Email no enviado" });
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    
    const trackingLink = provider === 'Correos' 
      ? `https://www.correos.es/es/es/herramientas/localizador/detalles?numero=${trackingNumber}`
      : `https://www.google.com/search?q=tracking+${trackingNumber}`;

    const emailHTML = `
      <h1>¡Tu pedido ha sido enviado!</h1>
      <p>Hola ${name},</p>
      <p>Tu pedido ${orderId} ha sido enviado a través de ${provider}.</p>
      <p>Número de seguimiento: <strong>${trackingNumber}</strong></p>
      <p><a href="${trackingLink}">Seguir mi paquete</a></p>
    `;
    
    await transporter.sendMail({
      from: `"EVOCARELAB" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Tu pedido de de EVOCARELAB ha sido enviado`,
      html: emailHTML,
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error sending shipment notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

async function startServer() {
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    
    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.includes('.')) return next();
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else next();
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.message);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.includes('.')) return next();
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) res.sendFile(indexPath);
      else next();
    });
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`EVOCARELAB Server running on http://localhost:${PORT}`);
    });
  }
}

// For local running or standard container environments
const isMainModule = fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMainModule || process.env.RUN_SERVER === 'true') {
  startServer();
}

export default app;
