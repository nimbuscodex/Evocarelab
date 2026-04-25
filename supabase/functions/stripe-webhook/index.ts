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
              <h2>¡Nueva Venta Realizada! 🎉</h2>
              <p>Se ha completado un nuevo pedido por <strong>${totalFormatted} €</strong>.</p>
              <h3>Detalles del Cliente:</h3>
              <ul>
                <li><strong>Nombre:</strong> ${customerName}</li>
                <li><strong>Email:</strong> ${customerEmail}</li>
                <li><strong>ID de Pedido (Supabase):</strong> ${orderId}</li>
                <li><strong>ID de Sesión (Stripe):</strong> ${session.id}</li>
              </ul>
              <p>Revisa el panel de administración o Supabase para ver la dirección de envío exacta y gestionar el pedido.</p>
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
