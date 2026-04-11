import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Rocket, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Simulado } from '../types';

const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface UserSimulado {
    id: string;
    simulados: Simulado;
}

export const MyExamsScreen = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
    const navigate = useNavigate();
    const [purchasedExams, setPurchasedExams] = useState<UserSimulado[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyExams();
    }, []);

    const fetchMyExams = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_simulados')
                .select(`
          id,
          simulados (*)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPurchasedExams(data || []);
        } catch (error: any) {
            console.error('Error fetching my exams:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
                    <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30">
                        <Menu size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-xl font-black leading-tight text-slate-900 italic uppercase tracking-tighter">Meus Simulados</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Plataforma IQ</p>
                    </div>
                    <div className="size-10 flex items-center justify-end">
                        <button onClick={() => navigate('/profile')} className="rounded-full bg-slate-100 p-2 text-slate-900 active:scale-95 transition-transform shadow-sm border border-slate-200">
                            <User size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-6 max-w-5xl mx-auto pt-8 pb-24">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 size={40} className="text-slate-900 animate-spin" />
                    </div>
                ) : purchasedExams.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
                        <Rocket size={40} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-700 font-semibold">Você ainda não possui simulados vinculados à sua conta.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[13px] shadow-sm active:scale-95 transition-transform"
                        >
                            Ir para a Vitrine
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {purchasedExams.map((item) => {
                            const simulado = item.simulados;
                            const isParent = simulado.parent_categories && simulado.parent_categories.length > 0;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(isParent ? `/premium/${simulado.id}` : `/exam/${simulado.id}`)}
                                    className="group flex flex-col sm:flex-row bg-white border border-slate-200 rounded-xl overflow-hidden transition-all cursor-pointer shadow-sm hover:bg-slate-50 active:scale-[0.99] sm:h-48"
                                >
                                    <div className="w-full sm:w-56 h-48 sm:h-full shrink-0 bg-slate-100 relative overflow-hidden">
                                        {simulado.image_url ? (
                                            <img src={simulado.image_url} alt={simulado.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 italic font-black text-2xl">IQ</div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col justify-between flex-1">
                                        <div>
                                            <h3 className={`text-lg font-black leading-tight mb-2 uppercase tracking-tight ${isParent ? 'text-indigo-600' : 'text-slate-900'}`}>
                                                {isParent ? `Vitrine Premium: ${simulado.title}` : simulado.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm font-medium line-clamp-2 mb-4 leading-relaxed uppercase pr-4">
                                                {simulado.description || 'Simulado disponível para estudo imediato.'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest mb-6 text-slate-500">
                                                <span>
                                                    {isParent ? 'Acesso VIP Liberado' : (
                                                        simulado.questions_count > 0 && `${simulado.questions_count} Questões Objetivas`
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-1">
                                                <span className="text-2xl font-black italic text-slate-900 tracking-tighter">
                                                    LIBERADO
                                                </span>
                                            </div>
                                            <button
                                                className={`px-10 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-sm active:scale-95 flex items-center gap-2 bg-slate-900 text-white`}
                                            >
                                                Acessar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};
