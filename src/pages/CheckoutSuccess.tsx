import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sessionId = searchParams.get('session_id');
    const simuladoId = searchParams.get('simulado_id');

    useEffect(() => {
        const finalizePurchase = async () => {
            if (!sessionId || !simuladoId) {
                setError('Informações da sessão ausentes.');
                setLoading(false);
                return;
            }
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { setError('Usuário não autenticado.'); setLoading(false); return; }

                const { data: existing } = await supabase
                    .from('user_simulados').select('id')
                    .eq('user_id', user.id).eq('simulado_id', simuladoId).single();

                if (existing) { setLoading(false); return; }

                const { error: insertError } = await supabase
                    .from('user_simulados')
                    .insert([{ user_id: user.id, simulado_id: simuladoId }]);

                if (insertError) throw insertError;
            } catch (err: any) {
                console.error('Error finalizing purchase:', err);
                setError('Ocorreu um erro ao processar sua compra.');
            } finally {
                setLoading(false);
            }
        };
        finalizePurchase();
    }, [sessionId, simuladoId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#f9f9ff' }}>
                <Loader2 className="size-12 animate-spin mb-6" style={{ color: '#4648d4' }} />
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#111c2d' }}>Processando seu Acesso...</h2>
                <p className="mt-2" style={{ color: '#767586' }}>Aguarde um momento enquanto liberamos seu simulado.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#f9f9ff' }}>
                <div className="size-20 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: 'rgba(186,26,26,0.08)', color: '#ba1a1a' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: '#111c2d' }}>Algo deu errado.</h2>
                <p className="mb-8" style={{ color: '#767586' }}>{error}</p>
                <button onClick={() => navigate('/')}
                    className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition"
                    style={{ background: '#ffffff', color: '#515f74', border: '1px solid #c7c4d7' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4648d4'; (e.currentTarget as HTMLElement).style.color = '#4648d4'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#c7c4d7'; (e.currentTarget as HTMLElement).style.color = '#515f74'; }}
                >
                    Voltar para Início
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden" style={{ background: '#f9f9ff' }}>
            <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
            <div className="fixed top-0 left-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(225,224,255,0.5) 0%, transparent 70%)', transform: 'translate(-50%, -30%)' }} />

            <div className="relative z-10 animate-fade-in-up">
                <div className="size-24 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg"
                    style={{ background: 'rgba(26,107,58,0.08)', boxShadow: '0 8px 24px rgba(26,107,58,0.15)' }}>
                    <CheckCircle2 size={48} strokeWidth={1.5} style={{ color: '#1a6b3a' }} />
                </div>

                <h1 className="text-4xl font-bold tracking-tight mb-2 leading-none" style={{ color: '#111c2d' }}>
                    PARABÉNS!
                </h1>
                <p className="font-bold uppercase tracking-[0.2em] mb-8 text-sm" style={{ color: '#4648d4' }}>
                    Compra Realizada com Sucesso
                </p>

                <div className="p-8 rounded-2xl mb-10 w-full max-w-md mx-auto"
                    style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.07)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: '#464554' }}>
                        Seu acesso ao simulado foi liberado. Agora você pode começar sua preparação rumo à aprovação!
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-md">
                    <button
                        onClick={() => navigate(`/exam/${simuladoId}`)}
                        className="py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm"
                        style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        Começar Agora <ArrowRight size={20} />
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="font-semibold uppercase tracking-widest text-xs py-4 transition-colors"
                        style={{ color: '#767586' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#767586')}
                    >
                        Voltar para a Vitrine
                    </button>
                </div>
            </div>
        </div>
    );
}
