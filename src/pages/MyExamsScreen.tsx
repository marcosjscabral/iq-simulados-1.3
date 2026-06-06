import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Loader2 } from 'lucide-react';
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
        <div className="min-h-screen select-none relative overflow-x-hidden" style={{ background: '#f9f9ff' }}>

            {/* Decorative background */}
            <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="fixed top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(225,224,255,0.35) 0%, transparent 70%)', transform: 'translate(25%, -25%)' }} />

            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(249,249,255,0.85)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
                <div className="flex items-center p-4 justify-between pt-10 max-w-5xl mx-auto">
                    <button
                        onClick={onOpenMenu}
                        className="size-10 flex items-center justify-start focus:outline-none transition-colors"
                        style={{ color: '#515f74' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#515f74')}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex flex-col items-center gap-0.5">
                        <h1 className="text-lg font-bold tracking-tight" style={{ color: '#111c2d' }}>Meus Simulados</h1>
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#767586' }}>Plataforma IQ</p>
                    </div>

                    <div className="size-10 flex items-center justify-end">
                        <button
                            onClick={() => navigate('/profile')}
                            className="rounded-xl p-2.5 active:scale-95 transition-all shadow-sm cursor-pointer"
                            style={{ background: '#ffffff', border: '1px solid #e7eeff', color: '#515f74' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4648d4'; (e.currentTarget as HTMLElement).style.color = '#4648d4'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e7eeff'; (e.currentTarget as HTMLElement).style.color = '#515f74'; }}
                        >
                            <User size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-6 max-w-5xl mx-auto pt-8 pb-24 relative z-10">
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#4648d4' }} />
                    </div>
                ) : purchasedExams.length === 0 ? (
                    <div className="p-12 rounded-2xl text-center max-w-md mx-auto animate-fade-in-up"
                        style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.08)' }}>
                        {/* Rocket icon as SVG in primary color */}
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                            style={{ background: '#f0f3ff', border: '1px solid #e7eeff' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4648d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                            </svg>
                        </div>
                        <h3 className="text-base font-bold mb-2" style={{ color: '#111c2d' }}>Nenhum simulado ainda</h3>
                        <p className="text-sm font-medium mb-6" style={{ color: '#767586' }}>
                            Você ainda não possui simulados vinculados à sua conta.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest shadow-md transition-all cursor-pointer"
                            style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                            Ir para a Vitrine
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {purchasedExams.map((item, idx) => {
                            const simulado = item.simulados;
                            const isParent = simulado.parent_categories && simulado.parent_categories.length > 0;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(isParent ? `/premium/${simulado.id}` : `/exam/${simulado.id}`)}
                                    className="glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col md:flex-row md:h-44 animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                >
                                    <div className="w-full md:w-52 h-44 md:h-full shrink-0 relative overflow-hidden"
                                        style={{ background: '#f0f3ff' }}>
                                        {simulado.image_url ? (
                                            <img src={simulado.image_url} alt={simulado.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-black italic"
                                                style={{ color: '#c7c4d7' }}>IQ</div>
                                        )}
                                    </div>

                                    <div className="p-6 flex flex-col justify-between flex-1">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold leading-tight tracking-tight mb-2 transition-colors"
                                                style={{ color: isParent ? '#4648d4' : '#111c2d' }}>
                                                {isParent ? `Coleção VIP: ${simulado.title}` : simulado.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed mb-4 pr-4"
                                                style={{ color: '#464554' }}>
                                                {simulado.description || 'Simulado disponível para estudo imediato.'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                                                    style={{ background: '#f0f3ff', color: '#4648d4', border: '1px solid #e7eeff' }}>
                                                    {isParent ? 'Acesso VIP Liberado' : (
                                                        simulado.questions_count > 0 && `${simulado.questions_count} Questões`
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid #e7eeff' }}>
                                            <span className="text-sm font-bold flex items-center gap-1.5"
                                                style={{ color: '#1a6b3a' }}>
                                                <span className="inline-block size-2 rounded-full animate-pulse"
                                                    style={{ background: '#1a6b3a' }} />
                                                Liberado
                                            </span>
                                            <button
                                                className="px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-sm transition-all cursor-pointer"
                                                style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 12px rgba(70,72,212,0.25)' }}
                                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
