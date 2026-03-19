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
        <div className="bg-[#181a17] min-h-screen text-white font-sans selection:bg-[#f3ec05] selection:text-black">
            <header className="sticky top-0 z-50 bg-[#f3ec05] shadow-2xl">
                <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
                    <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
                        <Menu size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-xl font-black leading-tight text-black italic uppercase tracking-tighter">Meus Simulados</h1>
                        <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Plataforma IQ</p>
                    </div>
                    <div className="size-10 flex items-center justify-end">
                        <button onClick={() => navigate('/profile')} className="rounded-full bg-black/10 p-2 text-black active:scale-95 transition-transform">
                            <User size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-6 max-w-5xl mx-auto pt-8 pb-24">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 size={40} className="text-[#f3ec05] animate-spin" />
                    </div>
                ) : purchasedExams.length === 0 ? (
                    <div className="bg-[#272a24] p-12 rounded-[2.5rem] border border-[#3c3d35] text-center shadow-md">
                        <Rocket size={40} className="mx-auto text-slate-500 mb-4" />
                        <p className="text-slate-400 font-bold">Você ainda não possui simulados vinculados à sua conta.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 bg-[#2c73eb] text-white px-6 py-3 rounded-xl font-black uppercase text-[13px] shadow-lg active:scale-95 transition-transform"
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
                                    className={`group flex flex-col sm:flex-row border border-white/5 rounded-[2rem] overflow-hidden transition-all cursor-pointer shadow-lg active:scale-[0.99] sm:h-48
                                        ${isParent ? 'bg-[#1e1b4b] hover:bg-[#2e2a7a]' : 'bg-[#20221e] hover:bg-[#252822]'}`}
                                >
                                    <div className="w-full sm:w-56 h-48 sm:h-full shrink-0 bg-[#2a4e4d] relative overflow-hidden">
                                        {simulado.image_url ? (
                                            <img src={simulado.image_url} alt={simulado.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20 italic font-black text-2xl">IQ</div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col justify-between flex-1">
                                        <div>
                                            <h3 className={`text-lg font-black leading-tight mb-2 uppercase tracking-tight ${isParent ? 'text-indigo-300' : 'text-white'}`}>
                                                {isParent ? `Vitrine Premium: ${simulado.title}` : simulado.title}
                                            </h3>
                                            <p className="text-[#64748b] text-xs font-semibold line-clamp-2 mb-4 leading-relaxed uppercase pr-4">
                                                {simulado.description || 'Simulado disponível para estudo imediato.'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest mb-6">
                                                <span className={isParent ? 'text-indigo-400' : 'text-slate-500'}>
                                                    {isParent ? 'Acesso VIP Liberado' : (
                                                        simulado.questions_count > 0 && `${simulado.questions_count} Questões Objetivas`
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-1">
                                                <span className="text-2xl font-black italic text-emerald-400 tracking-tighter">
                                                    LIBERADO
                                                </span>
                                            </div>
                                            <button
                                                className={`px-10 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg active:scale-95 flex items-center gap-2 text-white
                                                    ${isParent ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}
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
