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

  const body = await req.text() // Deno reads the raw body easily

  try {
    const event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      // Connect to DB using the Service Role to bypass RLS for server-side updates
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
      )

      console.log(`Payment successful for session ID: ${session.id}`);

      // We update the existing order status
      // You may need to adapt this query structure to your specific Supabase table
      // (in server.ts we use 'orders' and 'stripe_session_id')
      await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('stripe_session_id', session.id)
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(err.message, { status: 400 })
  }
})
