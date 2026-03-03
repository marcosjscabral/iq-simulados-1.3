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
            <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="text-[#ffd700] animate-spin" />
            </div>
        );
    }

    if (!simulado || questoes.length === 0) {
        return (
            <div className="bg-[#0f172a] min-h-screen flex flex-col items-center justify-center text-white p-6 text-center">
                <h2 className="text-2xl font-black mb-4">Módulo Vazio</h2>
                <p className="text-slate-400">Este simulado ainda não possui questões cadastradas.</p>
                <button onClick={() => navigate(-1)} className="mt-8 bg-blue-600 px-6 py-3 rounded-xl font-bold">Voltar</button>
            </div>
        );
    }

    if (examFinished && !isReviewing) {
        // Score calculation
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
            <div className="bg-[#0f172a] min-h-screen flex flex-col text-white pb-10 font-sans selection:bg-[#ffd700] selection:text-black">
                <header className="bg-[#ffd700] text-black pt-12 text-center shadow-lg">
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter">RESULTADO FINAL</h1>
                    <p className="text-[12px] uppercase tracking-widest text-[#a88d00] font-black pb-4 mt-2">{simulado.title}</p>
                </header>

                <main className="flex-1 px-6 pb-6 pt-12 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-10 mb-10 w-full max-w-sm">
                        {/* Score Circle */}
                        <div className="size-[120px] shrink-0 rounded-full border-2 border-[#1c2438] bg-[#ffd700] text-black shadow-[0_0_40px_rgba(255,215,0,0.15)] flex flex-col items-center justify-center -ml-4">
                            <span className="text-4xl font-black italic mb-0">{scorePercentage.toFixed(0)}%</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Acertos</span>
                        </div>

                        {/* Timer */}
                        <div className="flex flex-col items-center">
                            <Clock size={32} className="text-white mb-2" strokeWidth={2.5} />
                            <span className="text-[22px] font-black tracking-tight text-white">{formatTime(timeSpent)}</span>
                        </div>
                    </div>

                    <div className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] p-8 border border-[#334155] mb-8 text-center space-y-3 shadow-xl">
                        <p className="font-bold text-lg text-white">Resumo do Desempenho</p>
                        <p className="text-emerald-400 font-bold text-base">Você acertou {correctCount} de {questoes.length} questões.</p>
                    </div>

                    <div className="w-full max-w-sm space-y-4">
                        <button
                            onClick={() => {
                                setIsReviewing(true);
                                setCurrentQuestionIndex(0); // Optional: start from first config
                            }}
                            className="w-full bg-[#f89500] py-4 rounded-xl font-bold text-white text-[15px] flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-[#f89500]/20 hover:bg-[#e08600]"
                        >
                            <ListChecks size={22} className="opacity-90" /> Ver Gabarito Comentado
                        </button>

                        <button
                            onClick={() => navigate('/my-exams')}
                            className="w-full bg-[#4686f7] py-4 rounded-xl font-bold text-white text-[15px] flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-[#4686f7]/20 hover:bg-[#356ed7]"
                        >
                            <ArrowLeft size={22} className="opacity-90" /> Meus Simulados
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const answeredQuestionsCount = Object.keys(answers).length;
    const progressPercentage = (answeredQuestionsCount / questoes.length) * 100;

    return (
        <div className="bg-[#0f172a] min-h-screen flex flex-col text-white font-sans selection:bg-[#ffd700] selection:text-black">
            <header className="sticky top-0 z-40 bg-[#ffd700] text-black shadow-lg">
                <div className="flex items-center p-4 pt-10 justify-between">
                    <button onClick={() => navigate('/my-exams')} className="p-2 -ml-2 rounded-full hover:bg-black/10 transition-colors">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <div className="text-center flex-1 pr-6">
                        <h1 className="font-black text-lg uppercase italic tracking-tight leading-none truncate px-4">{simulado.title}</h1>
                        <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold mt-0.5">{isReviewing ? 'Gabarito Comentado' : 'Execução Oficial'}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-black/10 mt-2">
                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                </div>
            </header>

            <main className="flex-1 p-5 pb-32 max-w-2xl mx-auto w-full flex flex-col pt-8">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-[#272a24] border border-[#f15a24]/30 flex items-center justify-center shadow-inner">
                            <span className="text-[#f15a24] font-black italic text-xl">{currentQuestionIndex + 1}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Questão</span>
                            <span className="font-bold text-sm text-slate-300">de {questoes.length}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-80 cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setShowTimer(!showTimer)}>
                        {showTimer ? (
                            <>
                                <EyeOff size={18} className="text-emerald-400" />
                                <span className="text-[14px] font-black tracking-widest text-emerald-400 font-mono">
                                    {(() => {
                                        const elapsed = Math.floor((currentTime - startTime) / 1000);
                                        const h = Math.floor(elapsed / 3600);
                                        const m = Math.floor((elapsed % 3600) / 60);
                                        const s = elapsed % 60;
                                        return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                    })()}
                                </span>
                            </>
                        ) : (
                            <>
                                <Eye size={18} className="text-slate-500" />
                            </>
                        )}
                    </div>
                </div>

                {/* Question Body */}
                <div className="flex-1 flex flex-col">
                    <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-[#334155] shadow-2xl mb-8 relative">
                        <div className="absolute -top-3 left-8 bg-[#334155] text-[10px] font-black text-white uppercase px-3 py-1 rounded-full tracking-widest shadow-sm">
                            Enunciado
                        </div>
                        <div
                            className="text-slate-200 text-lg sm:text-xl font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: currentQuestion.enunciado }}
                        />
                    </div>

                    {/* Options */}
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

                            let styles = 'bg-[#272a24] border-[#3c3d35] hover:border-[#ffd700]/50 hover:bg-[#2c2f29] text-slate-300 group-hover:text-white';
                            let idBadgeStyles = 'bg-[#181a17] text-slate-400 border-[#3c3d35] group-hover:border-[#ffd700]/50 group-hover:text-[#ffd700]';

                            if (isReviewing) {
                                if (isCorrect) {
                                    styles = 'bg-emerald-900/40 border-emerald-500 text-white';
                                    idBadgeStyles = 'bg-emerald-500 text-white border-emerald-500';
                                } else if (isSelected && !isCorrect) {
                                    styles = 'bg-red-900/40 border-red-500 text-white';
                                    idBadgeStyles = 'bg-red-500 text-white border-red-500';
                                } else {
                                    styles = 'bg-[#272a24] border-[#3c3d35] text-slate-500 opacity-60';
                                    idBadgeStyles = 'bg-[#181a17] text-slate-500 border-[#3c3d35]';
                                }
                            } else if (isSelected) {
                                styles = 'bg-[#2b2b1a] border-[#ffd700] shadow-[0_4px_20px_rgba(255,215,0,0.15)] text-white';
                                idBadgeStyles = 'bg-[#ffd700] text-black border-[#ffd700]';
                            }

                            return (
                                <div
                                    key={opt.id}
                                    onClick={() => !isReviewing && handleSelectOption(opt.id as any)}
                                    className={`group relative flex items-center p-4 rounded-2xl transition-all border-2 ${!isReviewing ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'} ${styles}`}
                                >
                                    <div className={`size-10 shrink-0 rounded-xl flex items-center justify-center font-black text-lg transition-colors border ${idBadgeStyles}`}>
                                        {opt.id}
                                    </div>
                                    <p className={`ml-4 flex-1 text-[15px] font-medium leading-snug transition-colors`}>
                                        {opt.text}
                                    </p>

                                    {isReviewing && isCorrect && (
                                        <div className="absolute right-4 text-emerald-500">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Explicacao Area */}
                    {isReviewing && (
                        <div className="mt-8 bg-[#1e293b] p-6 rounded-[2rem] border border-[#334155] shadow-xl relative animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8 max-w-full overflow-hidden">
                            <div className="flex items-center mb-1">
                                <span className="text-[12px] font-black text-[#4686f7] uppercase tracking-widest bg-[#4686f7]/10 px-3 py-1 rounded-full border border-[#4686f7]/20">
                                    Comentário
                                </span>
                            </div>
                            {currentQuestion.explicacao ? (
                                <div
                                    className="text-slate-200 text-base font-medium leading-relaxed mt-3"
                                    dangerouslySetInnerHTML={{ __html: currentQuestion.explicacao }}
                                />
                            ) : (
                                <div className="text-slate-200 text-base font-medium leading-relaxed mt-3 whitespace-pre-wrap">
                                    Nenhum comentário disponível para esta questão.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/95 to-transparent backdrop-blur-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest text-[13px] border-2 transition-all ${currentQuestionIndex === 0 ? 'border-[#334155] text-slate-500 opacity-50 cursor-not-allowed' : 'border-[#334155] text-white hover:bg-[#334155] active:scale-95'}`}
                    >
                        <ArrowLeft size={18} /> Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        className={`flex-[1.5] py-4 flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest text-[13px] transition-all active:scale-95 shadow-xl ${currentQuestionIndex === questoes.length - 1
                            ? (isReviewing ? 'bg-[#334155] text-white hover:bg-slate-700' : 'bg-[#f15a24] text-white shadow-[#f15a24]/20 hover:bg-orange-600') // Finalizar / Voltar
                            : 'bg-[#2c73eb] text-white shadow-blue-500/20 hover:bg-blue-600' // Próxima
                            }`}
                    >
                        {currentQuestionIndex === questoes.length - 1 ? (isReviewing ? 'Resultado' : 'Finalizar') : 'Próxima'}
                        {currentQuestionIndex !== questoes.length - 1 && <ArrowRight size={18} />}
                    </button>
                </div>
            </footer>
        </div>
    );
};
