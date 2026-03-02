import { useState, useEffect } from 'react';
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
  CreditCard,
  Receipt,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  TrendingUp
} from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Simulado } from './types';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import AdminSimulados from './pages/AdminSimulados';
import AdminListSimulados from './pages/AdminListSimulados';
import { ProtectedRoute } from './components/ProtectedRoute';

// --- Screens ---

const HomeScreen = ({ onOpenMenu, simulados }: { onOpenMenu: () => void, setView: (v: any) => void, simulados: Simulado[] }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', ...Array.from(new Set(simulados.flatMap(s => s.categories || [])))];
  const featuredSimulado = simulados.find(s => s.is_featured);
  const activeSimulados = simulados.filter(s => s.is_active && !s.is_featured);

  const filteredSimulados = selectedCategory === 'Todos'
    ? activeSimulados
    : activeSimulados.filter(s => s.categories?.includes(selectedCategory));

  return (
    <div className="bg-[#121212] min-h-screen pb-24 text-white font-display">
      <header className="sticky top-0 z-50 bg-[#f2f20d] border-b border-black/5">
        <div className="flex items-center p-4 justify-between pt-12">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-black leading-tight text-black italic uppercase tracking-tighter">IQ Simulados</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Vitrine</p>
          </div>
          <div className="size-10 flex items-center justify-end">
            <button onClick={() => navigate('/profile')} className="rounded-full bg-black/10 p-2 text-black">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-8 max-w-md mx-auto">
        {/* Categories Pills */}
        <section className="-mx-4 px-4 overflow-x-auto no-scrollbar py-2">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                  ? 'bg-[#f2f20d] text-black shadow-lg shadow-yellow-400/20'
                  : 'bg-white/5 text-slate-500 border border-white/10'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Hero Section / Featured */}
        {featuredSimulado && (
          <section>
            <div className="flex items-center gap-2 mb-4 px-1">
              <TrendingUp size={16} className="text-yellow-400" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Destaques da Semana <span className="animate-pulse">🔥</span>
              </h2>
            </div>
            <div
              onClick={() => navigate(`/exam/${featuredSimulado.id}`)}
              className="group relative h-72 w-full rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl ring-1 ring-white/10"
            >
              {featuredSimulado.image_url ? (
                <img src={featuredSimulado.image_url} alt={featuredSimulado.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center">
                  <span className="text-4xl font-black text-white/5 italic">IQ</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/20 to-transparent" />
              <div className="absolute bottom-0 p-8 w-full">
                {featuredSimulado.featured_label && (
                  <span className="inline-block px-3 py-1 rounded-full bg-orange-600 text-white text-[8px] font-black uppercase tracking-[0.2em] mb-3 shadow-lg">
                    {featuredSimulado.featured_label}
                  </span>
                )}
                <h3 className="text-2xl font-black text-white mb-2 italic uppercase leading-tight">{featuredSimulado.title}</h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 line-through">R$ {(featuredSimulado.price * 1.5).toFixed(2)}</span>
                    <span className="text-2xl font-black text-yellow-400 italic">R$ {featuredSimulado.price.toFixed(2)}</span>
                  </div>
                  <button className="bg-[#2563EB] text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] italic shadow-xl shadow-blue-600/30 active:scale-95 transition-all">
                    Acessar
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Available List */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Disponíveis</h2>
            <div className="h-px flex-1 bg-white/10 mx-4" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {filteredSimulados.length === 0 ? (
              <div className="p-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest leading-loose">Nenhum simulado disponível<br />nesta categoria no momento.</p>
              </div>
            ) : (
              filteredSimulados.map((simulado) => (
                <div
                  key={simulado.id}
                  onClick={() => navigate(`/exam/${simulado.id}`)}
                  className="group bg-white/5 p-4 rounded-[2rem] border border-white/5 flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-white/[0.08]"
                >
                  <div className="size-20 shrink-0 rounded-2xl bg-[#1a1a1a] overflow-hidden border border-white/5 shadow-inner">
                    {simulado.image_url ? (
                      <img src={simulado.image_url} alt={simulado.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 italic font-black text-xl">IQ</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-base text-white mb-1 uppercase italic leading-tight truncate">{simulado.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{simulado.categories?.[0]}</span>
                      <span className="size-1 rounded-full bg-yellow-400/20" />
                      <span className="text-[9px] font-black text-yellow-400/80 uppercase tracking-widest">OFFICIAL</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-lg font-black text-white italic">R${simulado.price.toFixed(0)}</span>
                    <div className="bg-white/5 p-2 rounded-xl text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                      <ChevronRight size={16} strokeWidth={4} />
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

const MyExamsScreen = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#1a1a0d] min-h-screen">
      <header className="sticky top-0 z-50 bg-[#f2f20d]/90 backdrop-blur-xl border-b border-black/5">
        <div className="flex items-center p-4 justify-between pt-12">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold leading-tight text-black">Meus Simulados</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">IQ Simulados</p>
          </div>
          <div className="size-10 flex items-center justify-end">
            <button onClick={() => navigate('/profile')} className="rounded-full bg-black/10 p-2 text-black">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-white/5 p-12 rounded-3xl border-2 border-dashed border-white/5 text-center">
          <Rocket size={40} className="mx-auto text-yellow-400/20 mb-4" />
          <p className="text-slate-500 font-medium">Você ainda não possui simulados vinculados à sua conta.</p>
        </div>
      </main>
    </div>
  );
};

const ExamExecutionScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-md text-white p-6 pt-12 flex items-center justify-between border-b border-white/5">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg text-yellow-400">Simulado</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Modo Execução</p>
        </div>
        <div className="size-10" />
      </header>
      <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <div className="size-20 rounded-full bg-yellow-400/10 flex items-center justify-center mb-6">
          <ShieldCheck size={40} className="text-yellow-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Ambiente Protegido</h2>
        <p className="text-slate-400 max-w-xs">A interface de execução oficial está sendo carregada...</p>
      </main>
    </div>
  );
};

const MaterialsScreen = ({ onOpenMenu }: { onOpenMenu: () => void, setView: (v: any) => void }) => (
  <div className="bg-[#1a1a0d] min-h-screen flex flex-col">
    <header className="sticky top-0 z-50 bg-[#f2f20d]/90 backdrop-blur-xl border-b border-black/5">
      <div className="flex items-center p-4 justify-between pt-12">
        <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
          <Menu size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold leading-tight text-black">Materiais</h1>
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
    <div className="bg-[#1a1a0d] min-h-screen flex flex-col">
      <header className="p-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/5 text-yellow-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black uppercase italic tracking-tighter">Gabarito</h1>
      </header>
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Selecione um simulado finalizado para ver o gabarito.</p>
      </main>
    </div>
  );
};

const ProfileScreen = ({ onOpenMenu, onLogout }: { onOpenMenu: () => void, onLogout: () => void }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.app_metadata?.is_admin === true || user?.user_metadata?.is_admin === true);
    };
    checkAdmin();
  }, []);

  return (
    <div className="bg-[#1a1a0d] min-h-screen flex flex-col font-display">
      <header className="sticky top-0 z-50 bg-[#f2f20d]/90 backdrop-blur-xl border-b border-black/5">
        <div className="flex items-center p-4 justify-between pt-12 max-w-md mx-auto w-full">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold leading-tight text-black">Perfil</h1>
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
            <div className="w-32 h-32 rounded-full border-4 border-yellow-400 p-1.5 bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-2xl shadow-yellow-400/20">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button className="absolute bottom-1 right-1 bg-blue-500 text-white p-2.5 rounded-full shadow-lg border-2 border-[#1a1a0d] group-hover:scale-110 transition-transform">
              <Edit size={14} />
            </button>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-yellow-400 decoration-4 underline-offset-4">Usuário</h2>
            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-yellow-400/10 text-yellow-400 text-[10px] font-black uppercase tracking-widest border border-yellow-400/20">
              ESTUDANTE PRO
            </div>
          </div>
        </section>

        <section className="px-6 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Configurações e Pagamento</h3>
          <div className="bg-white/5 rounded-3xl overflow-hidden divide-y divide-white/5 border border-white/5 shadow-xl">
            <button onClick={() => navigate('/profile/purchases')} className="w-full flex items-center justify-between p-5 active:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-blue-500/10 text-blue-400">
                  <CreditCard size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base">Meus Cartões</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Formas de Pagamento</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600" />
            </button>

            <button className="w-full flex items-center justify-between p-5 active:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-yellow-500/10 text-yellow-500">
                  <Receipt size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base">Histórico de Pedidos</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Acessar todas as compras</span>
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
  return (
    <div className="bg-[#1a1a0d] min-h-screen flex flex-col font-display">
      <header className="sticky top-0 z-50 bg-[#f2f20d]/90 backdrop-blur-xl border-b border-black/5">
        <div className="flex items-center p-4 justify-between pt-12">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold leading-tight text-black italic uppercase">IQ ADMIN</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Gerenciamento</p>
          </div>
          <button className="size-10 flex items-center justify-end text-black">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="flex gap-4 p-6 overflow-x-auto no-scrollbar">
          {[
            { label: 'Usuários', value: '1,240', trend: '+12%', color: '#f2f20d' },
            { label: 'Simulados', value: '850', trend: '+5%', color: '#f97316' },
            { label: 'Receita', value: 'R$ 4.2k', trend: '+8%', color: '#0ea5e9' }
          ].map((stat) => (
            <div key={stat.label} className="flex min-w-[140px] flex-col gap-2 rounded-2xl p-5 bg-white/5 border border-white/5 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black italic">{stat.value}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-black">
                <BarChart3 size={10} /> {stat.trend}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-8">
          <button
            onClick={() => navigate('/admin/simulados/new')}
            className="w-full bg-[#f2f20d] hover:bg-yellow-400 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-yellow-400/20 transition-all active:scale-95 italic uppercase text-sm"
          >
            <Plus size={20} strokeWidth={3} /> Criar Novo Simulado
          </button>
        </div>

        <div className="px-6 space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Atalhos Administrativos</h2>
          {[
            { icon: FileText, label: 'Gerenciar Simulados', sub: 'Lista completa e edições rápidas', color: '#f97316', onClick: () => navigate('/admin/list') },
            { icon: Users, label: 'Usuários e Acessos', sub: 'Status de assinaturas e permissões', color: '#0ea5e9', onClick: () => navigate('/admin/users') }
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 active:scale-[0.98] transition-all group hover:bg-white/[0.08]"
            >
              <div className="flex items-center justify-center rounded-2xl text-white shrink-0 size-14 shadow-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: item.color }}>
                <item.icon size={28} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-black text-lg italic leading-tight uppercase">{item.label}</p>
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

const UserRegistrationScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#1a1a0d] min-h-screen flex flex-col font-display">
      <header className="sticky top-0 z-50 bg-yellow-400 text-black p-6 pt-12 flex items-center gap-4 shadow-xl">
        <button onClick={() => navigate('/admin')} className="flex items-center justify-center size-10 rounded-full bg-black/10">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black uppercase italic">Novo Usuário</h1>
      </header>
      <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="size-24 rounded-full bg-yellow-400/10 flex items-center justify-center mb-6">
          <Users size={48} className="text-yellow-400" />
        </div>
        <h2 className="text-2xl font-black italic uppercase">Em Construção</h2>
        <p className="text-slate-500 mt-2 max-w-xs">A interface de gerenciamento de usuários será implementada em breve.</p>
      </main>
    </div>
  );
};

const PurchaseHistoryScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#1a1a0d] min-h-screen flex flex-col font-display">
      <header className="sticky top-0 z-50 bg-[#f2f20d]/90 backdrop-blur-xl border-b border-black/5">
        <div className="flex items-center p-4 justify-between pt-12 max-w-md mx-auto w-full">
          <button onClick={() => navigate('/profile')} className="size-10 flex items-center justify-start text-black">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold leading-tight text-black uppercase italic text-center">Histórico</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Vendas e Transações</p>
          </div>
          <div className="size-10" />
        </div>
      </header>
      <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Receipt size={32} className="text-slate-500" />
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma transação encontrada.</p>
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={() => { }} />;
  }

  return (
    <Router>
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-[#1a1a0d]">
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
          <Route path="/profile/purchases" element={<PurchaseHistoryScreen />} />
          <Route path="/exam/:id" element={<ExamExecutionScreen />} />
          <Route path="/exam/:id/answer-key" element={<AnswerKeyScreen />} />

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
              <AdminSimulados onPublishSuccess={fetchSimulados} availableCategories={[]} />
            </ProtectedRoute>
          } />
          <Route path="/admin/simulados/:id" element={
            <ProtectedRoute requireAdmin>
              <AdminSimulados onPublishSuccess={fetchSimulados} availableCategories={[]} />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin>
              <UserRegistrationScreen />
            </ProtectedRoute>
          } />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
