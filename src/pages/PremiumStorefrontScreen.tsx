import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Simulado } from '../types';
import { CustomModal } from '../components/CustomModal';

const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const PremiumStorefrontScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [parentSimulado, setParentSimulado] = useState<Simulado | null>(null);
    const [childSimulados, setChildSimulados] = useState<Simulado[]>([]);
    const [ownedIds, setOwnedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<string | null>(null);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
        onConfirm?: () => void;
    }>({ isOpen: false, title: '', message: '', type: 'info' });

    const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', onConfirm?: () => void) => {
        setModalConfig({ isOpen: true, title, message, type, onConfirm });
    };

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setLoading(true);

            try {
                const { data: parentData, error: parentError } = await supabase
                    .from('simulados')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (parentError || !parentData) throw new Error('Simulado Pai não encontrado.');
                setParentSimulado(parentData);

                const premiumCategories = parentData.parent_categories || [];
                if (premiumCategories.length === 0) {
                    setLoading(false);
                    return;
                }

                const { data: allSimulados, error: allSimError } = await supabase
                    .from('simulados')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (allSimError) throw allSimError;

                const children = (allSimulados || []).filter(s => {
                    const hasPremiumCategory = s.categories?.some(c => premiumCategories.includes(c));
                    const isNotParent = !s.parent_categories?.some(c => premiumCategories.includes(c));
                    return hasPremiumCategory && isNotParent;
                });

                setChildSimulados(children);

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: ownedData } = await supabase
                        .from('user_simulados')
                        .select('simulado_id')
                        .eq('user_id', user.id);
                    if (ownedData) {
                        setOwnedIds(ownedData.map(d => d.simulado_id));
                    }
                }
            } catch (err: any) {
                console.error('Error loading premium storefront:', err);
                showAlert('Erro', err.message || 'Erro ao carregar vitrine premium.', 'error', () => navigate('/my-exams'));
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, navigate]);

    const handleBuy = async (sim: Simulado) => {
        setBuyingId(sim.id);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showAlert('Acesso Negado', 'Por favor, faça login para continuar.', 'warning');
                return;
            }
            navigate(`/exam/${sim.id}`);
        } catch (err: any) {
            console.error('Access error:', err);
            showAlert('Erro', 'Erro ao acessar o simulado: ' + (err.message || 'Erro desconhecido'), 'error');
        } finally {
            setBuyingId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen text-slate-900 flex justify-center items-center">
                <Loader2 size={40} className="text-slate-900 animate-spin" />
            </div>
        );
    }

    if (!parentSimulado) return null;

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
                    <button onClick={() => navigate('/my-exams')} className="size-10 flex items-center justify-start text-slate-900 hover:text-slate-700 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center flex-1 mx-4">
                        <h1 className="text-xl font-black leading-tight text-slate-900 uppercase tracking-tighter truncate w-full text-center">
                            Vitrine: {parentSimulado.title}
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1">
                            <ShieldCheck size={12} /> Acesso VIP
                        </p>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-8 max-w-5xl mx-auto pt-8 pb-24">
                {childSimulados.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
                        <p className="text-slate-600 font-bold">Nenhum conteúdo exclusivo encontrado para esta vitrine.</p>
                    </div>
                ) : (
                    <section>
                        <div className="flex items-center gap-2.5 mb-5 px-1">
                            <Flame size={22} className="text-[#f15a24]" strokeWidth={2.5} />
                            <h2 className="text-xl font-black italic tracking-tight text-slate-900">Conteúdo Exclusivo</h2>
                        </div>
                        <div className="flex flex-col gap-6">
                            {childSimulados.map((simulado) => {
                                const isOwned = ownedIds.includes(simulado.id);
                                return (
                                    <div
                                        key={simulado.id}
                                        onClick={() => handleBuy(simulado)}
                                        className="group flex flex-col sm:flex-row bg-white border border-slate-200 rounded-xl overflow-hidden hover:bg-slate-50 transition-colors cursor-pointer shadow-sm active:scale-[0.99] sm:h-48"
                                    >
                                        <div className="w-full sm:w-56 h-48 sm:h-full shrink-0 bg-slate-100 relative overflow-hidden">
                                            {simulado.image_url ? (
                                                <img src={simulado.image_url} alt={simulado.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 italic font-black text-2xl">IQ</div>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col justify-between flex-1">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight">{simulado.title}</h3>
                                                <p className="text-slate-600 text-sm font-medium line-clamp-2 mb-4 leading-relaxed uppercase pr-4">
                                                    {simulado.description || 'Simulado disponível para estudo imediato.'}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">
                                                    {simulado.questions_count > 0 && (
                                                        <span>{simulado.questions_count} Questões Objetivas</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-1">
                                                    {isOwned ? (
                                                        <span className="text-2xl font-black italic text-emerald-600 tracking-tighter">LIBERADO</span>
                                                    ) : (
                                                        <span className="text-2xl font-black italic text-slate-900 tracking-tighter">
                                                            R$ {formatPrice(simulado.price)}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    disabled={buyingId === simulado.id}
                                                    onClick={(e) => { e.stopPropagation(); handleBuy(simulado); }}
                                                    className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-sm active:scale-95 flex items-center gap-2 bg-slate-900 text-white"
                                                >
                                                    {buyingId === simulado.id ? (
                                                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        'Acessar'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            <CustomModal
                isOpen={modalConfig.isOpen}
                onClose={() => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    if (modalConfig.onConfirm) modalConfig.onConfirm();
                }}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText="OK"
            />
        </div>
    );
};
