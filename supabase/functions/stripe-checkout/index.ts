import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { stripe, corsHeaders, jsonResponse } from '../_shared/stripe.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        );

        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const { priceId, successUrl, cancelUrl, simuladoId } = await req.json();

        if (!priceId || !successUrl || !cancelUrl || !simuladoId) {
            return jsonResponse({ error: 'Missing required parameters' }, 400);
        }

        // Pass the user_id and simulado_id in client_reference_id or metadata so the webhook knows who bought what
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'pix'],
            payment_method_options: {
                pix: {
                    expires_after_seconds: 3600,
                },
            },
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            client_reference_id: user.id, // Helps identify the user in the webhook
            metadata: {
                simulado_id: simuladoId,
                user_id: user.id
            }
        });

        return jsonResponse(session);
    } catch (err: any) {
        console.error(err);
        return jsonResponse({ error: err.message }, 500);
    }
});
