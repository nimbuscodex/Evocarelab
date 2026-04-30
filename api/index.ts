import express, { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import nodemailer from "nodemailer";

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
    const { items, method = 'delivery', shipping, origin, discountCode } = req.body;
    
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

    // Apply manual discount if code matches
    const promoDiscount = (discountCode && discountCode.toUpperCase() === 'EVO10') ? 0.10 : 0;

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Producto',
          images: (item.image && item.image.startsWith('http')) ? [item.image] : [],
          metadata: { product_id: item.id }
        },
        unit_amount: Math.round((item.price || 0) * (1 - promoDiscount) * 100),
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
        discountCode: discountCode || 'none'
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

// Global error handler
app.use(apiErrorHandler);

export default app;
