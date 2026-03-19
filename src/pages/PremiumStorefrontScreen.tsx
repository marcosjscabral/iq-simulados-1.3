import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, Loader2, Search, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Simulado } from '../types';
import { StripeService } from '../lib/stripeService';
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

    // Modal state
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
                // 1. Fetch parent simulado
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

                // 2. Fetch all active simulados
                const { data: allSimulados, error: allSimError } = await supabase
                    .from('simulados')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });
                
                if (allSimError) throw allSimError;

                // 3. Filter for children (belongs to a category of the parent, but is NOT the parent)
                // Also, it should only be considered a child if it does NOT have that category as its own parent_category 
                // Wait, the rule is: a child has the category in `categories` but NOT in `parent_categories`.
                const children = (allSimulados || []).filter(s => {
                    const hasPremiumCategory = s.categories?.some(c => premiumCategories.includes(c));
                    const isNotParent = !s.parent_categories?.some(c => premiumCategories.includes(c));
                    return hasPremiumCategory && isNotParent;
                });

                setChildSimulados(children);

                // 4. Fetch owned simulados
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
        if (ownedIds.includes(sim.id)) {
            navigate(`/exam/${sim.id}`);
            return;
        }

        if (!sim.stripe_price_id) {
            showAlert('Indisponível', 'Este simulado não possui um preço configurado no Stripe.', 'warning');
            return;
        }

        setBuyingId(sim.id);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showAlert('Acesso Negado', 'Por favor, faça login para continuar com a compra.', 'warning');
                return;
            }

            const { data: settings } = await supabase.from('app_settings').select('value').eq('key', 'stripe_enabled').single();
            if (settings?.value !== 'true') {
                showAlert('Desabilitado', 'O checkout está desabilitado no momento.', 'info');
                return;
            }

            const successUrl = `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&simulado_id=${sim.id}`;
            const cancelUrl = `${window.location.origin}/premium/${id}`;

            const session = await StripeService.createCheckoutSession(sim.stripe_price_id, successUrl, cancelUrl, sim.id);
            if (session.url) {
                window.location.href = session.url;
            } else {
                throw new Error('Could not create checkout session');
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            showAlert('Erro', 'Erro ao iniciar checkout: ' + (err.message || 'Erro desconhecido'), 'error');
        } finally {
            setBuyingId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#181a17] min-h-screen text-white flex justify-center items-center">
                <Loader2 size={40} className="text-[#f3ec05] animate-spin" />
            </div>
        );
    }

    if (!parentSimulado) return null;

    return (
        <div className="bg-[#181a17] min-h-screen text-white font-sans selection:bg-[#f3ec05] selection:text-black">
            <header className="sticky top-0 z-50 bg-[#181a17]/90 backdrop-blur-md border-b border-white/5 shadow-2xl">
                <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
                    <button onClick={() => navigate('/my-exams')} className="size-10 flex items-center justify-start text-white hover:text-[#f3ec05] transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center flex-1 mx-4">
                        <h1 className="text-xl font-black leading-tight text-white uppercase tracking-tighter truncate w-full text-center">
                            Vitrine: {parentSimulado.title}
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1">
                            <ShieldCheck size={12} /> Acesso VIP
                        </p>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-8 max-w-5xl mx-auto pt-8 pb-24">
                {childSimulados.length === 0 ? (
                    <div className="bg-[#272a24] p-12 rounded-[2.5rem] border border-[#3c3d35] text-center shadow-md">
                        <p className="text-slate-400 font-bold">Nenhum conteúdo exclusivo encontrado para esta vitrine.</p>
                    </div>
                ) : (
                    <section>
                        <div className="flex items-center gap-2.5 mb-5 px-1">
                            <Flame size={22} className="text-[#f15a24]" strokeWidth={2.5} />
                            <h2 className="text-xl font-black italic tracking-tight text-white">Conteúdo Exclusivo</h2>
                        </div>
                        <div className="flex flex-col gap-6">
                            {childSimulados.map((simulado) => {
                                const isOwned = ownedIds.includes(simulado.id);
                                return (
                                    <div
                                        key={simulado.id}
                                        onClick={() => handleBuy(simulado)}
                                        className="group flex flex-col sm:flex-row bg-[#20221e] border border-white/5 rounded-[2rem] overflow-hidden hover:bg-[#252822] transition-colors cursor-pointer shadow-lg active:scale-[0.99]"
                                    >
                                        <div className="w-full sm:w-56 h-40 sm:h-auto shrink-0 bg-[#2a4e4d] relative overflow-hidden">
                                            {simulado.image_url ? (
                                                <img src={simulado.image_url} alt={simulado.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20 italic font-black text-2xl">IQ</div>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col justify-between flex-1">
                                            <div>
                                                <h3 className="text-lg font-black text-white leading-tight mb-2 uppercase tracking-tight">{simulado.title}</h3>
                                                <p className="text-[#64748b] text-xs font-semibold line-clamp-2 mb-4 leading-relaxed uppercase pr-4">
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
                                                        <span className="text-2xl font-black italic text-emerald-400 tracking-tighter">LIBERADO</span>
                                                    ) : (
                                                        <span className="text-2xl font-black italic text-[#f3ec05] tracking-tighter">
                                                            R$ {formatPrice(simulado.price)}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    disabled={buyingId === simulado.id}
                                                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg active:scale-95 flex items-center gap-2
                                                        ${isOwned ? 'bg-emerald-600' : 'bg-[#2c73eb]'} text-white`}
                                                >
                                                    {buyingId === simulado.id ? (
                                                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : isOwned ? (
                                                        'Acessar'
                                                    ) : (
                                                        'Iniciar'
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

            {/* Custom Modal for Alerts */}
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
