import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Receipt, Loader2, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

interface Purchase {
    id: string;
    created_at: string;
    price_paid: number;
    simulados: {
        title: string;
    };
}

export const PurchaseHistoryScreen = () => {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_simulados')
                .select(`
                    id,
                    created_at,
                    price_paid,
                    simulados (title)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPurchases(data as any || []);
        } catch (error: any) {
            console.error('Error fetching purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0f172a] min-h-screen text-white font-sans">
            <header className="sticky top-0 z-50 bg-[#f2f20d] rounded-b-[2.5rem] shadow-2xl">
                <div className="flex items-center p-6 pt-12 justify-between max-w-md mx-auto w-full">
                    <button onClick={() => navigate('/profile')} className="size-10 flex items-center justify-start text-black">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-lg font-black leading-tight text-black uppercase italic tracking-tighter">Meus Pedidos</h1>
                        <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Histórico de Compras</p>
                    </div>
                    <div className="size-10" />
                </div>
            </header>

            <main className="p-6 space-y-4 max-w-md mx-auto pt-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 size={40} className="text-[#f2f20d] animate-spin" />
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/10 text-center shadow-md">
                        <Receipt size={40} className="mx-auto text-slate-500 mb-4" />
                        <p className="text-slate-400 font-bold">Você ainda não realizou nenhuma compra.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 bg-[#2c73eb] text-white px-6 py-3 rounded-xl font-black uppercase text-[13px] shadow-lg active:scale-95 transition-transform"
                        >
                            Ver Simulados
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {purchases.map((purchase) => (
                            <div
                                key={purchase.id}
                                className="bg-white/5 p-5 rounded-3xl border border-white/10 hover:border-yellow-400/30 transition-all shadow-sm group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-base text-white leading-tight uppercase italic group-hover:text-yellow-400 transition-colors">
                                            {purchase.simulados?.title || 'Simulado Excluído'}
                                        </h4>
                                    </div>
                                    <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shrink-0">
                                        Concluído
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <Calendar size={14} />
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-widest">Data</span>
                                            <span className="text-xs font-bold text-slate-300">{formatDate(purchase.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <CreditCard size={14} />
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-widest">Valor Pago</span>
                                            <span className="text-sm font-black text-white">{formatPrice(purchase.price_paid || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
