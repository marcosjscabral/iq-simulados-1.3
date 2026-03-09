import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { stripe, corsHeaders, jsonResponse } from '../_shared/stripe.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
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
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '',
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (userError || !user) {
            return jsonResponse({ error: 'Sessão inválida' }, 401);
        }

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
                    images: payload.images,
                    active: true,
                });
                return jsonResponse(product);
            }

            case 'updateProduct': {
                const product = await stripe.products.update(payload.productId || payload.id, {
                    name: payload.name,
                    description: payload.description,
                    images: payload.images,
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
                const coupons = await stripe.coupons.list({ limit: 100 });
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

                // Automatically create a promotion code with the same name as the code
                await stripe.promotionCodes.create({
                    coupon: coupon.id,
                    code: payload.name.toUpperCase().replace(/\s+/g, ''),
                });

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

            case 'syncCouponsScope': {
                // 1. Get all simulados with their selected coupons
                const { data: simulados, error: simError } = await supabaseClient
                    .from('simulados')
                    .select('id, stripe_product_id, coupons')
                    .not('stripe_product_id', 'is', null);

                if (simError) throw simError;

                // 2. Build map of coupon_id -> Array of product_ids
                const couponToProducts: Record<string, string[]> = {};
                simulados.forEach(sim => {
                    const simCoupons = sim.coupons || [];
                    simCoupons.forEach((cId: string) => {
                        if (!couponToProducts[cId]) couponToProducts[cId] = [];
                        couponToProducts[cId].push(sim.stripe_product_id);
                    });
                });

                // 3. Reconcile with Stripe
                const results = [];
                for (const [oldId, productIds] of Object.entries(couponToProducts)) {
                    try {
                        const stripeCoupon = await stripe.coupons.retrieve(oldId);
                        const promoCodes = await stripe.promotionCodes.list({ coupon: oldId, limit: 1 });
                        const promoCode = promoCodes.data[0];

                        if (!promoCode) continue;

                        const currentProducts = stripeCoupon.applies_to?.products || [];
                        const isMatch = productIds.length === currentProducts.length &&
                            productIds.every(id => currentProducts.includes(id));

                        if (!isMatch) {
                            // Recreate
                            await stripe.coupons.del(oldId);

                            const newCouponData: any = {
                                name: stripeCoupon.name,
                                duration: stripeCoupon.duration,
                                applies_to: { products: productIds }
                            };
                            if (stripeCoupon.percent_off) newCouponData.percent_off = stripeCoupon.percent_off;
                            if (stripeCoupon.amount_off) {
                                newCouponData.amount_off = stripeCoupon.amount_off;
                                newCouponData.currency = stripeCoupon.currency;
                            }

                            const newCoupon = await stripe.coupons.create(newCouponData);
                            await stripe.promotionCodes.create({
                                coupon: newCoupon.id,
                                code: promoCode.code
                            });

                            // UPDATE DATABASE: Replace oldId with newCoupon.id in ALL simulados
                            for (const sim of simulados) {
                                if (sim.coupons?.includes(oldId)) {
                                    const newCoupons = sim.coupons.map((c: string) => c === oldId ? newCoupon.id : c);
                                    await supabaseClient
                                        .from('simulados')
                                        .update({ coupons: newCoupons })
                                        .eq('id', sim.id);
                                }
                            }
                            results.push({ name: stripeCoupon.name, status: 'updated', newId: newCoupon.id });
                        } else {
                            results.push({ name: stripeCoupon.name, status: 'synced' });
                        }
                    } catch (err) {
                        results.push({ id: oldId, status: 'error', error: err.message });
                    }
                }

                return jsonResponse({ results });
            }

            default:
                return jsonResponse({ error: 'Unknown action' }, 400);
        }
    } catch (err: any) {
        console.error(err);
        return jsonResponse({ error: err.message }, 500);
    }
});
