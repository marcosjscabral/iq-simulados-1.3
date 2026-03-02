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
  ChevronLeft
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
  return (
    <div className="bg-background-light dark:bg-[#1a1a08] min-h-screen">
      <header className="sticky top-0 z-50 bg-[#f2f20d] border-b border-black/5">
        <div className="flex items-center p-4 justify-between pt-12">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start">
            <Menu size={24} className="text-black" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold leading-tight text-black">IQ Simulados</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#1a1a08] font-bold">Vitrine</p>
          </div>
          <div className="size-10 flex items-center justify-end">
            <button onClick={() => navigate('/profile')} className="rounded-full bg-black/10 p-2">
              <User className="text-black" size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Simulados em Destaque</h2>
          </div>
          <div className="space-y-4">
            {simulados.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#2a2a14] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-medium">Nenhum conteúdo disponível no momento.</p>
              </div>
            ) : (
              simulados.map((simulado) => (
                <div
                  key={simulado.id}
                  onClick={() => navigate(`/exam/${simulado.id}`)}
                  className="bg-white dark:bg-[#2a2a14] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-white/5 cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-center p-2">
                      {simulado.image_url ? (
                        <img src={simulado.image_url} alt={simulado.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">IQ Simulados</span>
                      )}
                    </div>
                    <div className="col-span-2 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-bold text-base leading-tight mb-1">{simulado.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{simulado.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#f28d0d] font-bold">R$ {simulado.price}</span>
                        <ChevronRight size={18} className="text-slate-300" />
                      </div>
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
    <div className="bg-background-light dark:bg-[#1a1a08] min-h-screen">
      <header className="sticky top-0 z-50 bg-[#f2f20d] border-b border-black/5">
        <div className="flex items-center p-4 justify-between pt-12">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start">
            <Menu size={24} className="text-black" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold leading-tight text-black">Meus Simulados</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#1a1a08] font-bold">IQ Simulados</p>
          </div>
          <div className="size-10 flex items-center justify-end">
            <button onClick={() => navigate('/profile')} className="rounded-full bg-black/10 p-2">
              <User className="text-black" size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-white dark:bg-[#2a2a14] p-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 font-medium">Você ainda não possui simulados vinculados à sua conta.</p>
        </div>
      </main>
    </div>
  );
};

const ExamExecutionScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background-light dark:bg-[#111621] min-h-screen flex flex-col font-display">
      <header className="bg-slate-900 text-white p-6 pt-12 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg">Simulado ENEM</h1>
          <p className="text-xs text-slate-400">Questão 1 de 45</p>
        </div>
        <div className="size-10" />
      </header>
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <p className="text-slate-400">Interface de execução em desenvolvimento...</p>
      </main>
    </div>
  );
};

const MaterialsScreen = ({ onOpenMenu }: { onOpenMenu: () => void, setView: (v: any) => void }) => (
  <div className="bg-background-light dark:bg-[#222210] min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
    <header className="bg-[#f2df0d] p-6 pt-12 pb-6 flex items-center gap-4">
      <button onClick={onOpenMenu} className="size-10 flex items-center justify-center bg-white/20 rounded-full text-slate-900">
        <Menu size={24} />
      </button>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Materiais de Estudo</h1>
    </header>
    <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
      <div className="size-24 rounded-3xl bg-[#f2df0d]/10 flex items-center justify-center text-[#f2df0d] mb-6">
        <Rocket size={48} />
      </div>
      <h2 className="text-xl font-bold mb-2">Em breve!</h2>
      <p className="text-slate-500 max-w-xs mx-auto">Estamos preparando apostilas, resumos e mapas mentais exclusivos para turbinar sua aprovação.</p>
    </main>
  </div>
);

const AnswerKeyScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background-light dark:bg-[#1a1a0d] min-h-screen flex flex-col">
      <header className="p-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-black/5">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Gabarito</h1>
      </header>
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
    <div className="bg-background-light dark:bg-[#1a1a0d] min-h-screen flex flex-col font-display">
      <header className="sticky top-0 z-10 bg-[#f2f20d] border-b border-black/5 px-4 py-4 pt-12">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={onOpenMenu} className="flex items-center justify-center p-2 rounded-full hover:bg-black/10 text-black">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-black">Meu Perfil</h1>
          {isAdmin ? (
            <button onClick={() => navigate('/admin')} className="flex items-center justify-center p-2 rounded-full hover:bg-black/10 text-black">
              <Settings size={24} />
            </button>
          ) : (
            <div className="size-10" />
          )}
        </div>
      </header>
      <main className="flex-1 w-full max-w-md mx-auto pb-24 overflow-y-auto">
        <section className="flex flex-col items-center py-8 px-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-[#f2f20d] p-1 bg-gradient-to-tr from-[#f2f20d] to-[#f97316]">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button className="absolute bottom-1 right-1 bg-[#0ea5e9] text-white p-2 rounded-full shadow-lg border-2 border-[#1a1a0d]">
              <Edit size={14} />
            </button>
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Usuário</h2>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#f2f20d]/20 text-[#f2f20d] text-xs font-bold uppercase tracking-wider border border-[#f2f20d]/30">
              Estudante
            </div>
          </div>
        </section>

        <section className="px-4 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 ml-2">Informações de Pagamento</h3>
          <div className="bg-white dark:bg-[#2a2a16] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
            <button onClick={() => navigate('/profile/purchases')} className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9]">
                  <CreditCard size={20} />
                </div>
                <span className="font-medium">Métodos de Pagamento</span>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </button>
          </div>
        </section>

        <section className="px-4 mt-8">
          <button
            onClick={onLogout}
            className="w-full bg-[#f97316] hover:bg-[#f97316]/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-95"
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
    <div className="bg-background-light dark:bg-[#1a1a08] min-h-screen flex flex-col font-display">
      <header className="flex items-center px-6 py-4 pt-12 justify-between sticky top-0 bg-[#f2f20d] z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onOpenMenu} className="p-1 rounded-full hover:bg-black/5 transition-colors">
            <Menu className="text-[#1a1a08]" size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1a1a08]">IQ Simulados</h1>
            <p className="text-xs text-slate-700">Painel do Administrador</p>
          </div>
        </div>
        <button className="size-10 flex items-center justify-center rounded-full bg-black/10">
          <Bell size={20} className="text-[#1a1a08]" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="flex gap-4 p-6 overflow-x-auto no-scrollbar">
          {[
            { label: 'Usuários', value: '1,240', trend: '+12%', color: '#f2f20d' },
            { label: 'Simulados', value: '850', trend: '+5%', color: '#f97316' },
            { label: 'Receita', value: 'R$ 4.2k', trend: '+8%', color: '#0ea5e9' }
          ].map((stat) => (
            <div key={stat.label} className="flex min-w-[140px] flex-col gap-2 rounded-xl p-4 bg-white dark:bg-[#2a2a12] border border-slate-100 dark:border-white/5 shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                <BarChart3 size={10} /> {stat.trend}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={() => navigate('/admin/simulados/new')}
            className="w-full bg-[#f2f20d] hover:bg-[#f2f20d]/90 text-[#1a1a08] font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#f2f20d]/10 transition-all"
          >
            <Plus size={20} /> Adicionar Novo Conteúdo
          </button>
        </div>

        <div className="px-6 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Gerenciamento</h2>
          {[
            { icon: FileText, label: 'Gerenciar Simulados', sub: 'Provas, questões e cronômetros', color: '#f97316', onClick: () => navigate('/admin/list') },
            { icon: Users, label: 'Usuários e Acessos', sub: 'Assinaturas e permissões', color: '#0ea5e9', onClick: () => navigate('/admin/users') }
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 bg-slate-50 dark:bg-[#2a2a12]/50 p-4 rounded-xl border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center justify-center rounded-lg text-white shrink-0 size-12 shadow-lg" style={{ backgroundColor: item.color }}>
                <item.icon size={24} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-base">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
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
    <div className="bg-background-light dark:bg-[#111621] min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
      <header className="bg-[#fbbf24] px-4 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="flex items-center justify-center size-10 rounded-full bg-white/20 text-slate-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Novo Usuário</h1>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <p className="text-slate-500">Formulário de cadastro em desenvolvimento...</p>
      </main>
    </div>
  );
};

const PurchaseHistoryScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background-light dark:bg-[#222110] min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
      <header className="bg-[#f2df0d] p-6 pt-12 pb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="flex items-center justify-center bg-white/20 rounded-full p-2">
            <ChevronLeft size={24} className="text-slate-900" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Histórico de Compras</h1>
        </div>
      </header>
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
