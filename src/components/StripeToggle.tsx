import React, { useState, useEffect } from 'react';
import { CreditCard, Power } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const StripeToggle: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        const { data } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'stripe_enabled')
            .single();

        if (data) {
            setIsEnabled(data.value === 'true');
        }
        setLoading(false);
    };

    const toggle = async () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        await supabase
            .from('app_settings')
            .update({ value: newValue.toString(), updated_at: new Date().toISOString() })
            .eq('key', 'stripe_enabled');
    };

    if (loading) return null;

    return (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xl flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-500'}`}>
                    <CreditCard size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">Integração Stripe</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {isEnabled ? 'Modo Ativo' : 'Modo Offline'}
                    </p>
                </div>
            </div>

            <button
                onClick={toggle}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${isEnabled ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-700'}`}
            >
                <div className={`size-5 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center ${isEnabled ? 'translate-x-7' : 'translate-x-0'}`}>
                    <Power size={12} className={isEnabled ? 'text-emerald-500' : 'text-slate-400'} />
                </div>
            </button>
        </div>
    );
};
