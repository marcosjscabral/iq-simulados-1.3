import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Receipt, Loader2, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

const formatPrice = (price: number) =>
    price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

interface Purchase {
    id: string;
    created_at: string;
    price_paid: number;
    simulados: { title: string; image_url?: string };
}

export const PurchaseHistoryScreen = () => {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchPurchases(); }, []);

    const fetchPurchases = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from('user_simulados')
                .select('id, created_at, price_paid, simulados (title, image_url)')
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
        <div className="min-h-screen" style={{ background: '#f9f9ff', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

            <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(249,249,255,0.9)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
                <div className="flex items-center p-4 justify-between pt-10 max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate('/profile')}
                        className="size-10 flex items-center justify-start transition-colors"
                        style={{ color: '#515f74' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#515f74')}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center gap-0.5">
                        <h1 className="text-lg font-bold tracking-tight" style={{ color: '#111c2d' }}>Meus Pedidos</h1>
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#767586' }}>Histórico de Compras</p>
                    </div>
                    <div className="size-10" />
                </div>
            </header>

            <main className="p-5 space-y-5 w-full max-w-5xl mx-auto pt-8 pb-24 relative z-10">
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 size={40} className="animate-spin" style={{ color: '#4648d4' }} />
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="p-12 rounded-2xl text-center animate-fade-in-up"
                        style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.07)' }}>
                        <div className="size-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            style={{ background: '#f0f3ff', color: '#4648d4' }}>
                            <ShoppingBag size={36} />
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: '#111c2d' }}>Nenhum pedido ainda</h2>
                        <p className="text-sm font-medium mb-8" style={{ color: '#767586' }}>
                            Você ainda não realizou nenhuma compra.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-10 py-4 rounded-xl font-bold uppercase text-xs tracking-widest active:scale-95 transition-all"
                            style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }}
                        >
                            Explorar Simulados
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {purchases.map((purchase, idx) => (
                            <div
                                key={purchase.id}
                                className="glass-card rounded-2xl overflow-hidden flex flex-col sm:flex-row group animate-fade-in-up"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="w-full sm:w-40 h-32 sm:h-auto shrink-0 relative overflow-hidden"
                                    style={{ background: '#f0f3ff' }}>
                                    {purchase.simulados?.image_url ? (
                                        <img src={purchase.simulados.image_url} alt={purchase.simulados.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl font-black italic"
                                            style={{ color: '#c7c4d7' }}>IQ</div>
                                    )}
                                    <div className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                                        style={{ background: 'rgba(26,107,58,0.9)', color: '#ffffff' }}>
                                        Concluído
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col justify-between flex-1">
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                            <h3 className="text-base font-bold leading-tight" style={{ color: '#111c2d' }}>
                                                {purchase.simulados?.title || 'Simulado Excluído'}
                                            </h3>
                                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap"
                                                style={{ background: '#f0f3ff', color: '#767586', border: '1px solid #e7eeff' }}>
                                                #{purchase.id.slice(0, 8)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={13} style={{ color: '#767586' }} />
                                                <span className="text-[11px] font-semibold" style={{ color: '#767586' }}>
                                                    {formatDate(purchase.created_at)}
                                                </span>
                                            </div>
                                            <span style={{ color: '#c7c4d7', fontSize: 12 }}>·</span>
                                            <span className="text-[11px] font-semibold" style={{ color: '#767586' }}>
                                                {formatTime(purchase.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #f0f3ff' }}>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#767586' }}>
                                                Valor Pago
                                            </p>
                                            <p className="text-xl font-bold" style={{ color: '#111c2d' }}>
                                                R$ {formatPrice(purchase.price_paid || 0)}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: '#f0f3ff', color: '#4648d4' }}>
                                            <Receipt size={20} />
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
