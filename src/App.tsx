import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  FileText,
  Users,
  Rocket,
  Plus,
  BarChart3,
  User,
  LogOut,
  Settings,
  Edit,
  ShieldCheck,
  Receipt,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  TrendingUp,
  Flame,
  ShoppingCart,
  List,
  Ticket,
  Eye,
  EyeOff
} from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Simulado } from './types';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import AdminSimulados from './pages/AdminSimulados';
import AdminListSimulados from './pages/AdminListSimulados';
import AdminCoupons from './pages/AdminCoupons';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import { StripeService } from './lib/stripeService';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MyExamsScreen } from './pages/MyExamsScreen';
import { UserRegistrationScreen } from './pages/UserRegistrationScreen';
import { AdminQuestoesScreen } from './pages/AdminQuestoesScreen';
import { ExamExecutionScreen } from './pages/ExamExecutionScreen';
import { PurchaseHistoryScreen } from './pages/PurchaseHistoryScreen';
import { PremiumStorefrontScreen } from './pages/PremiumStorefrontScreen';
import { ModalProvider, useModal } from './components/ModalContext';

// --- Utils ---
const formatPrice = (price: number) => {
  return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- Screens ---

const HomeScreen = ({ onOpenMenu, simulados }: { onOpenMenu: () => void, setView: (v: any) => void, simulados: Simulado[] }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  useEffect(() => {
    fetchOwnedSimulados();
  }, []);

  const fetchOwnedSimulados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('user_simulados').select('simulado_id').eq('user_id', user.id);
      if (data) setOwnedIds(data.map(d => d.simulado_id));
    } catch (err) {
      console.error('Error fetching owned:', err);
    }
  };

  const handleBuy = async (sim: Simulado) => {
    if (ownedIds.includes(sim.id)) {
      const isParent = sim.parent_categories && sim.parent_categories.length > 0;
      navigate(isParent ? `/premium/${sim.id}` : `/exam/${sim.id}`);
      return;
    }

    if (!sim.stripe_price_id) {
      alert('Este simulado não possui um preço configurado no Stripe.');
      return;
    }

    setBuyingId(sim.id);
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Por favor, faça login para continuar com a compra.');
        // Optionally trigger login modal if exists, but for now alert is safer
        return;
      }

      // Check if Stripe enabled
      const { data: settings } = await supabase.from('app_settings').select('value').eq('key', 'stripe_enabled').single();
      if (settings?.value !== 'true') {
        alert('O checkout está desabilitado no momento (Modo Desenvolvimento).');
        return;
      }

      const successUrl = `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&simulado_id=${sim.id}`;
      const cancelUrl = `${window.location.origin}/`;

      const session = await StripeService.createCheckoutSession(sim.stripe_price_id, successUrl, cancelUrl, sim.id);
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Could not create checkout session');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Erro ao iniciar checkout: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setBuyingId(null);
    }
  };

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.app_metadata?.is_admin === true || user?.user_metadata?.is_admin === true);
    };
    checkAdmin();
  }, []);

  const featuredSimulado = simulados.find(s => s.is_featured);
  const activeSimulados = simulados.filter(s => s.is_active && !s.is_featured);

  const premiumTabs = Array.from(new Set(simulados.flatMap(s => s.parent_categories || [])));



  const visibleCategories = Array.from(new Set(simulados.flatMap(s => s.categories || [])))
    .filter(cat => !premiumTabs.includes(cat));

  const categories = ['Todos', ...visibleCategories];

  // A simulado is considered a child if it belongs to a premium tab BUT is NOT the parent of that premium tab.
  const isChild = (s: Simulado) => {
    return s.categories?.some(cat => premiumTabs.includes(cat) && !s.parent_categories?.includes(cat));
  };

  const filteredSimulados = selectedCategory === 'Todos'
    ? activeSimulados.filter(s => !isChild(s))
    : activeSimulados.filter(s => s.categories?.includes(selectedCategory));

  const showFeatured = featuredSimulado && (
    (selectedCategory === 'Todos' && !isChild(featuredSimulado)) ||
    featuredSimulado.categories?.includes(selectedCategory)
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-slate-900 italic uppercase tracking-tighter">Vitrine de Simulados</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Plataforma IQ</p>
          </div>
          <div className="size-10 flex items-center justify-end text-slate-900">
            <button onClick={() => navigate(isAdmin ? '/admin' : '/profile')} className="rounded-full bg-slate-100 p-2 text-slate-900 active:scale-95 transition-transform shadow-sm border border-slate-200">
              {isAdmin ? <Settings size={20} /> : <User size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="bg-white py-4 border-b border-slate-200 shadow-sm mb-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-4 max-w-5xl mx-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-6 py-1.5 rounded-full text-[13px] font-bold transition-all border ${selectedCategory === cat
                ? 'bg-slate-900 text-white border-slate-900 shadow-[0_2px_10px_rgba(15,23,42,0.08)]'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 space-y-8 max-w-5xl mx-auto pt-4">
        {/* Destaques da Semana */}
        {showFeatured && featuredSimulado && (
          <section>
            <div className="flex items-center gap-2.5 mb-5 px-1">
              <Flame size={22} className="text-[#f15a24]" strokeWidth={2.5} />
              <h2 className="text-[19px] font-black text-slate-900 tracking-tight">
                Destaques da Semana
              </h2>
            </div>

            <div
              onClick={() => {
                const isOwned = ownedIds.includes(featuredSimulado.id);
                const isParent = featuredSimulado.parent_categories && featuredSimulado.parent_categories.length > 0;

                if (isOwned) {
                  navigate(isParent ? `/premium/${featuredSimulado.id}` : `/exam/${featuredSimulado.id}`);
                } else {
                  handleBuy(featuredSimulado);
                }
              }}
              className="group relative flex flex-col sm:flex-row w-full rounded-[2rem] overflow-hidden cursor-pointer border border-slate-200 bg-white shadow-sm transition-all active:scale-[0.99] hover:bg-slate-50"
            >
              <div className="relative h-56 sm:h-auto sm:w-80 shrink-0 bg-slate-100 overflow-hidden">
                {/* Banner */}
                {featuredSimulado.featured_label && (
                  <span className="absolute top-6 left-6 z-10 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                    {featuredSimulado.featured_label}
                  </span>
                )}
                {featuredSimulado.image_url ? (
                  <img src={featuredSimulado.image_url} alt={featuredSimulado.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 italic font-black text-3xl">IQ</div>
                )}
              </div>

              <div className="p-8 sm:p-10 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{featuredSimulado.title}</h3>
                  </div>

                  <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6 line-clamp-3 uppercase">
                    {featuredSimulado.description || 'Descrição não informada.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-black text-slate-500 uppercase tracking-widest mb-8">
                    {featuredSimulado.questions_count > 0 && (
                      <span>{featuredSimulado.questions_count} Questões Objetivas</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-3xl sm:text-4xl font-black italic text-slate-900 tracking-tighter">
                      R$ {formatPrice(featuredSimulado.price)}
                    </span>
                  </div>
                  <button
                    disabled={buyingId === featuredSimulado.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(featuredSimulado);
                    }}
                    className={`px-10 py-4 ${ownedIds.includes(featuredSimulado.id) ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-slate-900 shadow-slate-900/20'} text-white rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 hover:opacity-90 transition-all shadow-xl active:scale-95`}
                  >
                    {buyingId === featuredSimulado.id ? (
                      <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : ownedIds.includes(featuredSimulado.id) ? (
                      <>Acessar</>
                    ) : (
                      <>Comprar</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Simulados Disponíveis */}
        <section className="pb-8">
          <h2 className="text-[19px] font-black text-slate-900 mb-5 px-1 tracking-tight">Simulados Disponíveis</h2>
          {filteredSimulados.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-[2rem] border border-slate-200 shadow-sm">
              <p className="text-slate-600 font-semibold text-sm">Nenhum simulado disponível nesta categoria.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredSimulados.map((simulado) => {
                const isOwned = ownedIds.includes(simulado.id);
                const isParent = simulado.parent_categories && simulado.parent_categories.length > 0;

                return (
                  <div
                    key={simulado.id}
                    onClick={() => {
                      if (isOwned) {
                        navigate(isParent ? `/premium/${simulado.id}` : `/exam/${simulado.id}`);
                      } else {
                        handleBuy(simulado);
                      }
                    }}
                    className="group flex flex-col sm:flex-row bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:bg-slate-50 transition-colors cursor-pointer shadow-sm active:scale-[0.99] sm:h-48"
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
                        <p className="text-slate-600 text-sm font-medium line-clamp-2 mb-4 leading-relaxed uppercase pr-4">{simulado.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">
                          {simulado.questions_count > 0 && (
                            <span>{simulado.questions_count} Questões Objetivas</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-black italic text-slate-900 tracking-tighter">
                            R$ {formatPrice(simulado.price)}
                          </span>
                        </div>
                        <button
                          disabled={buyingId === simulado.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuy(simulado);
                          }}
                          className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-sm active:scale-95 flex items-center gap-2 bg-slate-900 text-white"
                        >
                          {buyingId === simulado.id ? (
                            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : isOwned ? (
                            'Acessar'
                          ) : (
                            'Comprar'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </section>
      </main>
    </div>
  );
};


const MaterialsScreen = ({ onOpenMenu }: { onOpenMenu: () => void, setView: (v: any) => void }) => (
  <div className="bg-slate-50 min-h-screen flex flex-col text-slate-900">
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
        <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30">
          <Menu size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black leading-tight text-slate-900 italic uppercase tracking-tighter">Materiais</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">IQ Simulados</p>
        </div>
        <div className="size-10" />
      </div>
    </header>
    <main className="flex-1 p-6 flex flex-col items-center justify-center text-center max-w-5xl mx-auto">
      <div className="size-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-700 mb-6 border border-slate-200">
        <Rocket size={48} />
      </div>
      <h2 className="text-2xl font-black mb-2 italic text-slate-900">EM BREVE!</h2>
      <p className="text-slate-600 max-w-xs mx-auto">Estamos preparando apostilas, resumos e mapas mentais exclusivos para turbinar sua aprovação.</p>
    </main>
  </div>
);

const AnswerKeyScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-display text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center p-4 justify-between pt-12 w-full mx-auto max-w-5xl">
          <button onClick={() => navigate('/')} className="size-10 flex items-center justify-start text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-slate-900 italic uppercase tracking-tighter">Gabarito</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">IQ Simulados</p>
          </div>
          <div className="size-10" />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-10 max-w-lg w-full">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Selecione um simulado finalizado para ver o gabarito.</p>
        </div>
      </main>
    </div>
  );
};

const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const { showAlert } = useModal();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showAlert('Erro', 'As senhas não coincidem.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      showAlert('Sucesso', 'Sua senha foi atualizada!', 'success');
      navigate('/profile');
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao atualizar senha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Nova Senha</h1>
        <p className="text-slate-500 text-sm mb-8 uppercase tracking-[0.2em] font-bold">Crie uma senha segura para sua conta</p>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-sm font-medium focus:border-slate-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirmar Senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-sm font-medium focus:border-slate-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm uppercase tracking-widest text-sm"
          >
            {loading ? <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const { showAlert } = useModal();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || user.email || '',
            phone: data.phone || ''
          });
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      showAlert('Sucesso', 'Perfil atualizado com sucesso!', 'success');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showAlert('Erro', 'Erro ao salvar: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-display text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
          <button onClick={() => navigate('/profile')} className="size-10 flex items-center justify-start text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-slate-900 italic uppercase tracking-tighter">Editar Perfil</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Dados Pessoais</p>
          </div>
          <div className="size-10" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-8 overflow-y-auto">
        <form onSubmit={handleSave} className="space-y-6 bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:border-slate-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sobrenome</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:border-slate-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">E-mail de Contato</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:border-slate-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Telefone / WhatsApp</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:border-slate-400 outline-none transition-all"
              placeholder="(00) 00000-0000"
            />
          </div>

          <button
            disabled={saving}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm uppercase tracking-widest text-sm"
          >
            {saving ? <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Salvar Alterações'}
          </button>
        </form>
      </main>
    </div>
  );
};

const ProfileScreen = ({ onOpenMenu, onLogout }: { onOpenMenu: () => void, onLogout: () => void }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('Usuário');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAdmin(user.app_metadata?.is_admin === true || user.user_metadata?.is_admin === true);

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (profile?.first_name) {
          setUserName(profile.first_name);
        } else {
          const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
          const firstName = fullName.split(' ')[0];
          setUserName(firstName);
        }

        if (user.user_metadata?.avatar_url) {
          setUserAvatar(user.user_metadata.avatar_url);
        }
      }
    };
    fetchUser();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('simulados')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('simulados')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setUserAvatar(publicUrl);
      showAlert('Sucesso', 'Foto de perfil atualizada!', 'success');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showAlert('Erro', 'Erro ao fazer upload: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    showConfirm(
      'Alterar Senha?',
      'Tem certeza que deseja alterar sua senha atual?',
      async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.email) return;

          const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;
          showAlert('Sucesso', 'E-mail de redefinição enviado para ' + user.email, 'success');
        } catch (error: any) {
          showAlert('Erro', 'Erro ao solicitar troca: ' + error.message, 'error');
        }
      },
      'Alterar',
      'Cancelar'
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-display text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-slate-900 italic uppercase tracking-tighter">Perfil</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Conta</p>
          </div>
          <div className="size-10 flex items-center justify-end">
            {isAdmin ? (
              <button onClick={() => navigate('/admin')} className="text-slate-900">
                <Settings size={22} />
              </button>
            ) : <div className="size-10" />}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto pb-24 overflow-y-auto">
        <section className="flex flex-col items-center py-10 px-4">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-full border-4 border-slate-200 p-1.5 bg-slate-100 shadow-sm ${uploading ? 'opacity-50' : ''}`}>
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                  <User size={64} className="text-slate-500" />
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-slate-900 text-white p-2.5 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              {uploading ? (
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Edit size={14} />
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-slate-900 decoration-4 underline-offset-4">{userName}</h2>
          </div>
        </section>

        <section className="px-6 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Configurações e Pagamento</h3>
          <div className="bg-white rounded-3xl overflow-hidden divide-y divide-slate-200 border border-slate-200 shadow-sm">
            <button
              onClick={() => navigate('/profile/purchases')}
              className="w-full flex items-center justify-between p-5 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-slate-100 text-slate-700">
                  <Receipt size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base text-slate-900">Histórico de Pedidos</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Acessar todas as compras</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-500" />
            </button>

            <button onClick={() => navigate('/profile/edit')} className="w-full flex items-center justify-between p-5 active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-slate-100 text-slate-700">
                  <User size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base text-slate-900">Editar Dados Pessoais</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nome, e-mail e telefone</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-500" />
            </button>

            <button onClick={handlePasswordChange} className="w-full flex items-center justify-between p-5 active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-slate-100 text-slate-700">
                  <ShieldCheck size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base text-slate-900">Trocar Senha</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Enviar e-mail de redefinição</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-500" />
            </button>
          </div>
        </section>

        <section className="px-6 mt-12 pb-12">
          <button
            onClick={onLogout}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm uppercase tracking-widest text-sm"
          >
            <LogOut size={20} /> Sair da Conta
          </button>
        </section>
      </main>
    </div>
  );
};

const AdminDashboardScreen = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number | string>('...');
  const [simuladosCount, setSimuladosCount] = useState<number | string>('...');
  const [stripeBalance, setStripeBalance] = useState<string>('...');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: userData } = await supabase.rpc('get_all_users');
        if (userData) setUserCount(userData.length);

        const { count: simCount } = await supabase
          .from('simulados')
          .select('*', { count: 'exact', head: true });

        if (simCount !== null) setSimuladosCount(simCount);

        try {
          const balance = await StripeService.getBalance();
          if (balance.available && balance.available[0]) {
            const amount = balance.available[0].amount / 100;
            setStripeBalance(`R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
          } else {
            setStripeBalance('R$ 0,00');
          }
        } catch (e) {
          console.error('Error fetching Stripe balance:', e);
          setStripeBalance('Indisponível');
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-display text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white shadow-sm shadow-slate-200">
        <div className="flex items-center p-4 justify-between pt-12 w-full max-w-6xl mx-auto">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-slate-900 italic tracking-tight">IQ ADMIN</h1>
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">Gerenciamento</p>
          </div>
          <div className="size-10 flex items-center justify-end text-slate-900" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 pt-8">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">Painel</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Painel administrativo</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Acompanhe seus principais indicadores de forma clara e acesse rapidamente as áreas mais importantes do sistema.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Visão geral do dashboard
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Usuários', value: userCount.toString(), trend: '+12%' },
                { label: 'Simulados', value: simuladosCount.toString(), trend: '+5%' },
                { label: 'Saldo Stripe', value: stripeBalance, trend: 'Real-time' }
              ].map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5 shadow-sm shadow-slate-200/50">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">{stat.label}</p>
                  <p className="mt-4 text-3xl font-black leading-tight text-slate-900">{stat.value}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-600 font-semibold">
                    <BarChart3 size={14} /> {stat.trend}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">Ações</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Principais acessos</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Abra as áreas mais importantes do painel com um único clique.</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: FileText, label: 'Gerenciar Simulados', sub: 'Editar catálogo completo', color: '#f97316', onClick: () => navigate('/admin/list') },
                  { icon: Ticket, label: 'Cupons', sub: 'Promoções Stripe', color: '#facc15', onClick: () => navigate('/admin/coupons') }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-5 py-5 text-left transition duration-200 ease-out hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:scale-[0.98]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: item.color }}>
                      <item.icon size={22} />
                    </div>
                    <div>
                      <p className="text-base font-black tracking-tight text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200">
              <div className="flex flex-col gap-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">Atalhos</p>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Navegação rápida</h3>
                <p className="text-sm leading-relaxed text-slate-600">Acesse as áreas de administração mais utilizadas com cartões claros e diretos.</p>
              </div>
              <div className="mt-6 grid gap-4">
                {[
                  { icon: FileText, label: 'Gerenciar Simulados', sub: 'Lista completa e edições rápidas', color: '#f97316', onClick: () => navigate('/admin/list') },
                  { icon: Ticket, label: 'Cupons e Descontos', sub: 'Criar códigos promocionais Stripe', color: '#facc15', onClick: () => navigate('/admin/coupons') },
                  { icon: List, label: 'Banco de Questões', sub: 'Cadastrar perguntas e respostas', color: '#38bdf8', onClick: () => navigate('/admin/questoes') },
                  { icon: Users, label: 'Usuários e Acessos', sub: 'Status de assinaturas e permissões', color: '#22c55e', onClick: () => navigate('/admin/users') }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="flex w-full flex-col gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-5 text-left transition duration-200 ease-out hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: item.color }}>
                        <item.icon size={24} />
                      </div>
                      <div>
                        <p className="text-lg font-black tracking-tight text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};


export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [simulados, setSimulados] = useState<Simulado[]>([]);

  useEffect(() => {
    const checkUser = async (user: SupabaseUser | null) => {
      if (user && !user.email_confirmed_at) {
        await supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(user);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUser(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);

      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password';
        return;
      }

      checkUser(session?.user ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSimulados = async () => {
    try {
      const { data, error } = await supabase
        .from('simulados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSimulados(data);
    } catch (error) {
      console.error('Error fetching simulados:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSimulados();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={() => { }} />;
  }

  const uniqueCategories = Array.from(new Set(simulados.flatMap(s => s.categories || [])));

  return (
    <ModalProvider>
      <Router>
        <div className="relative flex min-h-screen w-full flex-col lg:flex-row bg-slate-50">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />

          <div className="flex-1 min-w-0 flex flex-col relative w-full">
            <Routes>
              <Route path="/" element={
                <HomeScreen
                  onOpenMenu={() => setSidebarOpen(true)}
                  setView={() => { }}
                  simulados={simulados}
                />
              } />
              <Route path="/my-exams" element={
                <MyExamsScreen onOpenMenu={() => setSidebarOpen(true)} />
              } />
              <Route path="/materials" element={
                <MaterialsScreen onOpenMenu={() => setSidebarOpen(true)} setView={() => { }} />
              } />
              <Route path="/profile" element={
                <ProfileScreen
                  onOpenMenu={() => setSidebarOpen(true)}
                  onLogout={handleLogout}
                />
              } />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              <Route path="/profile/edit" element={<EditProfileScreen />} />
              <Route path="/profile/purchases" element={<PurchaseHistoryScreen />} />
              <Route path="/exam/:id" element={<ExamExecutionScreen />} />
              <Route path="/exam/:id/answer-key" element={<AnswerKeyScreen />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />

              {/* Admin Routes (Protected) */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboardScreen onOpenMenu={() => setSidebarOpen(true)} />
                </ProtectedRoute>
              } />
              <Route path="/admin/list" element={
                <ProtectedRoute requireAdmin>
                  <AdminListSimulados onPublishSuccess={fetchSimulados} />
                </ProtectedRoute>
              } />
              <Route path="/admin/simulados/new" element={
                <ProtectedRoute requireAdmin>
                  <AdminSimulados onPublishSuccess={fetchSimulados} availableCategories={uniqueCategories} />
                </ProtectedRoute>
              } />
              <Route path="/admin/simulados/:id" element={
                <ProtectedRoute requireAdmin>
                  <AdminSimulados onPublishSuccess={fetchSimulados} availableCategories={uniqueCategories} />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                  <UserRegistrationScreen />
                </ProtectedRoute>
              } />
              <Route path="/admin/questoes" element={
                <ProtectedRoute requireAdmin>
                  <AdminQuestoesScreen />
                </ProtectedRoute>
              } />
              <Route path="/admin/coupons" element={
                <ProtectedRoute requireAdmin>
                  <AdminCoupons />
                </ProtectedRoute>
              } />

              <Route path="/premium/:id" element={
                <ProtectedRoute>
                  <PremiumStorefrontScreen />
                </ProtectedRoute>
              } />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ModalProvider>
  );
}
