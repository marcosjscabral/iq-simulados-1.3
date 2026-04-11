import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight, Home } from 'lucide-react';
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
                if (!user) {
                    setError('Usuário não autenticado.');
                    setLoading(false);
                    return;
                }

                const { data: existing } = await supabase
                    .from('user_simulados')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('simulado_id', simuladoId)
                    .single();

                if (existing) {
                    setLoading(false);
                    return;
                }

                const { error: insertError } = await supabase
                    .from('user_simulados')
                    .insert([{
                        user_id: user.id,
                        simulado_id: simuladoId
                    }]);

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
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 text-center">
                <Loader2 className="size-12 text-slate-900 animate-spin mb-6" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Processando seu Acesso...</h2>
                <p className="text-slate-500 mt-2">Aguarde um momento enquanto liberamos seu simulado.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 text-center">
                <div className="size-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6">
                    <Home size={40} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Oops! Algo deu errado.</h2>
                <p className="text-slate-500 mt-2 mb-8">{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest border border-slate-200 shadow-sm"
                >
                    Voltar para Início
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 text-center">
            <div className="size-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
                <CheckCircle2 size={48} strokeWidth={3} />
            </div>

            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 leading-none">
                PARABÉNS!
            </h1>
            <p className="text-slate-900 font-black uppercase tracking-[0.2em] mb-8">Compra Realizada com Sucesso</p>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 mb-12 w-full max-w-md mx-auto shadow-sm">
                <p className="text-slate-600 text-sm leading-relaxed">
                    Seu acesso ao simulado foi liberado. Agora você pode começar sua preparação rumo à aprovação!
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md">
                <button
                    onClick={() => navigate(`/exam/${simuladoId}`)}
                    className="bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm uppercase tracking-widest italic"
                >
                    Começar Agora <ArrowRight size={20} />
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="text-slate-500 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-colors py-4"
                >
                    Voltar para a Vitrine
                </button>
            </div>
        </div>
    );
}
