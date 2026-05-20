import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, Loader2, CheckCircle2, ChevronRight, Clock, ListChecks, Eye, EyeOff, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Simulado, Questao } from '../types';
import { useModal } from '../components/ModalContext';
import { shakeVariants, popVariants, fadeUpVariants } from '../utils/animations';

export const ExamExecutionScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [simulado, setSimulado] = useState<Simulado | null>(null);
    const [questoes, setQuestoes] = useState<Questao[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
    const [examFinished, setExamFinished] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [startTime] = useState<number>(Date.now());
    const [currentTime, setCurrentTime] = useState<number>(Date.now());
    const [timeSpent, setTimeSpent] = useState<number>(0);
    const [showTimer, setShowTimer] = useState<boolean>(true);
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
                showConfirm('Finalizar Simulado', 'Deseja realmente finalizar o simulado? Você não poderá alterar suas respostas depois.', () => {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    setTimeSpent(elapsed);
                    setExamFinished(true);
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
            <div className="bg-bg-primary min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
            </div>
        );
    }

    if (!simulado || questoes.length === 0) {
        return (
            <div className="bg-bg-primary min-h-screen flex flex-col items-center justify-center text-text-primary p-6 text-center">
                <div className="bg-surface-card rounded-2xl p-10 shadow-xl border border-slate-800 max-w-md w-full">
                    <h2 className="text-2xl font-black mb-4 tracking-tight">Módulo Vazio</h2>
                    <p className="text-text-secondary">Este simulado ainda não possui questões cadastradas.</p>
                    <button onClick={() => navigate(-1)} className="mt-8 w-full bg-brand-purple hover:bg-brand-purple/90 text-text-primary py-3 rounded-xl font-bold transition shadow-lg shadow-brand-purple/20">
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
            <div className="bg-bg-primary min-h-screen flex flex-col text-text-primary font-interface">
                <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-slate-900 shadow-sm">
                    <div className="flex flex-col items-center pt-12 pb-5 w-full mx-auto max-w-5xl px-4">
                        <h1 className="text-xl font-black leading-tight italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400">Resultado Final</h1>
                        <p className="text-xs text-text-secondary mt-1 text-center font-medium">{simulado.title}</p>
                    </div>
                </header>

                <main className="flex-1 px-4 py-10 flex flex-col items-center w-full mx-auto">
                    <div className="grid gap-6 w-full max-w-4xl sm:grid-cols-[1fr_1fr] mb-8">
                        <div className="rounded-2xl border border-slate-800 bg-surface-card p-8 shadow-xl flex flex-col items-center justify-center">
                            <div className="rounded-full bg-success-green/10 text-success-green w-[120px] h-[120px] grid place-items-center shadow-lg border border-success-green/20">
                                <span className="text-4xl font-black italic">{scorePercentage.toFixed(0)}%</span>
                            </div>
                            <span className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Aproveitamento</span>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-surface-card p-8 shadow-xl flex flex-col items-center justify-center">
                            <div className="rounded-full bg-brand-purple/10 text-brand-purple w-[120px] h-[120px] grid place-items-center shadow-lg border border-brand-purple/20">
                                <Clock size={40} />
                            </div>
                            <span className="mt-4 text-2xl font-black text-text-primary">{formatTime(timeSpent)}</span>
                            <span className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Tempo Total</span>
                        </div>
                    </div>

                    <div className="w-full max-w-2xl bg-surface-card rounded-2xl border border-slate-800 p-8 shadow-xl text-center mb-8">
                        <p className="font-bold text-lg text-text-primary mb-2">Resumo do Desempenho</p>
                        <p className="text-text-secondary">Você acertou <span className="font-black text-text-primary text-lg">{correctCount}</span> de <span className="font-black text-text-primary text-lg">{questoes.length}</span> questões do simulado.</p>
                    </div>

                    <div className="w-full max-w-2xl space-y-4">
                        <button
                            onClick={() => {
                                setIsReviewing(true);
                                setCurrentQuestionIndex(0);
                            }}
                            className="w-full bg-brand-purple hover:bg-brand-purple/90 text-text-primary py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-brand-purple/20 transition flex items-center justify-center gap-2"
                        >
                            <ListChecks size={20} /> Ver Gabarito Comentado
                        </button>
                        <button
                            onClick={() => navigate('/my-exams')}
                            className="w-full bg-surface-card text-text-primary py-4 rounded-xl font-black uppercase tracking-widest text-sm border border-slate-800 shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={20} /> Meus Simulados
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const answeredQuestionsCount = Object.keys(answers).length;
    const progressPercentage = (answeredQuestionsCount / questoes.length) * 100;

    return (
        <div className="bg-bg-primary min-h-screen flex flex-col text-text-primary font-interface">
            <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-slate-900 shadow-sm">
                <div className="flex items-center justify-between gap-4 p-4 pt-12 max-w-5xl w-full mx-auto">
                    <button onClick={() => navigate('/my-exams')} className="size-10 flex items-center justify-center rounded-xl bg-surface-card border border-slate-800 text-text-primary shadow-lg hover:bg-slate-800 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-md sm:text-lg font-black leading-tight italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400">{simulado.title}</h1>
                        <p className="text-[9px] uppercase tracking-[0.25em] text-text-secondary font-black mt-1">Plataforma IQ</p>
                    </div>
                    <div className="size-10" />
                </div>
                <div className="h-1.5 bg-slate-900 w-full">
                    <div className="h-full bg-gradient-to-r from-brand-purple to-purple-400 transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                </div>
            </header>

            <main className="flex-1 p-4 pb-28 max-w-3xl w-full mx-auto space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-surface-card border border-slate-800 shadow-lg grid place-items-center">
                            <span className="text-brand-purple font-black text-xl">{currentQuestionIndex + 1}</span>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-text-secondary font-black">Questão</p>
                            <p className="text-xs font-bold text-text-secondary">de {questoes.length}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowTimer(!showTimer)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-surface-card px-4 py-2.5 text-xs font-bold text-text-secondary shadow-lg hover:bg-slate-800 transition"
                    >
                        {showTimer ? (
                            <>
                                <EyeOff size={16} className="text-brand-purple" />
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
                                <Eye size={16} className="text-text-secondary" />
                                <span>Mostrar tempo</span>
                            </>
                        )}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="space-y-6"
                    >
                        <div className="bg-surface-card rounded-2xl border border-slate-800 shadow-xl p-6">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-bg-primary border border-slate-800 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-text-secondary">
                                Enunciado
                            </div>
                            {/* Concurseiro typography style: Merriweather or Plus Jakarta Sans */}
                            <div className="text-text-primary text-base sm:text-lg font-serif-question leading-relaxed select-text" dangerouslySetInnerHTML={{ __html: currentQuestion.enunciado }} />
                        </div>

                        <div className="space-y-3.5">
                            {[
                                { id: 'A', text: currentQuestion.opcao_a },
                                { id: 'B', text: currentQuestion.opcao_b },
                                { id: 'C', text: currentQuestion.opcao_c },
                                { id: 'D', text: currentQuestion.opcao_d },
                                { id: 'E', text: currentQuestion.opcao_e, render: !!currentQuestion.opcao_e }
                            ].filter(opt => opt.render !== false).map(opt => {
                                const isSelected = answers[currentQuestion.id] === opt.id;
                                const isCorrect = currentQuestion.resposta_correta === opt.id;

                                let styles = 'bg-surface-card border-slate-800 text-text-primary hover:border-brand-purple/50';
                                let idBadgeStyles = 'bg-bg-primary text-text-secondary border-slate-800';
                                let animateType: "idle" | "shake" | "pop" = "idle";

                                if (isReviewing) {
                                    if (isCorrect) {
                                        styles = 'bg-success-green/10 border-success-green/40 text-text-primary';
                                        idBadgeStyles = 'bg-success-green text-bg-primary border-success-green font-black';
                                        if (isSelected) animateType = "pop";
                                    } else if (isSelected && !isCorrect) {
                                        styles = 'bg-error-red/10 border-error-red/40 text-text-primary';
                                        idBadgeStyles = 'bg-error-red text-text-primary border-error-red font-black';
                                        animateType = "shake";
                                    } else {
                                        styles = 'bg-surface-card/40 border-slate-900/40 text-text-secondary opacity-50';
                                        idBadgeStyles = 'bg-bg-primary/40 text-text-secondary border-slate-900/40';
                                    }
                                } else if (isSelected) {
                                    styles = 'bg-brand-purple/10 border-brand-purple text-text-primary shadow-lg shadow-brand-purple/10';
                                    idBadgeStyles = 'bg-brand-purple text-text-primary border-brand-purple font-black';
                                }

                                return (
                                    <motion.button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => !isReviewing && handleSelectOption(opt.id as any)}
                                        variants={animateType === "shake" ? shakeVariants : (animateType === "pop" ? popVariants : undefined)}
                                        animate={animateType}
                                        whileHover={!isReviewing ? { y: -2, scale: 1.005 } : undefined}
                                        whileTap={!isReviewing ? { scale: 0.99 } : undefined}
                                        className={`w-full rounded-2xl border p-4.5 text-left transition-colors cursor-pointer ${styles} flex flex-col justify-center min-h-[52px]`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`size-9 flex items-center justify-center rounded-xl border ${idBadgeStyles} font-bold text-sm shrink-0 transition-colors`}>
                                                {opt.id}
                                            </div>
                                            <p className="text-sm sm:text-base font-question font-medium leading-relaxed">{opt.text}</p>
                                        </div>
                                        {isReviewing && isCorrect && (
                                            <div className="mt-3 text-success-green font-bold text-xs flex items-center gap-1.5 ml-13">
                                                <CheckCircle2 size={16} /> Alternativa Correta
                                            </div>
                                        )}
                                        {isReviewing && isSelected && !isCorrect && (
                                            <div className="mt-3 text-error-red font-bold text-xs flex items-center gap-1.5 ml-13">
                                                <XCircle size={16} /> Sua Resposta (Incorreta)
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {isReviewing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-surface-card rounded-2xl border border-slate-800 shadow-xl p-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple to-purple-400" />
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-bg-primary border border-slate-800 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400">
                                    💡 Explicação da IA
                                </div>
                                {currentQuestion.explicacao ? (
                                    <div className="text-text-secondary text-sm sm:text-base font-question leading-relaxed select-text" dangerouslySetInnerHTML={{ __html: currentQuestion.explicacao }} />
                                ) : (
                                    <div className="text-text-secondary text-sm sm:text-base font-question leading-relaxed italic">Nenhum comentário disponível para esta questão.</div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur-md border-t border-slate-900 py-4.5 z-40">
                <div className="max-w-3xl mx-auto px-4 grid gap-3 grid-cols-[1fr_2fr] w-full">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className={`w-full rounded-xl border py-3.5 font-black uppercase tracking-widest text-xs transition flex items-center justify-center gap-2 ${currentQuestionIndex === 0 ? 'border-slate-900 text-text-secondary/35 bg-bg-primary/50 cursor-not-allowed' : 'border-slate-800 text-text-primary bg-surface-card hover:bg-slate-800 cursor-pointer'}`}
                    >
                        <ArrowLeft size={16} /> Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        className={`w-full rounded-xl py-3.5 font-black uppercase tracking-widest text-xs transition cursor-pointer flex items-center justify-center gap-2 ${currentQuestionIndex === questoes.length - 1 ? 'bg-brand-purple hover:bg-brand-purple/90 text-text-primary shadow-lg shadow-brand-purple/20' : 'bg-brand-purple hover:bg-brand-purple/90 text-text-primary shadow-lg shadow-brand-purple/20'}`}
                    >
                        {currentQuestionIndex === questoes.length - 1 ? (isReviewing ? 'Ver Resultado' : 'Finalizar Simulado') : 'Próxima'}
                        {currentQuestionIndex !== questoes.length - 1 && <ArrowRight size={16} />}
                    </button>
                </div>
            </footer>
        </div>
    );
};
