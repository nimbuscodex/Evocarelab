import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Stripe with the context of Deno Edge Functions
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature provided", { status: 400 });
  }

  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    if (event.type === 'checkout.session.completed') {
      const basicSession = event.data.object as any;
      console.log(`Payment successful for session ID: ${basicSession.id}`);

      // We retrieve the session from Stripe to get the line items (the products)
      const session = await stripe.checkout.sessions.retrieve(basicSession.id, {
        expand: ['line_items', 'line_items.data.price.product']
      });
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
      )

      // 1. Save or Update the order in Supabase
      const { data: orderData, error: dbError } = await supabase.from('orders').upsert([
        {
          stripe_session_id: session.id,
          customer_email: session.metadata?.customerEmail || session.customer_details?.email || "unknown@email.com",
          customer_name: session.metadata?.customerName || session.customer_details?.name || "Unknown",
          customer_phone: session.metadata?.customerPhone || null,
          shipping_address: session.metadata?.shippingAddress ? JSON.parse(session.metadata.shippingAddress) : {},
          total_amount: session.amount_total ? session.amount_total / 100 : 0,
          status: 'paid', // Mark as paid!
        }
      ], { onConflict: 'stripe_session_id' }).select('id').single();

      if (dbError) {
        console.error("Warning: Could not save order to DB. Error:", dbError.message);
      } else if (orderData && session.line_items?.data) {
        const orderId = orderData.id;
        
        // 2. Save the order items
        const orderItemsToInsert = session.line_items.data.map((stripeItem: any) => {
          const product = stripeItem.price?.product as any;
          const productId = product?.metadata?.product_id || null;
          
          return {
            order_id: orderId,
            product_id: productId,
            quantity: stripeItem.quantity || 1,
            price_at_purchase: stripeItem.amount_total ? stripeItem.amount_total / 100 / (stripeItem.quantity || 1) : 0
          };
        });

        if (orderItemsToInsert.length > 0) {
           const { error: itemsError } = await supabase.from('order_items').upsert(orderItemsToInsert, { onConflict: 'order_id,product_id' });
           if (itemsError) {
             console.error("Warning: Could not save order items. Error:", itemsError.message);
           }
        }

        // 3. Send email notification to Admin using Nodemailer
        const smtpUser = Deno.env.get('SMTP_USER');
        if (smtpUser) {
          try {
            // Import nodemailer dynamically or at top. In Deno, we can just dynamic import npm packages:
            const nodemailer = await import("npm:nodemailer");

            const customerName = session.metadata?.customerName || session.customer_details?.name || "Cliente Desconocido";
            const customerEmail = session.metadata?.customerEmail || session.customer_details?.email || "Sin email";
            const totalFormatted = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";
            
            const emailHtml = `
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
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; text-align: right;">${customerName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 500;">Email</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; text-align: right;">${customerEmail}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; color: #475569; font-weight: 500;">Ref. Pedido</td>
                            <td style="padding: 10px 0; color: #0f172a; font-weight: 600; text-align: right;">${orderId.split('-')[0]}</td>
                          </tr>
                        </table>
                      </div>

                      <div style="text-align: center; margin-top: 35px;">
                        <a href="https://supabase.com/dashboard" style="display: inline-block; background-color: #0ea5e9; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">Ver pedido en Supabase</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">
                      Mensaje generado automáticamente desde el Webhook de Stripe.
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `;

            const transporter = nodemailer.createTransport({
              host: Deno.env.get('SMTP_HOST') || 'smtp.gmail.com',
              port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
              secure: true,
              auth: {
                user: Deno.env.get('SMTP_USER'),
                pass: Deno.env.get('SMTP_PASS'),
              },
            });

            await transporter.sendMail({
              from: `"EVOCARELAB Ventas" <${Deno.env.get('SMTP_USER')}>`,
              to: "nimbuscodex@gmail.com",
              subject: `¡Nueva Venta! Pedido ${orderId.split('-')[0]} - ${totalFormatted}€`,
              html: emailHtml
            });

            console.log("Admin notification email sent successfully with Nodemailer.");
          } catch (emailErr: any) {
            console.error("Error sending notification email via Nodemailer:", emailErr.message);
          }
        } else {
          console.log("SMTP_USER is not set. Skipping email notification.");
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(err.message, { status: 400 })
  }
})
