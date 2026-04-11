import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, Loader2, CheckCircle2, ChevronRight, Clock, ListChecks, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Simulado, Questao } from '../types';
import { useModal } from '../components/ModalContext';

export const ExamExecutionScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [simulado, setSimulado] = useState<Simulado | null>(null);
    const [questoes, setQuestoes] = useState<Questao[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
    const [showFeedback, setShowFeedback] = useState(false); // Used if we want immediate feedback, but usually exams show at the end. For now, we'll store answers and allow review at the end.
    const [examFinished, setExamFinished] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [startTime] = useState<number>(Date.now());
    const [currentTime, setCurrentTime] = useState<number>(Date.now());
    const [timeSpent, setTimeSpent] = useState<number>(0);
    const [showTimer, setShowTimer] = useState<boolean>(false);
    const { showAlert, showConfirm } = useModal();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!examFinished && !loading) {
            interval = setInterval(() => {
                setCurrentTime(Date.now());
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [examFinished, loading]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            // Verify access implicitly or explicitly here, but we will just fetch since RLS protects read
            const [simuladoRes, questoesRes] = await Promise.all([
                supabase.from('simulados').select('*').eq('id', id).single(),
                supabase.from('questoes').select('*').eq('simulado_id', id).order('numero', { ascending: true })
            ]);

            if (simuladoRes.error) throw simuladoRes.error;

            setSimulado(simuladoRes.data);
            setQuestoes(questoesRes.data || []);
        } catch (error: any) {
            console.error('Error fetching exam:', error);
            showAlert('Aviso', 'Erro ao carregar simulado. Talvez você não tenha acesso a ele.', 'alert');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const currentQuestion = questoes[currentQuestionIndex];

    const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D' | 'E') => {
        if (examFinished) return;
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: option
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questoes.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            if (isReviewing) {
                setIsReviewing(false);
            } else {
                // Finish exam
                showConfirm('Finalizar Simulado', 'Deseja realmente finalizar o simulado? Você não poderá alterar suas respostas depois.', () => {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    setTimeSpent(elapsed);
                    setExamFinished(true); // Switches to the "Resultado Final" screen
                });
            }
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-300 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!simulado || questoes.length === 0) {
        return (
            <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center text-slate-900 p-6 text-center">
                <div className="bg-white rounded-xl p-10 shadow-sm border border-slate-200 max-w-md w-full">
                    <h2 className="text-2xl font-black mb-4">Módulo Vazio</h2>
                    <p className="text-slate-600">Este simulado ainda não possui questões cadastradas.</p>
                    <button onClick={() => navigate(-1)} className="mt-8 bg-slate-900 text-white px-6 py-3 rounded-lg font-bold transition hover:bg-slate-800">
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    if (examFinished && !isReviewing) {
        let correctCount = 0;
        questoes.forEach(q => {
            if (answers[q.id] === q.resposta_correta) correctCount++;
        });
        const scorePercentage = (correctCount / questoes.length) * 100;

        const formatTime = (seconds: number) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        return (
            <div className="bg-slate-50 min-h-screen flex flex-col text-slate-900 font-display">
                <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <div className="flex flex-col items-center pt-12 pb-5 w-full mx-auto max-w-5xl px-4">
                        <h1 className="text-xl font-black leading-tight italic uppercase tracking-tighter">Resultado Final</h1>
                        <p className="text-sm text-slate-500 mt-1 text-center">{simulado.title}</p>
                    </div>
                </header>

                <main className="flex-1 px-4 py-10 flex flex-col items-center w-full mx-auto">
                    <div className="grid gap-6 w-full max-w-4xl sm:grid-cols-[1fr_1fr] mb-8">
                        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center">
                            <div className="rounded-full bg-emerald-100 text-emerald-700 w-[120px] h-[120px] grid place-items-center shadow-sm">
                                <span className="text-4xl font-black italic">{scorePercentage.toFixed(0)}%</span>
                            </div>
                            <span className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-500">Acertos</span>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center">
                            <Clock size={32} className="text-slate-900 mb-3" />
                            <span className="text-2xl font-black text-slate-900">{formatTime(timeSpent)}</span>
                            <span className="mt-2 text-sm text-slate-500 uppercase tracking-[0.2em]">Tempo</span>
                        </div>
                    </div>

                    <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center mb-8">
                        <p className="font-bold text-lg text-slate-900">Resumo do Desempenho</p>
                        <p className="text-slate-600 mt-2">Você acertou <span className="font-black text-slate-900">{correctCount}</span> de <span className="font-black text-slate-900">{questoes.length}</span> questões.</p>
                    </div>

                    <div className="w-full max-w-2xl space-y-4">
                        <button
                            onClick={() => {
                                setIsReviewing(true);
                                setCurrentQuestionIndex(0);
                            }}
                            className="w-full bg-slate-900 text-white py-4 rounded-lg font-black uppercase tracking-widest text-sm shadow-sm hover:bg-slate-800 transition"
                        >
                            <ListChecks size={20} className="inline-block mr-2" /> Ver Gabarito Comentado
                        </button>
                        <button
                            onClick={() => navigate('/my-exams')}
                            className="w-full bg-white text-slate-900 py-4 rounded-lg font-black uppercase tracking-widest text-sm border border-slate-200 shadow-sm hover:bg-slate-50 transition"
                        >
                            <ArrowLeft size={20} className="inline-block mr-2" /> Meus Simulados
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const answeredQuestionsCount = Object.keys(answers).length;
    const progressPercentage = (answeredQuestionsCount / questoes.length) * 100;

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col text-slate-900 font-display">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center justify-between gap-4 p-4 pt-12 max-w-6xl mx-auto">
                    <button onClick={() => navigate('/my-exams')} className="size-10 flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-900 shadow-sm hover:bg-slate-200 transition">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-lg font-black leading-tight italic uppercase tracking-tighter">{simulado.title}</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Plataforma IQ</p>
                    </div>
                    <div className="size-10" />
                </div>
                <div className="h-2 bg-slate-200">
                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                </div>
            </header>

            <main className="flex-1 p-4 pb-28 max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-white border border-slate-200 shadow-sm grid place-items-center">
                            <span className="text-slate-900 font-black text-xl">{currentQuestionIndex + 1}</span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Questão</p>
                            <p className="text-sm font-semibold text-slate-600">de {questoes.length}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowTimer(!showTimer)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition"
                    >
                        {showTimer ? (
                            <>
                                <EyeOff size={18} className="text-slate-900" />
                                <span>{(() => {
                                    const elapsed = Math.floor((currentTime - startTime) / 1000);
                                    const h = Math.floor(elapsed / 3600);
                                    const m = Math.floor((elapsed % 3600) / 60);
                                    const s = elapsed % 60;
                                    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                })()}</span>
                            </>
                        ) : (
                            <>
                                <Eye size={18} className="text-slate-500" />
                                <span>Mostrar tempo</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                        Enunciado
                    </div>
                    <div className="text-slate-800 text-lg sm:text-xl font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.enunciado }} />
                </div>

                <div className="space-y-4">
                    {[
                        { id: 'A', text: currentQuestion.opcao_a },
                        { id: 'B', text: currentQuestion.opcao_b },
                        { id: 'C', text: currentQuestion.opcao_c },
                        { id: 'D', text: currentQuestion.opcao_d },
                        { id: 'E', text: currentQuestion.opcao_e, render: !!currentQuestion.opcao_e }
                    ].filter(opt => opt.render !== false).map(opt => {
                        const isSelected = answers[currentQuestion.id] === opt.id;
                        const isCorrect = currentQuestion.resposta_correta === opt.id;

                        let styles = 'bg-white border-slate-200 text-slate-900 hover:border-slate-300';
                        let idBadgeStyles = 'bg-slate-100 text-slate-600 border-slate-200';

                        if (isReviewing) {
                            if (isCorrect) {
                                styles = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                                idBadgeStyles = 'bg-emerald-200 text-emerald-900 border-emerald-300';
                            } else if (isSelected && !isCorrect) {
                                styles = 'bg-red-50 border-red-300 text-red-900';
                                idBadgeStyles = 'bg-red-200 text-red-900 border-red-300';
                            } else {
                                styles = 'bg-slate-50 border-slate-200 text-slate-500';
                                idBadgeStyles = 'bg-slate-100 text-slate-500 border-slate-200';
                            }
                        } else if (isSelected) {
                            styles = 'bg-slate-900 border-slate-900 text-white shadow-sm';
                            idBadgeStyles = 'bg-slate-900 text-white border-slate-900';
                        }

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => !isReviewing && handleSelectOption(opt.id as any)}
                                className={`w-full rounded-xl border p-4 text-left transition-all ${styles} ${!isReviewing ? 'hover:shadow-sm active:scale-[0.98]' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 flex h-10 w-10 items-center justify-center rounded-lg border ${idBadgeStyles} font-black`}>{opt.id}</div>
                                    <p className="text-base font-medium leading-relaxed">{opt.text}</p>
                                </div>
                                {isReviewing && isCorrect && (
                                    <div className="mt-3 text-emerald-700 font-bold flex items-center gap-2">
                                        <CheckCircle2 size={18} /> Correta
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {isReviewing && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                            Comentário
                        </div>
                        {currentQuestion.explicacao ? (
                            <div className="text-slate-700 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.explicacao }} />
                        ) : (
                            <div className="text-slate-500 text-base leading-relaxed">Nenhum comentário disponível para esta questão.</div>
                        )}
                    </div>
                )}
            </main>

            <footer className="sticky bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 py-4">
                <div className="max-w-6xl mx-auto px-4 grid gap-3 sm:grid-cols-[1fr_1.5fr]">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className={`w-full rounded-lg border py-4 font-black uppercase tracking-widest text-sm transition ${currentQuestionIndex === 0 ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed' : 'border-slate-300 text-slate-900 bg-white hover:bg-slate-50'}`}
                    >
                        <ArrowLeft size={18} className="inline-block mr-2" /> Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        className={`w-full rounded-lg py-4 font-black uppercase tracking-widest text-sm transition ${currentQuestionIndex === questoes.length - 1 ? (isReviewing ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-900 text-white hover:bg-slate-800') : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {currentQuestionIndex === questoes.length - 1 ? (isReviewing ? 'Resultado' : 'Finalizar') : 'Próxima'}
                        {currentQuestionIndex !== questoes.length - 1 && <ArrowRight size={18} className="inline-block ml-2" />}
                    </button>
                </div>
            </footer>
        </div>
    );
};
