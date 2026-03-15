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
  Ticket
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

  const categories = ['Todos', ...Array.from(new Set(simulados.flatMap(s => s.categories || [])))];

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
      navigate(`/exam/${sim.id}`);
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

  const filteredSimulados = selectedCategory === 'Todos'
    ? activeSimulados
    : activeSimulados.filter(s => s.categories?.includes(selectedCategory));

  return (
    <div className="bg-[#181a17] min-h-screen pb-24 text-white font-sans selection:bg-[#f3ec05] selection:text-black">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#f3ec05] rounded-b-[2.5rem] shadow-2xl">
        <div className="flex items-center p-4 justify-between pt-12 max-w-md mx-auto w-full">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-black italic uppercase tracking-tighter">Vitrine de Simulados</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Plataforma IQ</p>
          </div>
          <div className="size-10 flex items-center justify-end text-black">
            <button onClick={() => navigate(isAdmin ? '/admin' : '/profile')} className="rounded-full bg-black/10 p-2 text-black active:scale-95 transition-transform">
              {isAdmin ? <Settings size={20} /> : <User size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="bg-[#181a17] px-4 py-4 border-b border-[#2b2d26] shadow-sm mb-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-6 py-1.5 rounded-full text-[13px] font-bold transition-all border ${selectedCategory === cat
                ? 'bg-[#f3ec05] text-black border-[#f3ec05] shadow-[0_2px_10px_rgba(243,236,5,0.2)]'
                : 'bg-[#2b2d26] text-slate-300 border-[#3c3d35] hover:border-white/20'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 space-y-8 max-w-md mx-auto">
        {/* Destaques da Semana */}
        {featuredSimulado && (selectedCategory === 'Todos' || featuredSimulado.categories?.includes(selectedCategory)) && (
          <section>
            <div className="flex items-center gap-2.5 mb-5 px-1">
              <Flame size={22} className="text-[#f15a24]" strokeWidth={2.5} />
              <h2 className="text-[19px] font-black text-white tracking-tight">
                Destaques da Semana
              </h2>
            </div>

            <div
              onClick={() => navigate(`/exam/${featuredSimulado.id}`)}
              className="group relative w-full rounded-2xl overflow-hidden cursor-pointer border-2 border-[#f15a24] bg-[#272a24] shadow-2xl flex flex-col transition-transform active:scale-[0.98]"
            >
              <div className="relative h-[200px] w-full bg-[#a3c2b8]">
                {/* Banner */}
                {featuredSimulado.featured_label && (
                  <span className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-[#f15a24] text-white text-[10px] font-black uppercase tracking-wider rounded-sm shadow-md">
                    {featuredSimulado.featured_label}
                  </span>
                )}
                {featuredSimulado.image_url ? (
                  <img src={featuredSimulado.image_url} alt={featuredSimulado.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/10">IMG</div>
                )}
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-black text-white leading-tight truncate flex-1">{featuredSimulado.title}</h3>
                  <div className="flex items-baseline gap-1 shrink-0 pt-1">
                    <span className="text-[13px] font-black text-[#2c73eb]">R$</span>
                    <span className="text-[22px] font-black text-[#2c73eb] leading-none">{formatPrice(featuredSimulado.price)}</span>
                  </div>
                </div>

                <p className="text-[14px] text-[#7aa2a9] font-medium leading-snug pr-2 line-clamp-3">
                  {featuredSimulado.description || 'Descrição não informada.'}
                </p>

                <button
                  disabled={buyingId === featuredSimulado.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuy(featuredSimulado);
                  }}
                  className={`w-full mt-1 ${ownedIds.includes(featuredSimulado.id) ? 'bg-emerald-600' : 'bg-[#2c73eb]'} text-white py-3.5 rounded-xl text-[15px] font-black flex items-center justify-center gap-2.5 hover:opacity-90 transition-colors shadow-lg`}
                >
                  {buyingId === featuredSimulado.id ? (
                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : ownedIds.includes(featuredSimulado.id) ? (
                    <>Acessar Simulado</>
                  ) : (
                    <><ShoppingCart size={18} strokeWidth={2.5} /> Comprar Agora</>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Simulados Disponíveis */}
        <section className="pb-8">
          <h2 className="text-[19px] font-black text-white mb-5 px-1 tracking-tight">Simulados Disponíveis</h2>
          <div className="grid grid-cols-1 gap-4">
            {filteredSimulados.length === 0 ? (
              <div className="p-8 text-center bg-[#272a24] rounded-[1.25rem] border border-[#3c3d35]">
                <p className="text-slate-400 font-bold text-sm">Nenhum simulado disponível nesta categoria.</p>
              </div>
            ) : (
              filteredSimulados.map((simulado) => (
                <div
                  key={simulado.id}
                  onClick={() => navigate(`/exam/${simulado.id}`)}
                  className="bg-[#272a24] rounded-[1.25rem] p-4 flex gap-4 cursor-pointer hover:bg-[#2c2f29] transition-all border border-[#3c3d35] hover:border-[#f15a24]/30 shadow-md active:scale-[0.98]"
                >
                  <div className="size-[88px] shrink-0 rounded-xl bg-[#2a4e4d] border border-white/5 overflow-hidden flex items-center justify-center shadow-inner">
                    {simulado.image_url ? (
                      <img src={simulado.image_url} alt={simulado.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/20 text-3xl font-light italic">IQ</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-bold text-[15px] text-white leading-snug mb-1 truncate">
                        {simulado.title}
                      </h4>
                      <p className="text-[12px] text-[#686868] font-semibold">
                        80 Questões Objetivas
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[15px] font-black text-[#2c73eb]">R$ {formatPrice(simulado.price)}</span>
                      <button
                        disabled={buyingId === simulado.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(simulado);
                        }}
                        className={`${ownedIds.includes(simulado.id) ? 'bg-emerald-600' : 'bg-[#2c73eb]'} text-white px-5 py-2 rounded-xl text-[13px] font-black hover:opacity-90 transition-colors shadow-md`}
                      >
                        {buyingId === simulado.id ? (
                          <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : ownedIds.includes(simulado.id) ? (
                          'Acessar'
                        ) : (
                          'Comprar'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};


const MaterialsScreen = ({ onOpenMenu }: { onOpenMenu: () => void, setView: (v: any) => void }) => (
  <div className="bg-[#0f172a] min-h-screen flex flex-col text-white">
    <header className="sticky top-0 z-50 bg-[#f3ec05] rounded-b-[2.5rem] shadow-2xl">
      <div className="flex items-center p-4 justify-between pt-12 max-w-md mx-auto w-full">
        <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
          <Menu size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black leading-tight text-black italic uppercase tracking-tighter">Materiais</h1>
          <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">IQ Simulados</p>
        </div>
        <div className="size-10" />
      </div>
    </header>
    <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
      <div className="size-24 rounded-3xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 mb-6 border border-yellow-400/20">
        <Rocket size={48} />
      </div>
      <h2 className="text-2xl font-black mb-2 italic">EM BREVE!</h2>
      <p className="text-slate-500 max-w-xs mx-auto">Estamos preparando apostilas, resumos e mapas mentais exclusivos para turbinar sua aprovação.</p>
    </main>
  </div>
);

const AnswerKeyScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col text-white">
      <header className="sticky top-0 z-50 bg-[#f3ec05] rounded-b-[2.5rem] shadow-2xl">
        <div className="flex items-center p-4 justify-between pt-12 max-w-md mx-auto w-full">
          <button onClick={() => navigate('/')} className="size-10 flex items-center justify-start text-black">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-black italic uppercase tracking-tighter">Gabarito</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">IQ Simulados</p>
          </div>
          <div className="size-10" />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Selecione um simulado finalizado para ver o gabarito.</p>
      </main>
    </div>
  );
};

const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const { showAlert } = useModal();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    <div className="bg-[#0f172a] min-h-screen flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-white/5 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
        <h1 className="text-2xl font-black italic uppercase italic tracking-tighter mb-2 text-yellow-400">Nova Senha</h1>
        <p className="text-slate-500 text-xs mb-8 uppercase font-bold tracking-[0.2em]">Crie uma senha segura para sua conta</p>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirmar Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-yellow-400/20 uppercase tracking-widest text-sm italic"
          >
            {loading ? <div className="size-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Atualizar Senha'}
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#f2f20d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col font-display text-white">
      <header className="sticky top-0 z-50 bg-[#f3ec05] rounded-b-[2.5rem] shadow-2xl">
        <div className="flex items-center p-4 justify-between pt-12 max-w-md mx-auto w-full">
          <button onClick={() => navigate('/profile')} className="size-10 flex items-center justify-start text-black">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-black italic uppercase tracking-tighter">Editar Perfil</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Dados Pessoais</p>
          </div>
          <div className="size-10" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto p-8 overflow-y-auto">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sobrenome</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">E-mail de Contato</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Telefone / WhatsApp</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
              placeholder="(00) 00000-0000"
            />
          </div>

          <button
            disabled={saving}
            className="w-full bg-[#f3ec05] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-[#f3ec05]/20 uppercase tracking-widest text-sm italic"
          >
            {saving ? <div className="size-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Salvar Alterações'}
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
  const { showAlert } = useModal();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAdmin(user.app_metadata?.is_admin === true || user.user_metadata?.is_admin === true);

        // Try to fetch from profiles table first
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (profile?.first_name) {
          setUserName(profile.first_name);
        } else {
          // Fallback to metadata
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
        .from('simulados') // Using the same bucket for simplicity, or create an 'avatars' bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('simulados')
        .getPublicUrl(filePath);

      // Update user metadata
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
  };

  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col font-display text-white">
      <header className="sticky top-0 z-50 bg-[#f3ec05] rounded-b-[2.5rem] shadow-2xl">
        <div className="flex items-center p-4 justify-between pt-12 max-w-md mx-auto w-full">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-black italic uppercase tracking-tighter">Perfil</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Conta</p>
          </div>
          <div className="size-10 flex items-center justify-end">
            {isAdmin ? (
              <button onClick={() => navigate('/admin')} className="text-black">
                <Settings size={22} />
              </button>
            ) : <div className="size-10" />}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto pb-24 overflow-y-auto">
        <section className="flex flex-col items-center py-10 px-4">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-full border-4 border-yellow-400 p-1.5 bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-2xl shadow-yellow-400/20 ${uploading ? 'opacity-50' : ''}`}>
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#1e293b] flex items-center justify-center">
                  <User size={64} className="text-slate-400" />
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              {uploading ? (
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Edit size={14} />
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-yellow-400 decoration-4 underline-offset-4">{userName}</h2>
          </div>
        </section>

        <section className="px-6 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Configurações e Pagamento</h3>
          <div className="bg-white/5 rounded-3xl overflow-hidden divide-y divide-white/5 border border-white/5 shadow-sm">
            <button
              onClick={() => navigate('/profile/purchases')}
              className="w-full flex items-center justify-between p-5 active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-yellow-400/10 text-yellow-400">
                  <Receipt size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base text-white">Histórico de Pedidos</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Acessar todas as compras</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600" />
            </button>

            {/* Edit Profile Button */}
            <button onClick={() => navigate('/profile/edit')} className="w-full flex items-center justify-between p-5 active:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-indigo-600/10 text-indigo-400">
                  <User size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base text-white">Editar Dados Pessoais</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nome, e-mail e telefone</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600" />
            </button>

            {/* Change Password Button */}
            <button onClick={handlePasswordChange} className="w-full flex items-center justify-between p-5 active:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-orange-600/10 text-orange-400">
                  <ShieldCheck size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base text-white">Trocar Senha</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Enviar e-mail de redefinição</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>
        </section>

        <section className="px-6 mt-12 pb-12">
          <button
            onClick={onLogout}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange-600/20 uppercase tracking-widest text-sm italic"
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
    <div className="bg-[#0f172a] min-h-screen flex flex-col font-display text-white">
      <header className="sticky top-0 z-50 bg-[#f3ec05] rounded-b-[2.5rem] shadow-2xl">
        <div className="flex items-center p-4 justify-between pt-12 max-w-md mx-auto w-full">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-black italic uppercase tracking-tighter">IQ ADMIN</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Gerenciamento</p>
          </div>
          <div className="size-10 flex items-center justify-end text-black" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 pt-8">
        <div className="flex gap-4 p-6 overflow-x-auto no-scrollbar">
          {[
            { label: 'Usuários', value: userCount.toString(), trend: '+12%', color: '#ffd700' },
            { label: 'Simulados', value: simuladosCount.toString(), trend: '+5%', color: '#f97316' },
            { label: 'Disponível (Stripe)', value: stripeBalance, trend: 'Real-time', color: '#3b82f6' }
          ].map((stat) => (
            <div key={stat.label} className="flex min-w-[140px] flex-col gap-2 rounded-3xl p-6 bg-white/5 border border-white/5 shadow-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black italic text-white">{stat.value}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-black">
                <BarChart3 size={10} /> {stat.trend}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 px-2">Atalhos Administrativos</h2>
          {[
            { icon: FileText, label: 'Gerenciar Simulados', sub: 'Lista completa e edições rápidas', color: '#f97316', onClick: () => navigate('/admin/list') },
            { icon: Ticket, label: 'Cupons e Descontos', sub: 'Criar códigos promocionais Stripe', color: '#ffd700', onClick: () => navigate('/admin/coupons') },
            { icon: List, label: 'Banco de Questões', sub: 'Cadastrar perguntas e respostas', color: '#10b981', onClick: () => navigate('/admin/questoes') },
            { icon: Users, label: 'Usuários e Acessos', sub: 'Status de assinaturas e permissões', color: '#3b82f6', onClick: () => navigate('/admin/users') }
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-5 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 active:scale-[0.98] transition-all group hover:bg-white/10"
            >
              <div className="flex items-center justify-center rounded-2xl text-white shrink-0 size-16 shadow-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: item.color }}>
                <item.icon size={32} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-black text-lg italic leading-tight uppercase text-white">{item.label}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{item.sub}</p>
              </div>
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          ))}
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#f2f20d] border-t-transparent rounded-full animate-spin" />
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
        <div className="relative flex min-h-screen w-full flex-col bg-[#0f172a]">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />

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

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ModalProvider>
  );
}
