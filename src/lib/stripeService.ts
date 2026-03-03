export class StripeService {
    private static get headers() {
        const apiKey = (import.meta as any).env.VITE_STRIPE_SECRET_KEY;
        if (!apiKey) {
            console.warn('VITE_STRIPE_SECRET_KEY is not defined');
        }
        return {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }

    private static toFormUrlEncoded(data: any) {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
            .join('&');
    }

    static async createProduct(name: string, description: string) {
        const data = {
            name,
            description,
            active: 'true'
        };
        const response = await fetch('https://api.stripe.com/v1/products', {
            method: 'POST',
            headers: this.headers,
            body: this.toFormUrlEncoded(data)
        });
        return response.json();
    }

    static async updateProduct(productId: string, data: { name?: string; description?: string; active?: boolean }) {
        const formData: any = {};
        if (data.name) formData.name = data.name;
        if (data.description) formData.description = data.description;
        if (data.active !== undefined) formData.active = data.active.toString();

        const response = await fetch(`https://api.stripe.com/v1/products/${productId}`, {
            method: 'POST',
            headers: this.headers,
            body: this.toFormUrlEncoded(formData)
        });
        return response.json();
    }

    static async createPrice(productId: string, amount: number) {
        // Stripe amounts are in cents
        const data = {
            product: productId,
            unit_amount: Math.round(amount * 100).toString(),
            currency: 'brl'
        };
        const response = await fetch('https://api.stripe.com/v1/prices', {
            method: 'POST',
            headers: this.headers,
            body: this.toFormUrlEncoded(data)
        });
        return response.json();
    }

    static async createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string) {
        const data = {
            success_url: successUrl,
            cancel_url: cancelUrl,
            mode: 'payment',
            'line_items[0][price]': priceId,
            'line_items[0][quantity]': '1',
        };
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: this.headers,
            body: this.toFormUrlEncoded(data)
        });
        return response.json();
    }

    static async archiveProduct(productId: string) {
        return this.updateProduct(productId, { active: false });
    }

    static async listCoupons() {
        const response = await fetch('https://api.stripe.com/v1/coupons', {
            method: 'GET',
            headers: this.headers
        });
        return response.json();
    }

    static async createCoupon(name: string, percentOff?: number, amountOff?: number) {
        const data: any = {
            name,
            duration: 'once'
        };
        if (percentOff) data.percent_off = percentOff.toString();
        if (amountOff) {
            data.amount_off = Math.round(amountOff * 100).toString();
            data.currency = 'brl';
        }

        const response = await fetch('https://api.stripe.com/v1/coupons', {
            method: 'POST',
            headers: this.headers,
            body: this.toFormUrlEncoded(data)
        });
        return response.json();
    }

    static async deleteCoupon(couponId: string) {
        const response = await fetch(`https://api.stripe.com/v1/coupons/${couponId}`, {
            method: 'DELETE',
            headers: this.headers
        });
        return response.json();
    }

    static async getBalance() {
        const response = await fetch('https://api.stripe.com/v1/balance', {
            method: 'GET',
            headers: this.headers
        });
        return response.json();
    }
}
