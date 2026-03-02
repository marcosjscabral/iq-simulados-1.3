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
  TrendingUp,
  Flame,
  ShoppingCart
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

// --- Utils ---
const formatPrice = (price: number) => {
  return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

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
    <div className="bg-[#181a17] min-h-screen pb-24 text-white font-sans selection:bg-[#f3ec05] selection:text-black">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#f3ec05] shadow-md">
        <div className="flex items-center px-4 py-3 justify-between">
          <div className="flex items-center gap-3 text-black">
            <button onClick={onOpenMenu} className="p-1 active:scale-95 transition-transform">
              <Menu size={26} strokeWidth={2.5} />
            </button>
            <h1 className="text-[22px] font-black tracking-tight text-black leading-none">IQ Simulados</h1>
          </div>
          <div className="flex items-center gap-4 text-black">
            <button className="p-1 active:scale-95 transition-transform"><Search size={22} strokeWidth={2.5} /></button>
            <button onClick={() => navigate('/profile')} className="p-1.5 rounded-full border border-black/30 active:scale-95 transition-transform">
              <User size={18} strokeWidth={2.5} />
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
        {featuredSimulado && (
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
                  <h3 className="text-xl font-black text-white leading-tight">{featuredSimulado.title}</h3>
                  <div className="flex flex-col items-end shrink-0 pt-1">
                    <span className="text-[13px] font-black text-[#2c73eb] mb-[-4px]">R$</span>
                    <span className="text-[22px] font-black text-[#2c73eb] leading-none">{formatPrice(featuredSimulado.price)}</span>
                  </div>
                </div>

                <p className="text-[14px] text-[#7aa2a9] font-medium leading-snug pr-2 line-clamp-3">
                  {featuredSimulado.description || 'Descrição não informada.'}
                </p>

                <button className="w-full mt-1 bg-[#2c73eb] text-white py-3.5 rounded-xl text-[15px] font-black flex items-center justify-center gap-2.5 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                  <ShoppingCart size={18} strokeWidth={2.5} /> Comprar Agora
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
                      <button className="bg-[#2c73eb] text-white px-5 py-2 rounded-xl text-[13px] font-black hover:bg-blue-600 transition-colors shadow-md">
                        Comprar
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

const MyExamsScreen = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0f172a] min-h-screen text-white">
      <header className="sticky top-0 z-50 bg-[#f2f20d] rounded-b-[2.5rem] shadow-2xl">
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
        <div className="bg-white/5 p-12 rounded-[2.5rem] border-2 border-dashed border-white/5 text-center">
          <Rocket size={40} className="mx-auto text-yellow-400/40 mb-4" />
          <p className="text-slate-500 font-medium">Você ainda não possui simulados vinculados à sua conta.</p>
        </div>
      </main>
    </div>
  );
};

const ExamExecutionScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col text-white">
      <header className="sticky top-0 z-50 bg-[#f2f20d] text-black p-6 pt-12 flex items-center justify-between rounded-b-[2.5rem] shadow-2xl">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-black/10">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg uppercase italic">Simulado</h1>
          <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Modo Execução</p>
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
  <div className="bg-[#0f172a] min-h-screen flex flex-col text-white">
    <header className="sticky top-0 z-50 bg-[#f2f20d] rounded-b-[2.5rem] shadow-2xl">
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
    <div className="bg-[#0f172a] min-h-screen flex flex-col text-white">
      <header className="p-6 pt-12 flex items-center gap-4 bg-[#f2f20d] rounded-b-[2.5rem] shadow-2xl">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-black/5 text-black">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black uppercase italic tracking-tighter text-black">Gabarito</h1>
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
    <div className="bg-[#0f172a] min-h-screen flex flex-col font-display text-white">
      <header className="sticky top-0 z-50 bg-[#f2f20d] rounded-b-[2.5rem] shadow-2xl">
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
            <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
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
          <div className="bg-white/5 rounded-3xl overflow-hidden divide-y divide-white/5 border border-white/5 shadow-sm">
            <button onClick={() => navigate('/profile/purchases')} className="w-full flex items-center justify-between p-5 active:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-blue-600/10 text-blue-400">
                  <CreditCard size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base text-white">Meus Cartões</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Formas de Pagamento</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600" />
            </button>

            <button className="w-full flex items-center justify-between p-5 active:bg-white/10 transition-colors">
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
    <div className="bg-[#0f172a] min-h-screen flex flex-col font-display text-white">
      <header className="sticky top-0 z-50 bg-[#ffd700] rounded-b-[2.5rem] shadow-2xl">
        <div className="flex items-center p-6 pt-12 justify-between">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-black">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-black italic uppercase italic tracking-tighter">IQ ADMIN</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Gerenciamento</p>
          </div>
          <button className="size-10 flex items-center justify-end text-black">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 pt-8">
        <div className="flex gap-4 p-6 overflow-x-auto no-scrollbar">
          {[
            { label: 'Usuários', value: '1.240', trend: '+12%', color: '#ffd700' },
            { label: 'Simulados', value: '850', trend: '+5%', color: '#f97316' },
            { label: 'Receita', value: 'R$ 4.2k', trend: '+8%', color: '#3b82f6' }
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

        <div className="px-6 pb-10">
          <button
            onClick={() => navigate('/admin/simulados/new')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 italic uppercase text-sm"
          >
            <Plus size={20} strokeWidth={4} /> Criar Novo Simulado
          </button>
        </div>

        <div className="px-6 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 px-2">Atalhos Administrativos</h2>
          {[
            { icon: FileText, label: 'Gerenciar Simulados', sub: 'Lista completa e edições rápidas', color: '#f97316', onClick: () => navigate('/admin/list') },
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

const UserRegistrationScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col font-display text-white">
      <header className="sticky top-0 z-50 bg-[#ffd700] text-black p-6 pt-12 flex items-center gap-4 rounded-b-[2.5rem] shadow-2xl">
        <button onClick={() => navigate('/admin')} className="flex items-center justify-center size-10 rounded-full bg-black/10">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black uppercase italic tracking-tighter">Novo Usuário</h1>
      </header>
      <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="size-24 rounded-[2rem] bg-yellow-400/10 flex items-center justify-center mb-6 border border-yellow-400/20">
          <Users size={48} className="text-yellow-400" />
        </div>
        <h2 className="text-2xl font-black italic uppercase italic tracking-tighter">Em Construção</h2>
        <p className="text-slate-500 mt-2 max-w-xs font-bold uppercase text-[10px] tracking-widest leading-loose">A interface de gerenciamento de usuários será implementada em breve.</p>
      </main>
    </div>
  );
};

const PurchaseHistoryScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col font-display text-white">
      <header className="sticky top-0 z-50 bg-[#ffd700] rounded-b-[2.5rem] shadow-2xl">
        <div className="flex items-center p-6 pt-12 justify-between max-w-md mx-auto w-full">
          <button onClick={() => navigate('/profile')} className="size-10 flex items-center justify-start text-black">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-black leading-tight text-black uppercase italic tracking-tighter text-center">Histórico</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Vendas e Transações</p>
          </div>
          <div className="size-10" />
        </div>
      </header>
      <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="size-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
          <Receipt size={32} className="text-slate-700" />
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-loose">Nenhuma transação encontrada.</p>
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#f2f20d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={() => { }} />;
  }

  return (
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
