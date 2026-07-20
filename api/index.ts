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

// Test email sending endpoint
app.get("/api/test-email", async (req, res, next) => {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toEmail = (req.query.to as string) || smtpUser || 'nimbuscodex@gmail.com';

    if (!smtpUser || !smtpPass) {
      return res.status(400).json({ 
        success: false, 
        message: "Las credenciales SMTP (SMTP_USER o SMTP_PASS) no están configuradas en las variables de entorno." 
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Prueba de Correo - EVOCARELAB</title>
      </head>
      <body style="font-family: sans-serif; background-color: #fcfbfa; padding: 20px; color: #1a1a1a;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #f0edf8; border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.01);">
          <h1 style="font-family: Georgia, serif; font-size: 24px; border-bottom: 1px solid #f0edf8; padding-bottom: 15px; margin-top: 0; color: #111111; letter-spacing: 0.1em;">EVOCARELAB</h1>
          <p style="font-size: 15px; line-height: 1.6; color: #444;">¡Hola! Esta es una <strong>prueba de confirmación de envío de correos</strong> desde tu servidor de la aplicación.</p>
          <div style="background-color: #faf9f6; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; border: 1px solid #f0edf8;">
            <strong>Detalles del diagnóstico:</strong><br/>
            • Servidor SMTP: <code>${process.env.SMTP_HOST || 'smtp.gmail.com'}</code><br/>
            • Puerto: <code>${process.env.SMTP_PORT || '465'}</code><br/>
            • Usuario SMTP: <code>${smtpUser}</code><br/>
            • Destinatario: <code>${toEmail}</code>
          </div>
          <p style="font-size: 14px; color: #777;">Si has recibido este correo, significa que el sistema SMTP de la aplicación está perfectamente configurado y listo para enviar correos reales de venta.</p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"EVOCARELAB" <${smtpUser}>`,
      to: toEmail,
      subject: `Prueba de Correo - EVOCARELAB`,
      html: testHtml
    });

    res.json({ 
      success: true, 
      message: `Correo de prueba enviado con éxito a ${toEmail}.`,
      config: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || '465',
        user: smtpUser
      }
    });
  } catch (err: any) {
    console.error("Error sending test email:", err);
    res.status(500).json({ 
      success: false, 
      message: "No se pudo enviar el correo de prueba.", 
      error: err.message || err 
    });
  }
});

// Coupon validation endpoint
app.get("/api/validate-coupon", async (req, res, next) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ success: false, message: "Falta el código de cupón" });
    }

    const upperCode = code.toUpperCase();
    if (upperCode === 'EVO10') {
      return res.json({
        success: true,
        code: 'EVO10',
        discount: 0.10,
        type: 'percentage'
      });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(400).json({ success: false, message: "Stripe no está configurado." });
    }

    const stripe = new Stripe(stripeSecret);

    // Try finding promo code
    try {
      const promoCodes = await stripe.promotionCodes.list({
        code: code,
        active: true,
        expand: ['data.coupon']
      });

      if (promoCodes.data && promoCodes.data.length > 0) {
        const promo = promoCodes.data[0];
        const coupon = promo.coupon;
        if (coupon && coupon.valid) {
          const discount = coupon.percent_off ? coupon.percent_off / 100 : 0;
          return res.json({
            success: true,
            code: promo.code,
            discount: discount,
            type: coupon.percent_off ? 'percentage' : 'fixed',
            amount_off: coupon.amount_off ? coupon.amount_off / 100 : 0
          });
        }
      }
    } catch (e) {
      console.warn("Error searching promo code in Stripe:", e);
    }

    // Try finding direct coupon ID
    try {
      const coupon = await stripe.coupons.retrieve(code);
      if (coupon && coupon.valid) {
        const discount = coupon.percent_off ? coupon.percent_off / 100 : 0;
        return res.json({
          success: true,
          code: coupon.id,
          discount: discount,
          type: coupon.percent_off ? 'percentage' : 'fixed',
          amount_off: coupon.amount_off ? coupon.amount_off / 100 : 0
        });
      }
    } catch (e) {
      console.warn("Error retrieving coupon from Stripe:", e);
    }

    return res.status(400).json({ success: false, message: "Código inválido" });
  } catch (err: any) {
    next(err);
  }
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

    // Apply manual discount if code matches, or resolve Stripe coupon percentage
    let promoDiscount = 0;
    if (discountCode) {
      const upperCode = discountCode.toUpperCase();
      if (upperCode === 'EVO10') {
        promoDiscount = 0.10;
      } else {
        try {
          const promoCodes = await stripe.promotionCodes.list({
            code: discountCode,
            active: true,
            expand: ['data.coupon']
          });
          if (promoCodes.data && promoCodes.data.length > 0) {
            const coupon = promoCodes.data[0].coupon;
            if (coupon && coupon.valid && coupon.percent_off) {
              promoDiscount = coupon.percent_off / 100;
            }
          } else {
            const coupon = await stripe.coupons.retrieve(discountCode);
            if (coupon && coupon.valid && coupon.percent_off) {
              promoDiscount = coupon.percent_off / 100;
            }
          }
        } catch (e) {
          console.warn("Stripe discount resolve failed in checkout session creation:", e);
        }
      }
    }

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
      allow_promotion_codes: true,
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${frontendOrigin.replace(/\/$/, '')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendOrigin.replace(/\/$/, '')}/checkout`,
      metadata: {
        shippingMethod: method,
        customerEmail: shippingData.email,
        customerName: shippingData.fullName,
        customerPhone: shippingData.phone || '',
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

        const parsedAddress = session.metadata?.shippingAddress 
          ? JSON.parse(session.metadata.shippingAddress) 
          : { address: session.metadata?.shippingMethod === 'pickup' ? 'Recogida en Tienda' : 'Desconocida', city: '', zipCode: '' };

        await supabase.from('orders').upsert([{ 
          stripe_session_id: session.id, 
          status: 'paid',
          customer_email: session.metadata?.customerEmail || session.customer_details?.email || 'no-email@example.com',
          customer_name: session.metadata?.customerName || session.customer_details?.name || 'Cliente',
          customer_phone: session.metadata?.customerPhone || session.customer_details?.phone || '',
          shipping_address: parsedAddress,
          total_amount: (session.amount_total || 0) / 100
        }], { onConflict: 'stripe_session_id' });
      }

      // Send confirmation emails using SMTP
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpUser && smtpPass) {
        try {
          // Fetch line items to display in the email
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          
          let itemsHtml = "";
          if (lineItems && lineItems.data) {
            itemsHtml = lineItems.data.map((item: any) => {
              const amount = ((item.amount_total || 0) / 100).toFixed(2);
              return `
                <div class="item-row" style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; border-bottom: 1px solid #f9f9fb; padding-bottom: 8px;">
                  <span class="item-name" style="color: #1a1a1a; font-weight: 500;">
                    ${item.description || 'Producto'}
                    <span class="item-qty" style="color: #888888; margin-left: 8px;">x${item.quantity || 1}</span>
                  </span>
                  <span class="item-price" style="color: #1a1a1a; font-weight: 600;">${amount} €</span>
                </div>
              `;
            }).join("");
          }

          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
            auth: { user: smtpUser, pass: smtpPass },
          });

          const customerName = session.metadata?.customerName || session.customer_details?.name || 'Cliente';
          const customerEmail = session.metadata?.customerEmail || session.customer_details?.email;
          const customerPhone = session.metadata?.customerPhone || session.customer_details?.phone || '';
          const shippingMethodStr = session.metadata?.shippingMethod === 'pickup' ? 'Recogida en Tienda' : 'Envío a domicilio';
          
          let addressText = "";
          if (session.metadata?.shippingAddress) {
            const addr = JSON.parse(session.metadata.shippingAddress);
            addressText = `${addr.address || ''}, ${addr.city || ''} (${addr.zipCode || ''})`;
          } else {
            addressText = "Recogida en tienda";
          }
          
          const totalAmountStr = ((session.amount_total || 0) / 100).toFixed(2);
          const customerPhoneHtml = customerPhone ? `<strong>Teléfono:</strong> ${customerPhone}<br/>` : '';

          // 1. Send confirmation email to Customer
          if (customerEmail) {
            const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de tu pedido - EVOCARELAB</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfbfa; color: #1a1a1a; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased;">
  <div class="container" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #f0edf8; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
    <div class="header" style="background-color: #111111; padding: 40px; text-align: center;">
      <h1 style="color: #ffffff; font-family: 'Georgia', serif; font-size: 28px; margin: 0; letter-spacing: 0.15em;">EVOCARELAB</h1>
    </div>
    <div class="content" style="padding: 40px;">
      <div class="greeting" style="font-size: 18px; font-weight: 500; margin-bottom: 24px;">¡Gracias por tu compra, ${customerName}!</div>
      <div class="message" style="font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 30px;">
        Tu pedido ha sido recibido y procesado correctamente. A continuación, encontrarás los detalles de tu compra.
      </div>
      
      <div class="order-details" style="border-top: 1px solid #f0edf8; border-bottom: 1px solid #f0edf8; padding: 24px 0; margin-bottom: 30px;">
        <div class="shipping-title" style="font-weight: bold; color: #1a1a1a; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">Resumen del Pedido</div>
        ${itemsHtml}
        <div class="total-row" style="display: flex; justify-content: space-between; border-top: 1px solid #f0edf8; padding-top: 15px; margin-top: 16px; font-size: 16px; font-weight: bold;">
          <span>Total:</span>
          <span>${totalAmountStr} €</span>
        </div>
      </div>

      <div class="shipping-info" style="background-color: #faf9f6; border-radius: 16px; padding: 20px; font-size: 13px; line-height: 1.5; color: #555555;">
        <div class="shipping-title" style="font-weight: bold; color: #1a1a1a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px;">Detalles de Envío</div>
        <strong>Método:</strong> ${shippingMethodStr}<br/>
        <strong>Destinatario:</strong> ${customerName}<br/>
        <strong>Dirección:</strong> ${addressText}<br/>
        ${customerPhoneHtml}
      </div>
    </div>
    <div class="footer" style="background-color: #faf9f6; padding: 30px 40px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #f0edf8;">
      Este es un correo automático de confirmación de compra.<br/>
      Si tienes alguna duda o consulta, puedes responder directamente a este correo o escribirnos a ${smtpUser}.<br/><br/>
      &copy; 2026 EVOCARELAB. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
            `;

            await transporter.sendMail({
              from: `"EVOCARELAB" <${smtpUser}>`,
              to: customerEmail,
              subject: `Confirmación de tu pedido en EVOCARELAB`,
              html: customerEmailHtml
            });
            console.log(`Order confirmation email sent to customer: ${customerEmail}`);
          }

          // 2. Send notification email to Administrator
          const appUrl = process.env.APP_URL || `https://evocarelab.com`;
          const adminUrl = `${appUrl.replace(/\/$/, '')}/admin`;

          const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Nueva Venta Registrada! - EVOCARELAB</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #1a1a1a; margin: 0; padding: 20px;">
  <div class="container" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 24px; overflow: hidden;">
    <div class="header" style="background-color: #18181b; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 20px; margin: 0; letter-spacing: 0.1em; font-family: 'Georgia', serif;">EVOCARELAB BACKOFFICE</h1>
    </div>
    <div class="content" style="padding: 40px;">
      <div class="title" style="font-size: 20px; font-weight: bold; color: #18181b; margin-bottom: 20px;">🎉 ¡Nueva Venta Registrada!</div>
      <p style="font-size: 14px; color: #52525b; margin-bottom: 24px; line-height: 1.5;">
        Se ha recibido un nuevo pedido a través de la pasarela de pago Stripe. A continuación, tienes el resumen de la transacción:
      </p>
      
      <div class="order-details" style="border-top: 1px solid #e4e4e7; border-bottom: 1px solid #e4e4e7; padding: 20px 0; margin-bottom: 24px;">
        <div class="info-title" style="font-weight: bold; color: #27272a; margin-bottom: 8px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Productos</div>
        ${itemsHtml}
        <div class="total-row" style="display: flex; justify-content: space-between; border-top: 1px solid #e4e4e7; padding-top: 12px; margin-top: 14px; font-size: 16px; font-weight: bold;">
          <span>Ingreso Total:</span>
          <span>${totalAmountStr} €</span>
        </div>
      </div>

      <div class="info-block" style="background-color: #f4f4f5; border-radius: 12px; padding: 16px; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
        <div class="info-title" style="font-weight: bold; color: #27272a; margin-bottom: 6px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Información del Cliente</div>
        <strong>Nombre:</strong> ${customerName}<br/>
        <strong>Email:</strong> ${customerEmail || 'no-email@example.com'}<br/>
        ${customerPhoneHtml}
      </div>

      <div class="info-block" style="background-color: #f4f4f5; border-radius: 12px; padding: 16px; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
        <div class="info-title" style="font-weight: bold; color: #27272a; margin-bottom: 6px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Dirección de Envío / Recogida</div>
        <strong>Método:</strong> ${shippingMethodStr}<br/>
        <strong>Dirección:</strong> ${addressText}
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${adminUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 500;">Ver en el Panel de Administración</a>
      </div>
    </div>
    <div class="footer" style="background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #71717a;">
      EVOCARELAB &bull; Gestión Automática de Ventas
    </div>
  </div>
</body>
</html>
          `;

          await transporter.sendMail({
            from: `"EVOCARELAB Backoffice" <${smtpUser}>`,
            to: `${smtpUser}, salumaz319@gmail.com`,
            subject: `[NUEVA VENTA] Pedido Recibido de ${customerName} (${totalAmountStr} €)`,
            html: adminEmailHtml
          });
          console.log(`Admin notification email sent successfully.`);
        } catch (mailErr) {
          console.error("Failed to send order confirmation emails:", mailErr);
        }
      } else {
        console.warn("SMTP settings are not configured. Skipping sale confirmation email sending.");
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
