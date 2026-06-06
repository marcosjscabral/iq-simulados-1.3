import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, Clock, ListChecks, Eye, EyeOff, XCircle } from 'lucide-react';
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9f9ff' }}>
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#4648d4' }} />
            </div>
        );
    }

    if (!simulado || questoes.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#f9f9ff' }}>
                <div className="rounded-2xl p-10 max-w-md w-full"
                    style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.08)' }}>
                    <h2 className="text-2xl font-bold mb-4 tracking-tight" style={{ color: '#111c2d' }}>Módulo Vazio</h2>
                    <p style={{ color: '#767586' }}>Este simulado ainda não possui questões cadastradas.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-8 w-full py-3 rounded-xl font-bold transition shadow-md"
                        style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }}
                    >
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
            <div className="min-h-screen flex flex-col" style={{ background: '#f9f9ff' }}>
                <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

                <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(249,249,255,0.9)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
                    <div className="flex flex-col items-center pt-10 pb-5 w-full mx-auto max-w-5xl px-4">
                        <h1 className="text-xl font-bold leading-tight tracking-tight" style={{ color: '#111c2d' }}>Resultado Final</h1>
                        <p className="text-xs mt-1 text-center font-medium" style={{ color: '#767586' }}>{simulado.title}</p>
                    </div>
                </header>

                <main className="flex-1 px-4 py-10 flex flex-col items-center w-full mx-auto relative z-10">
                    <div className="grid gap-5 w-full max-w-4xl sm:grid-cols-2 mb-8">
                        {/* Score card */}
                        <div className="rounded-2xl p-8 flex flex-col items-center justify-center animate-fade-in-up"
                            style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.07)' }}>
                            <div className="w-28 h-28 rounded-full grid place-items-center mb-4"
                                style={{ background: 'rgba(26,107,58,0.08)', border: '2px solid rgba(26,107,58,0.2)' }}>
                                <span className="text-4xl font-bold" style={{ color: '#1a6b3a' }}>
                                    {scorePercentage.toFixed(0)}%
                                </span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#767586' }}>Aproveitamento</span>
                        </div>

                        {/* Time card */}
                        <div className="rounded-2xl p-8 flex flex-col items-center justify-center animate-fade-in-up"
                            style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.07)', animationDelay: '80ms' }}>
                            <div className="w-28 h-28 rounded-full grid place-items-center mb-4"
                                style={{ background: '#f0f3ff', border: '2px solid #e7eeff' }}>
                                <Clock size={40} style={{ color: '#4648d4' }} />
                            </div>
                            <span className="text-2xl font-bold mb-1" style={{ color: '#111c2d' }}>{formatTime(timeSpent)}</span>
                            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#767586' }}>Tempo Total</span>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="w-full max-w-2xl rounded-2xl p-8 text-center mb-8 animate-fade-in-up"
                        style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.07)', animationDelay: '120ms' }}>
                        <p className="font-bold text-lg mb-2" style={{ color: '#111c2d' }}>Resumo do Desempenho</p>
                        <p style={{ color: '#464554' }}>
                            Você acertou{' '}
                            <span className="font-bold text-lg" style={{ color: '#111c2d' }}>{correctCount}</span>
                            {' '}de{' '}
                            <span className="font-bold text-lg" style={{ color: '#111c2d' }}>{questoes.length}</span>
                            {' '}questões do simulado.
                        </p>
                    </div>

                    <div className="w-full max-w-2xl space-y-3 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
                        <button
                            onClick={() => {
                                setIsReviewing(true);
                                setCurrentQuestionIndex(0);
                            }}
                            className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                            style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                            <ListChecks size={20} /> Ver Gabarito Comentado
                        </button>
                        <button
                            onClick={() => navigate('/my-exams')}
                            className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                            style={{ background: '#ffffff', color: '#515f74', border: '1px solid #c7c4d7' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4648d4'; (e.currentTarget as HTMLElement).style.color = '#4648d4'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#c7c4d7'; (e.currentTarget as HTMLElement).style.color = '#515f74'; }}
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
        <div className="min-h-screen flex flex-col" style={{ background: '#f9f9ff', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(249,249,255,0.92)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
                <div className="flex items-center justify-between gap-4 p-4 pt-10 max-w-5xl w-full mx-auto">
                    <button
                        onClick={() => navigate('/my-exams')}
                        className="size-10 flex items-center justify-center rounded-xl transition"
                        style={{ background: '#ffffff', border: '1px solid #e7eeff', color: '#515f74' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4648d4'; (e.currentTarget as HTMLElement).style.color = '#4648d4'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e7eeff'; (e.currentTarget as HTMLElement).style.color = '#515f74'; }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-sm sm:text-base font-bold leading-tight tracking-tight line-clamp-1" style={{ color: '#111c2d' }}>{simulado.title}</h1>
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mt-0.5" style={{ color: '#767586' }}>Plataforma IQ</p>
                    </div>
                    <div className="size-10" />
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full" style={{ background: '#f0f3ff' }}>
                    <div
                        className="h-full transition-all duration-500 progress-bar-glow"
                        style={{ width: `${progressPercentage}%`, background: 'linear-gradient(90deg, #4648d4, #6063ee)' }}
                    />
                </div>
            </header>

            <main className="flex-1 p-4 pb-28 max-w-3xl w-full mx-auto space-y-5">

                {/* Question meta row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl grid place-items-center"
                            style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 2px 8px rgba(71,85,105,0.06)' }}>
                            <span className="font-bold text-xl" style={{ color: '#4648d4' }}>{currentQuestionIndex + 1}</span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: '#767586' }}>Questão</p>
                            <p className="text-xs font-semibold" style={{ color: '#464554' }}>de {questoes.length}</p>
                        </div>
                    </div>

                    {/* Timer toggle */}
                    <button
                        onClick={() => setShowTimer(!showTimer)}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition"
                        style={{ background: '#ffffff', border: '1px solid #e7eeff', color: '#515f74' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#c7c4d7')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#e7eeff')}
                    >
                        {showTimer ? (
                            <>
                                <EyeOff size={15} style={{ color: '#4648d4' }} />
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
                                <Eye size={15} />
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
                        className="space-y-4"
                    >
                        {/* Question text card */}
                        <div className="rounded-2xl p-6"
                            style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 4px 16px rgba(71,85,105,0.06)' }}>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em]"
                                style={{ background: '#f0f3ff', color: '#4648d4', border: '1px solid #e7eeff' }}>
                                Enunciado
                            </div>
                            <div className="text-base sm:text-lg leading-relaxed select-text"
                                style={{ color: '#111c2d', fontFamily: 'Georgia, serif' }}
                                dangerouslySetInnerHTML={{ __html: currentQuestion.enunciado }} />
                        </div>

                        {/* Alternatives */}
                        <div className="space-y-3">
                            {[
                                { id: 'A', text: currentQuestion.opcao_a },
                                { id: 'B', text: currentQuestion.opcao_b },
                                { id: 'C', text: currentQuestion.opcao_c },
                                { id: 'D', text: currentQuestion.opcao_d },
                                { id: 'E', text: currentQuestion.opcao_e, render: !!currentQuestion.opcao_e }
                            ].filter(opt => opt.render !== false).map(opt => {
                                const isSelected = answers[currentQuestion.id] === opt.id;
                                const isCorrect = currentQuestion.resposta_correta === opt.id;

                                let cardStyle: React.CSSProperties = {
                                    background: '#ffffff',
                                    border: '1px solid #c7c4d7',
                                    color: '#111c2d',
                                };
                                let badgeStyle: React.CSSProperties = {
                                    background: '#f0f3ff',
                                    border: '1px solid #e7eeff',
                                    color: '#515f74',
                                };
                                let animateType: "idle" | "shake" | "pop" = "idle";

                                if (isReviewing) {
                                    if (isCorrect) {
                                        cardStyle = { background: 'rgba(26,107,58,0.05)', border: '1px solid rgba(26,107,58,0.3)', color: '#111c2d' };
                                        badgeStyle = { background: '#1a6b3a', border: '1px solid #1a6b3a', color: '#ffffff', fontWeight: 700 };
                                        if (isSelected) animateType = "pop";
                                    } else if (isSelected && !isCorrect) {
                                        cardStyle = { background: 'rgba(186,26,26,0.05)', border: '1px solid rgba(186,26,26,0.3)', color: '#111c2d' };
                                        badgeStyle = { background: '#ba1a1a', border: '1px solid #ba1a1a', color: '#ffffff', fontWeight: 700 };
                                        animateType = "shake";
                                    } else {
                                        cardStyle = { background: '#f9f9ff', border: '1px solid #e7eeff', color: '#767586', opacity: 0.6 };
                                        badgeStyle = { background: '#f0f3ff', border: '1px solid #e7eeff', color: '#c7c4d7' };
                                    }
                                } else if (isSelected) {
                                    cardStyle = { background: 'rgba(70,72,212,0.05)', border: '1px solid #4648d4', color: '#111c2d', boxShadow: '0 4px 12px rgba(70,72,212,0.12)' };
                                    badgeStyle = { background: '#4648d4', border: '1px solid #4648d4', color: '#ffffff', fontWeight: 700 };
                                }

                                return (
                                    <motion.button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => !isReviewing && handleSelectOption(opt.id as any)}
                                        variants={animateType === "shake" ? shakeVariants : (animateType === "pop" ? popVariants : undefined)}
                                        animate={animateType}
                                        whileHover={!isReviewing ? { y: -1, scale: 1.003 } : undefined}
                                        whileTap={!isReviewing ? { scale: 0.99 } : undefined}
                                        className="w-full rounded-2xl p-4 text-left transition-colors cursor-pointer flex flex-col justify-center min-h-[52px]"
                                        style={cardStyle}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-9 flex items-center justify-center rounded-xl shrink-0 font-bold text-sm transition-colors"
                                                style={badgeStyle}>
                                                {opt.id}
                                            </div>
                                            <p className="text-sm sm:text-base font-medium leading-relaxed">{opt.text}</p>
                                        </div>
                                        {isReviewing && isCorrect && (
                                            <div className="mt-2 text-xs font-bold flex items-center gap-1.5 ml-[52px]"
                                                style={{ color: '#1a6b3a' }}>
                                                <CheckCircle2 size={14} /> Alternativa Correta
                                            </div>
                                        )}
                                        {isReviewing && isSelected && !isCorrect && (
                                            <div className="mt-2 text-xs font-bold flex items-center gap-1.5 ml-[52px]"
                                                style={{ color: '#ba1a1a' }}>
                                                <XCircle size={14} /> Sua Resposta (Incorreta)
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Explanation (review mode) */}
                        {isReviewing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl p-6 relative overflow-hidden"
                                style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 4px 16px rgba(71,85,105,0.06)' }}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
                                    style={{ background: 'linear-gradient(90deg, #4648d4, #6063ee)' }} />
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em]"
                                    style={{ background: '#f0f3ff', color: '#4648d4', border: '1px solid #e7eeff' }}>
                                    💡 Explicação
                                </div>
                                {currentQuestion.explicacao ? (
                                    <div className="text-sm sm:text-base leading-relaxed select-text"
                                        style={{ color: '#464554' }}
                                        dangerouslySetInnerHTML={{ __html: currentQuestion.explicacao }} />
                                ) : (
                                    <div className="text-sm sm:text-base leading-relaxed italic" style={{ color: '#767586' }}>
                                        Nenhum comentário disponível para esta questão.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer navigation */}
            <footer className="fixed bottom-0 left-0 right-0 py-4 z-40"
                style={{ background: 'rgba(249,249,255,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e7eeff' }}>
                <div className="max-w-3xl mx-auto px-4 grid gap-3 grid-cols-[1fr_2fr] w-full">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className="w-full rounded-xl py-3.5 font-bold uppercase tracking-widest text-xs transition flex items-center justify-center gap-2"
                        style={currentQuestionIndex === 0
                            ? { background: '#f0f3ff', color: '#c7c4d7', border: '1px solid #e7eeff', cursor: 'not-allowed' }
                            : { background: '#ffffff', color: '#515f74', border: '1px solid #c7c4d7', cursor: 'pointer' }
                        }
                    >
                        <ArrowLeft size={16} /> Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-full rounded-xl py-3.5 font-bold uppercase tracking-widest text-xs transition cursor-pointer flex items-center justify-center gap-2"
                        style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        {currentQuestionIndex === questoes.length - 1
                            ? (isReviewing ? 'Ver Resultado' : 'Finalizar Simulado')
                            : 'Próxima'}
                        {currentQuestionIndex !== questoes.length - 1 && <ArrowRight size={16} />}
                    </button>
                </div>
            </footer>
        </div>
    );
};
