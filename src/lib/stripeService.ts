import { supabase } from './supabase';

export class StripeService {

    private static toFormUrlEncoded(data: any) {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
            .join('&');
    }

    static async createProduct(name: string, description: string) {
        const { data, error } = await supabase.functions.invoke('stripe-sync', {
            body: { action: 'createProduct', payload: { name, description } }
        });
        if (error) throw error;
        return data;
    }

    static async updateProduct(productId: string, payloadData: { name?: string; description?: string; active?: boolean }) {
        const { data, error } = await supabase.functions.invoke('stripe-sync', {
            body: { action: 'updateProduct', payload: { productId, ...payloadData } }
        });
        if (error) throw error;
        return data;
    }

    static async createPrice(productId: string, amount: number) {
        const { data, error } = await supabase.functions.invoke('stripe-sync', {
            body: { action: 'createPrice', payload: { productId, amount } }
        });
        if (error) throw error;
        return data;
    }

    static async createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string, simuladoId: string) {
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
            body: { priceId, successUrl, cancelUrl, simuladoId }
        });
        if (error) throw error;
        return data;
    }

    static async archiveProduct(productId: string) {
        return this.updateProduct(productId, { active: false });
    }

    static async listCoupons() {
        const { data, error } = await supabase.functions.invoke('stripe-sync', {
            body: { action: 'listCoupons' }
        });
        if (error) throw error;
        return data;
    }

    static async createCoupon(name: string, percentOff?: number, amountOff?: number) {
        const { data, error } = await supabase.functions.invoke('stripe-sync', {
            body: { action: 'createCoupon', payload: { name, percentOff, amountOff } }
        });
        if (error) throw error;
        return data;
    }

    static async deleteCoupon(couponId: string) {
        const { data, error } = await supabase.functions.invoke('stripe-sync', {
            body: { action: 'deleteCoupon', payload: { couponId } }
        });
        if (error) throw error;
        return data;
    }

    static async getBalance() {
        const { data, error } = await supabase.functions.invoke('stripe-sync', {
            body: { action: 'getBalance' }
        });
        if (error) throw error;
        return data;
    }
}
