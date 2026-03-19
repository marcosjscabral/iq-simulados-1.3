import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Receipt, Loader2, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
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
        image_url?: string;
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
                    simulados (title, image_url)
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
        <div className="bg-[#181a17] min-h-screen text-white font-sans">
            <header className="sticky top-0 z-50 bg-[#f3ec05] shadow-2xl">
                <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
                    <button onClick={() => navigate('/profile')} className="size-10 flex items-center justify-start text-black">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-xl font-black leading-tight text-black uppercase italic tracking-tighter">Meus Pedidos</h1>
                        <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Histórico de Compras</p>
                    </div>
                    <div className="size-10" />
                </div>
            </header>

            <main className="p-6 space-y-6 w-full max-w-5xl mx-auto pt-8 pb-24">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 size={40} className="text-[#f3ec05] animate-spin" />
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="bg-[#20221e] p-12 rounded-[2.5rem] border border-white/5 text-center shadow-lg">
                        <div className="size-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center text-yellow-500 mx-auto mb-6">
                            <ShoppingBag size={40} />
                        </div>
                        <h2 className="text-xl font-black italic mb-2">SEM PEDIDOS</h2>
                        <p className="text-slate-500 text-sm mb-8 uppercase font-bold tracking-widest">Você ainda não realizou nenhuma compra.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#2c73eb] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            Explorar Simulados
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {purchases.map((purchase) => (
                            <div
                                key={purchase.id}
                                className="group flex flex-col sm:flex-row bg-[#20221e] border border-white/5 rounded-[2rem] overflow-hidden hover:bg-[#252822] transition-colors shadow-lg"
                            >
                                <div className="w-full sm:w-48 h-32 sm:h-auto shrink-0 bg-[#2a4e4d] relative overflow-hidden">
                                    {purchase.simulados?.image_url ? (
                                        <img src={purchase.simulados.image_url} alt={purchase.simulados.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 italic font-black text-2xl">IQ</div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full shadow-lg">
                                        Pedido Concluído
                                    </div>
                                </div>
                                
                                <div className="p-6 flex flex-col justify-between flex-1">
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                            <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight italic">
                                                {purchase.simulados?.title || 'Simulado Excluído'}
                                            </h3>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                                                ID: {purchase.id.slice(0, 8)}...
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-500" />
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {formatDate(purchase.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <div className="size-1 rounded-full bg-slate-700" />
                                                <span className="text-[11px] font-bold uppercase tracking-widest">
                                                    {formatTime(purchase.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Valor do Investimento</span>
                                            <span className="text-2xl font-black italic text-[#f3ec05] tracking-tighter">
                                                R$ {formatPrice(purchase.price_paid || 0)}
                                            </span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl">
                                            <Receipt size={20} className="text-slate-400" />
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
