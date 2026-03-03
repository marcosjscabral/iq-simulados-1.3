import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { stripe, corsHeaders, jsonResponse } from '../_shared/stripe.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return jsonResponse({ error: 'Auth header missing' }, 200);
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        );

        // Verify user is an admin
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            return jsonResponse({
                error: 'Unauthorized',
                details: userError?.message || 'No user found'
            }, 200);
        }

        // In our app, admin check is done via app_metadata.is_admin or user_metadata.is_admin (based on RLS)
        const isAdmin = user.app_metadata?.is_admin === true || user.user_metadata?.is_admin === true;
        if (!isAdmin) {
            return jsonResponse({ error: 'Forbidden' }, 403);
        }

        const { action, payload } = await req.json();

        switch (action) {
            case 'createProduct': {
                const product = await stripe.products.create({
                    name: payload.name,
                    description: payload.description,
                    active: true,
                });
                return jsonResponse(product);
            }

            case 'updateProduct': {
                const product = await stripe.products.update(payload.productId, {
                    name: payload.name,
                    description: payload.description,
                    active: payload.active,
                });
                return jsonResponse(product);
            }

            case 'createPrice': {
                const price = await stripe.prices.create({
                    product: payload.productId,
                    unit_amount: Math.round(payload.amount * 100),
                    currency: 'brl',
                });
                return jsonResponse(price);
            }

            case 'listCoupons': {
                const coupons = await stripe.coupons.list();
                return jsonResponse(coupons);
            }

            case 'createCoupon': {
                const couponData: any = {
                    name: payload.name,
                    duration: 'once',
                };
                if (payload.percentOff) couponData.percent_off = payload.percentOff;
                if (payload.amountOff) {
                    couponData.amount_off = Math.round(payload.amountOff * 100);
                    couponData.currency = 'brl';
                }
                const coupon = await stripe.coupons.create(couponData);
                return jsonResponse(coupon);
            }

            case 'deleteCoupon': {
                const deleted = await stripe.coupons.del(payload.couponId);
                return jsonResponse(deleted);
            }

            case 'getBalance': {
                const balance = await stripe.balance.retrieve();
                return jsonResponse(balance);
            }

            default:
                return jsonResponse({ error: 'Unknown action' }, 400);
        }
    } catch (err: any) {
        console.error(err);
        return jsonResponse({ error: err.message }, 500);
    }
});
