import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express, { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    environment: process.env.NODE_ENV, 
    vercel: !!process.env.VERCEL,
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    supabaseConfigured: !!process.env.VITE_SUPABASE_URL
  });
});

// Checkout logic
const handleCheckout = async (req: Request, res: Response) => {
  const { items, method = 'delivery', shipping, origin } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "No hay productos en el carrito." });
  }

  const shippingData = shipping || {
    email: "customer@example.com",
    fullName: "Cliente App",
    phone: "",
    address: "Recogida en tienda",
    city: "",
    zipCode: ""
  };
  
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      throw new Error("La clave secreta de Stripe no está configurada.");
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2023-10-16' as any,
      maxNetworkRetries: 3,
    });

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Producto',
          images: item.image ? [item.image] : [],
          metadata: { product_id: item.id }
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    let frontendOrigin = origin || req.headers.origin || `https://${req.headers.host}`;
    if (!frontendOrigin.startsWith("http")) frontendOrigin = `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      locale: "es",
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendOrigin}/checkout`,
      metadata: {
        shippingMethod: method,
        customerEmail: shippingData.email,
        customerName: shippingData.fullName,
        shippingAddress: JSON.stringify({
          address: shippingData.address,
          city: shippingData.city,
          zipCode: shippingData.zipCode
        }),
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

app.post("/api/create-checkout-session", handleCheckout);
app.post("/api/checkout", handleCheckout);

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

// Notify Shipment API
app.post("/api/notify-shipment", async (req: Request, res: Response) => {
  const { orderId, email, name, trackingNumber, provider } = req.body;
  if (!email || !name || !trackingNumber) return res.status(400).json({ success: false, message: "Missing fields" });

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

    const emailHTML = `<h1>¡Pedido enviado!</h1><p>Hola ${name}, tu pedido ${orderId} ha sido enviado por ${provider}. Seguimiento: ${trackingNumber}. <a href="${trackingLink}">Rastrear</a></p>`;
    
    await transporter.sendMail({
      from: `"EVOCARELAB" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Tu pedido de EVOCARELAB ha sido enviado`,
      html: emailHTML,
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Finalize order
app.post("/api/finalize-order", async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ success: false, message: "Missing session_id" });

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) throw new Error("Stripe not configured.");

    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' as any });
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: "Not paid" });
    }

    // Supabase logic (optional if configured)
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('orders').upsert([{ 
        stripe_session_id: session.id, 
        status: 'paid',
        customer_email: session.metadata?.customerEmail
      }], { onConflict: 'stripe_session_id' });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function startServer() {
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    
    app.get('*', async (req, res, next) => {
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
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { index: false }));
      app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api') || req.originalUrl.includes('.')) return next();
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) res.sendFile(indexPath);
        else next();
      });
    } else {
      app.get('*', (req, res) => {
        if (req.originalUrl.startsWith('/api')) return res.status(404).json({ error: "API not found" });
        res.status(404).send("Application not built. Please run 'npm run build'.");
      });
    }
  }

  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer().catch(err => {
    console.error("Startup error:", err);
    process.exit(1);
  });
}

export default app;
