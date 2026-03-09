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

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.error('Missing Authorization header');
            return jsonResponse({ error: 'Autorização necessária. Por favor, faça login novamente.' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser(token);

        if (userError || !user) {
            console.error('Auth error or user not found:', userError);
            return jsonResponse({ error: 'Sessão inválida ou expirada. Por favor, faça login novamente.' }, 401);
        }

        const { priceId, successUrl, cancelUrl, simuladoId } = await req.json();

        if (!priceId || !successUrl || !cancelUrl || !simuladoId) {
            return jsonResponse({ error: 'Missing required parameters' }, 400);
        }

        // Pass the user_id and simulado_id in client_reference_id or metadata so the webhook knows who bought what
        const session = await stripe.checkout.sessions.create({
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
            allow_promotion_codes: true,
            metadata: {
                simulado_id: simuladoId,
                user_id: user.id
            }
        });

        return jsonResponse(session);
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return jsonResponse({ error: err.message || 'Unknown error', details: err }, 500);
    }
});
