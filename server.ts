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

// API Error Handler
const apiErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("CRITICAL API Error:", err);
  if (!res.headersSent) {
    res.status(500).json({ 
      success: false, 
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    environment: process.env.NODE_ENV, 
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    supabaseConfigured: !!process.env.VITE_SUPABASE_URL
  });
});

// Checkout logic
const handleCheckout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, method = 'delivery', shipping, origin } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No hay productos en el carrito." });
    }

    const shippingData = shipping || {
      email: "customer@example.com",
      fullName: "Cliente",
      phone: "",
      address: "Recogida",
      city: "",
      zipCode: ""
    };
    
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) throw new Error("Stripe secret key not configured.");

    const stripe = new Stripe(stripeSecret);

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Producto',
          images: (item.image && item.image.startsWith('http')) ? [item.image] : [],
          metadata: { product_id: item.id }
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    let frontendOrigin = origin || req.headers.origin || process.env.APP_URL || (req.headers.host ? `https://${req.headers.host}` : '');
    if (!frontendOrigin || !frontendOrigin.startsWith("http")) {
       frontendOrigin = "http://localhost:3000"; 
    }

    const session = await stripe.checkout.sessions.create({
      locale: "es",
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendOrigin.replace(/\/$/, '')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendOrigin.replace(/\/$/, '')}/checkout`,
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
    next(error);
  }
};

app.post("/api/create-checkout-session", handleCheckout);
app.post("/api/checkout", handleCheckout);

// Order completion
app.post("/api/finalize-order", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ success: false, message: "Missing session_id" });

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) throw new Error("Stripe not configured.");

    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('orders').upsert([{ 
          stripe_session_id: session.id, 
          status: 'paid',
          customer_email: session.metadata?.customerEmail,
          total_amount: (session.amount_total || 0) / 100
        }], { onConflict: 'stripe_session_id' });
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// Contact
app.post("/api/contact", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body;
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser) return res.json({ success: true, message: "Demo mode" });
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    
    await transporter.sendMail({
      from: `"EVOCARELAB" <${smtpUser}>`,
      to: smtpUser,
      replyTo: email,
      subject: `Nuevo mensaje: ${subject}`,
      text: `De: ${name} (${email})\n\nMensaje: ${message}`,
    });
    res.json({ success: true });
  } catch (error: any) {
    next(error);
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
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { index: false }));
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        if (req.originalUrl.startsWith('/api') || req.originalUrl.includes('.')) return next();
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) res.sendFile(indexPath);
        else next();
      });
    } else {
      app.get('*', (req: Request, res: Response) => {
        if (req.originalUrl.startsWith('/api')) return res.status(404).json({ error: "API not found" });
        res.status(404).send("Application not built. Please run 'npm run build'.");
      });
    }
  }

  // Register global error handler at the end
  app.use(apiErrorHandler);

  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer().catch(err => {
    console.error("Startup error:", err);
  });
}

export default app;
