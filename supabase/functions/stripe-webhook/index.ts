import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { stripe } from '../_shared/stripe.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // IMPORTANT: Service role to bypass RLS
);

serve(async (req) => {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
        return new Response('Missing signature or webhook secret', { status: 400 });
    }

    try {
        const body = await req.text();
        const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const userId = session.client_reference_id || session.metadata?.user_id;
            const simuladoId = session.metadata?.simulado_id;

            if (userId && simuladoId) {
                // Grant access using the Service Role Key (Admin privileges)
                const { error } = await supabaseAdmin
                    .from('user_simulados')
                    .insert({ user_id: userId, simulado_id: simuladoId });

                if (error) {
                    console.error('Error granting access:', error);
                    return new Response('Error saving to database', { status: 500 });
                }
                console.log(`Successfully granted simulado ${simuladoId} to user ${userId}`);
            } else {
                console.error('Missing userId or simuladoId in session metadata');
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });

    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
});
