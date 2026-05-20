import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Rocket, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Simulado } from '../types';

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
        <div className="bg-bg-primary min-h-screen text-text-primary font-interface select-none">
            <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-slate-900 shadow-sm">
                <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
                    <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-text-primary hover:text-brand-purple focus:outline-none transition-colors">
                        <Menu size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-xl font-black leading-tight italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400">Meus Simulados</h1>
                        <p className="text-[9px] uppercase tracking-[0.25em] text-text-secondary font-black mt-1">Plataforma IQ</p>
                    </div>
                    <div className="size-10 flex items-center justify-end">
                        <button onClick={() => navigate('/profile')} className="rounded-xl bg-surface-card p-2.5 text-text-primary hover:border-brand-purple/50 active:scale-95 transition-all shadow-lg border border-slate-800 cursor-pointer">
                            <User size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-6 max-w-5xl mx-auto pt-8 pb-24">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
                    </div>
                ) : purchasedExams.length === 0 ? (
                    <div className="bg-surface-card p-12 rounded-2xl border border-slate-800 text-center shadow-xl max-w-md mx-auto">
                        <Rocket size={44} className="mx-auto text-brand-purple mb-4" />
                        <p className="text-text-secondary font-medium mb-6">Você ainda não possui simulados vinculados à sua conta.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-brand-purple hover:bg-brand-purple/90 text-text-primary py-3.5 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-purple/20 transition cursor-pointer"
                        >
                            Ir para a Vitrine
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {purchasedExams.map((item) => {
                            const simulado = item.simulados;
                            const isParent = simulado.parent_categories && simulado.parent_categories.length > 0;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(isParent ? `/premium/${simulado.id}` : `/exam/${simulado.id}`)}
                                    className="group flex flex-col md:flex-row bg-surface-card border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all cursor-pointer shadow-xl md:h-44"
                                >
                                    <div className="w-full md:w-52 h-44 md:h-full shrink-0 bg-slate-900 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-900">
                                        {simulado.image_url ? (
                                            <img src={simulado.image_url} alt={simulado.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-secondary/10 italic font-black text-3xl">IQ</div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col justify-between flex-1">
                                        <div>
                                            <h3 className={`text-md sm:text-lg font-black leading-tight mb-2 uppercase tracking-tight transition-colors group-hover:text-brand-purple ${isParent ? 'text-brand-purple' : 'text-text-primary'}`}>
                                                {isParent ? `Coleção VIP: ${simulado.title}` : simulado.title}
                                            </h3>
                                            <p className="text-text-secondary text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed uppercase mb-4 pr-4">
                                                {simulado.description || 'Simulado disponível para estudo imediato.'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-widest mb-4 text-text-secondary/60">
                                                <span className="bg-bg-primary px-2.5 py-1 rounded border border-slate-900">
                                                    {isParent ? 'Acesso VIP Liberado' : (
                                                        simulado.questions_count > 0 && `${simulado.questions_count} Questões`
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/40">
                                            <span className="text-sm font-black tracking-widest text-success-green flex items-center gap-1.5 uppercase italic">
                                                <span className="inline-block size-2 rounded-full bg-success-green animate-pulse" /> Liberado
                                            </span>
                                            <button
                                                className="px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-brand-purple hover:bg-brand-purple/90 text-text-primary shadow-lg shadow-brand-purple/20 transition cursor-pointer"
                                            >
                                                Estudar
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
