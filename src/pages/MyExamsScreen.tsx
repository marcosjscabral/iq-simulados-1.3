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
                <div className="flex items-center p-4 justify-between pt-12 w-full mx-auto">
                    <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black lg:hidden">
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

            <main className="p-4 space-y-6 w-full mx-auto pt-8">
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
                    <div className="grid grid-cols-1 gap-4">
                        {purchasedExams.map((exam) => (
                            <div
                                key={exam.id}
                                onClick={() => navigate(`/exam/${exam.simulados.id}`)}
                                className="group bg-[#272a24] p-4 rounded-[1.25rem] border border-[#3c3d35] flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-[#2c2f29] hover:border-[#f3ec05]/30 cursor-pointer shadow-md"
                            >
                                <div className="size-20 shrink-0 rounded-xl bg-[#2a4e4d] overflow-hidden border border-white/5 shadow-inner">
                                    {exam.simulados.image_url ? (
                                        <img src={exam.simulados.image_url} alt={exam.simulados.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 italic font-black text-xl">IQ</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[15px] text-white leading-snug mb-1 truncate">{exam.simulados.title}</h4>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exam.simulados.questions_count} Questões</span>
                                        <span className="size-1 rounded-full bg-emerald-400" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Liberado</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-center">
                                    <div className="bg-[#1e293b] p-3 rounded-xl text-[#f3ec05] group-hover:bg-[#f3ec05] group-hover:text-black transition-colors shadow-sm">
                                        <ChevronRight size={18} strokeWidth={3} />
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
