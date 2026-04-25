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
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(err.message, { status: 400 })
  }
})
