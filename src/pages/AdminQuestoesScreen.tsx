import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Check, Save, Layers, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Simulado, Questao } from '../types';
import { useModal } from '../components/ModalContext';
import { RichInput } from '../components/RichInput';

export const AdminQuestoesScreen = () => {
    const navigate = useNavigate();
    const [simulados, setSimulados] = useState<Simulado[]>([]);
    const [selectedSimuladoId, setSelectedSimuladoId] = useState<string>('');
    const [questoes, setQuestoes] = useState<Questao[]>([]);

    // Form state
    const [enunciado, setEnunciado] = useState('');
    const [opcaoA, setOpcaoA] = useState('');
    const [opcaoB, setOpcaoB] = useState('');
    const [opcaoC, setOpcaoC] = useState('');
    const [opcaoD, setOpcaoD] = useState('');
    const [opcaoE, setOpcaoE] = useState('');
    const [respostaCorreta, setRespostaCorreta] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
    const [explicacao, setExplicacao] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { showAlert, showConfirm } = useModal();

    useEffect(() => {
        fetchSimulados();
    }, []);

    useEffect(() => {
        if (selectedSimuladoId) {
            fetchQuestoes(selectedSimuladoId);
        } else {
            setQuestoes([]);
        }
    }, [selectedSimuladoId]);

    const fetchSimulados = async () => {
        const { data } = await supabase.from('simulados').select('*').order('title');
        if (data) setSimulados(data);
    };

    const fetchQuestoes = async (simuladoId: string) => {
        const { data } = await supabase
            .from('questoes')
            .select('*')
            .eq('simulado_id', simuladoId)
            .order('numero', { ascending: true });

        if (data) setQuestoes(data);
    };

    const resetForm = () => {
        setEnunciado('');
        setOpcaoA('');
        setOpcaoB('');
        setOpcaoC('');
        setOpcaoD('');
        setOpcaoE('');
        setRespostaCorreta('A');
        setExplicacao('');
        setEditingId(null);
    };

    const handleEdit = (questao: Questao) => {
        setEnunciado(questao.enunciado);
        setOpcaoA(questao.opcao_a);
        setOpcaoB(questao.opcao_b);
        setOpcaoC(questao.opcao_c);
        setOpcaoD(questao.opcao_d);
        setOpcaoE(questao.opcao_e || '');
        setRespostaCorreta(questao.resposta_correta);
        setExplicacao(questao.explicacao || '');
        setEditingId(questao.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        showConfirm('Excluir Questão', 'Deseja realmente excluir esta questão?', async () => {
            try {
                await supabase.from('questoes').delete().eq('id', id);
                await fetchQuestoes(selectedSimuladoId);

                // Update question count
                if (selectedSimuladoId) {
                    const { count } = await supabase.from('questoes').select('*', { count: 'exact', head: true }).eq('simulado_id', selectedSimuladoId);
                    await supabase.from('simulados').update({ questions_count: count || 0 }).eq('id', selectedSimuladoId);
                }
            } catch (e) {
                console.error(e);
                showAlert('Erro', 'Erro ao excluir componente.', 'error');
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSimuladoId) {
            showAlert('Atenção', 'Selecione um simulado antes de cadastrar a questão.', 'alert');
            return;
        }

        if (!enunciado || !opcaoA || !opcaoB || !opcaoC || !opcaoD) {
            showAlert('Atenção', 'Preencha os campos obrigatórios (Enunciado e opções A a D).', 'alert');
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                simulado_id: selectedSimuladoId,
                numero: editingId ? (questoes.find(q => q.id === editingId)?.numero || 1) : (questoes.length > 0 ? Math.max(...questoes.map(q => q.numero)) + 1 : 1),
                enunciado,
                opcao_a: opcaoA,
                opcao_b: opcaoB,
                opcao_c: opcaoC,
                opcao_d: opcaoD,
                opcao_e: opcaoE || null,
                resposta_correta: respostaCorreta,
                explicacao: explicacao || null
            };

            if (editingId) {
                await supabase.from('questoes').update(payload).eq('id', editingId);
            } else {
                await supabase.from('questoes').insert([payload]);
            }

            await fetchQuestoes(selectedSimuladoId);

            // Update simulado questions_count trigger manually just in case
            const { count } = await supabase.from('questoes').select('*', { count: 'exact', head: true }).eq('simulado_id', selectedSimuladoId);
            await supabase.from('simulados').update({ questions_count: count || 0 }).eq('id', selectedSimuladoId);

            resetForm();
            showAlert('Sucesso', 'Questão salva com sucesso!', 'success');
        } catch (err: any) {
            console.error(err);
            showAlert('Erro', 'Erro ao salvar questão: ' + err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#0f172a] min-h-screen text-white font-sans">
            <header className="sticky top-0 z-50 bg-[#f3ec05] rounded-b-[2.5rem] shadow-2xl text-black">
                <div className="flex items-center p-4 justify-between pt-12 max-w-2xl mx-auto w-full">
                    <button onClick={() => navigate('/admin')} className="size-10 flex items-center justify-start text-black">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-xl font-black leading-tight text-black italic uppercase tracking-tighter">Questões</h1>
                        <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Banco de Dados</p>
                    </div>
                    <div className="size-10" />
                </div>
            </header>

            <main className="p-4 max-w-2xl mx-auto pb-24 space-y-8">

                {/* Simulado Selector */}
                <section className="bg-[#1e293b] p-5 rounded-3xl border border-[#334155] shadow-lg">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Selecione o Simulado Alvo</label>
                    <div className="relative">
                        <select
                            className="w-full bg-[#0f172a] border-2 border-[#334155] rounded-xl h-14 px-4 text-white font-bold outline-none focus:border-[#f3ec05] transition-colors appearance-none"
                            value={selectedSimuladoId}
                            onChange={(e) => setSelectedSimuladoId(e.target.value)}
                        >
                            <option value="">-- Escolha um Simulado --</option>
                            {simulados.map(sim => (
                                <option key={sim.id} value={sim.id}>{sim.title}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Layers size={20} />
                        </div>
                    </div>
                </section>

                {selectedSimuladoId && (
                    <>
                        {/* Form */}
                        <section className="bg-[#1e293b] p-6 rounded-3xl border border-[#334155] shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                    <Edit2 size={24} />
                                </div>
                                <h2 className="text-xl font-black italic uppercase text-white">
                                    {editingId ? 'Editar Questão' : 'Nova Questão'}
                                </h2>
                            </div>

                            <form onSubmit={handleSave} className="space-y-5">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Enunciado / Pergunta</label>
                                    <RichInput
                                        value={enunciado}
                                        onChange={(val) => setEnunciado(val)}
                                        className="w-full"
                                        placeholder="Digite o enunciado da questão..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 mt-6">Alternativas</label>

                                    {[
                                        { id: 'A', val: opcaoA, set: setOpcaoA },
                                        { id: 'B', val: opcaoB, set: setOpcaoB },
                                        { id: 'C', val: opcaoC, set: setOpcaoC },
                                        { id: 'D', val: opcaoD, set: setOpcaoD },
                                        { id: 'E', val: opcaoE, set: setOpcaoE, optional: true },
                                    ].map(opt => (
                                        <div key={opt.id} className="flex items-center gap-3">
                                            <div className={`shrink-0 flex items-center justify-center size-10 rounded-lg font-black text-lg border-2 cursor-pointer transition-colors ${respostaCorreta === opt.id ? 'bg-[#f3ec05] border-[#f3ec05] text-black shadow-[0_0_15px_rgba(243,236,5,0.3)]' : 'bg-[#0f172a] border-[#334155] text-slate-400 hover:border-slate-500'}`} onClick={() => setRespostaCorreta(opt.id as any)}>
                                                {opt.id}
                                            </div>
                                            <input
                                                type="text"
                                                value={opt.val}
                                                onChange={(e) => opt.set(e.target.value)}
                                                placeholder={`Texto da alternativa ${opt.id}${opt.optional ? ' (Opcional)' : ''}...`}
                                                className={`flex-1 bg-[#0f172a] border-2 rounded-xl h-12 px-4 text-sm font-medium outline-none transition-colors ${respostaCorreta === opt.id ? 'border-[#ffd700]/50 focus:border-[#ffd700]' : 'border-[#334155] focus:border-blue-500'}`}
                                                required={!opt.optional}
                                            />
                                        </div>
                                    ))}
                                    <p className="text-[10px] uppercase text-emerald-400/80 font-bold px-1 mt-2">
                                        Clique na letra (A-E) para marcar qual é a correta.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 mt-6 mb-2">Comentário / Explicação (Opcional)</label>
                                    <RichInput
                                        value={explicacao}
                                        onChange={(val) => setExplicacao(val)}
                                        className="w-full"
                                        placeholder="Justificativa da resposta..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {editingId && (
                                        <button type="button" onClick={resetForm} className="flex-1 py-4 rounded-xl font-bold uppercase text-sm border-2 border-[#334155] text-white hover:bg-[#334155] transition-colors">
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className={`flex-[2] bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-blue-500 ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
                                    >
                                        {isSaving ? 'Salvando...' : <><Save size={20} /> Salvar Questão</>}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* List */}
                        <section>
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <List size={20} className="text-[#ffd700]" />
                                <h3 className="font-black text-lg uppercase italic">Questões Salvas ({questoes.length})</h3>
                            </div>

                            <div className="space-y-3">
                                {questoes.length === 0 ? (
                                    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 text-center text-slate-400 text-sm font-bold">
                                        Nenhuma questão cadastrada neste simulado ainda.
                                    </div>
                                ) : (
                                    questoes.map((q, index) => (
                                        <div key={q.id} className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 flex gap-4">
                                            <div className="size-10 rounded-lg bg-[#0f172a] border border-[#334155] flex items-center justify-center font-black text-[#ffd700] shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div
                                                    className="font-medium text-sm text-white line-clamp-2 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: q.enunciado }}
                                                />
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                                                        Gabarito: {q.resposta_correta}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 shrink-0">
                                                <button onClick={() => handleEdit(q)} className="size-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(q.id)} className="size-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}

            </main>
        </div>
    );
};
