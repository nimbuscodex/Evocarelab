import express from "express";
import Stripe from "stripe";
import nodemailer from "nodemailer";

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

// Create Checkout Session (Alias for both paths used in frontend)
const handleCheckout = async (req: any, res: any) => {
  const { items, method = 'delivery', shipping, origin } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "No hay productos en el carrito." });
  }

  // Si no hay shipping (algunos componentes no lo envían), creamos uno por defecto para evitar el crash
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
      throw new Error("La clave secreta de Stripe no está configurada en el servidor.");
    }

    const stripe = new Stripe(stripeSecret, {
      maxNetworkRetries: 3,
    });

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Producto Evocarelab',
          images: item.image ? [item.image] : [],
          metadata: { product_id: item.id }
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    let frontendOrigin = origin || req.headers.origin || `https://${req.headers.host}`;
    if (frontendOrigin.includes("localhost") === false && !frontendOrigin.startsWith("http")) {
      frontendOrigin = `https://${req.headers.host}`;
    }

    const shippingOptions = [];
    if (method === 'delivery') {
      shippingOptions.push({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'eur' },
          display_name: 'Envío Estándar',
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
        customerEmail: shippingData.email,
        customerName: shippingData.fullName,
        customerPhone: shippingData.phone || "",
        shippingAddress: JSON.stringify({
          address: shippingData.address,
          city: shippingData.city,
          zipCode: shippingData.zipCode
        }),
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("CRITICAL STRIPE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

app.post("/api/create-checkout-session", handleCheckout);
app.post("/api/checkout", handleCheckout);

// API to confirm and save the order in Supabase
app.post("/api/finalize-order", async (req, res) => {
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
app.post("/api/contact", async (req, res) => {
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
app.post("/api/notify-shipment", async (req, res) => {
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

export default app;
