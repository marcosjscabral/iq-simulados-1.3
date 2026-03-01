import React, { useState } from 'react';
import {
  Home as HomeIcon,
  ShoppingBag,
  GraduationCap,
  User,
  Search,
  Menu,
  Bell,
  ArrowLeft,
  Timer,
  ChevronLeft,
  ChevronRight,
  Play,
  Rocket,
  CheckCircle2,
  MoreVertical,
  Plus,
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  Receipt,
  Edit,
  FolderOpen,
  Download,
  ExternalLink,
  Lightbulb,
  History,
  ArrowRight,
  ShieldCheck,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { View, Simulado, UserSimulado, Question } from './types';
import {
  CATEGORIES,
  FEATURED_SIMULADO,
  AVAILABLE_SIMULADOS,
  USER_SIMULADOS,
  MOCK_QUESTION
} from './constants';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import AdminSimulados from './pages/AdminSimulados';
import AdminListSimulados from './pages/AdminListSimulados';

// --- Screens ---

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-[#f2f20d] flex flex-col font-display">
    <div className="h-11 w-full bg-[#f2f20d]"></div>
    <div className="flex flex-col items-center justify-center pt-12 pb-8 px-6">
      <div className="w-24 h-24 bg-[#222210] rounded-xl flex items-center justify-center shadow-xl mb-6">
        <GraduationCap className="text-[#f2f20d]" size={60} />
      </div>
      <h1 className="text-[#222210] text-3xl font-bold tracking-tight">IQ Simulados</h1>
      <p className="text-[#222210]/80 text-sm font-medium mt-1">Sua evolução começa aqui</p>
    </div>
    <div className="flex-1 bg-[#222210] rounded-t-[2.5rem] px-8 pt-12 pb-10 shadow-2xl">
      <h2 className="text-slate-100 text-2xl font-bold mb-2">Bem-vindo!</h2>
      <p className="text-slate-400 text-base mb-8">Faça login para continuar seus estudos</p>
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">E-mail</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              className="w-full h-14 pl-12 pr-4 bg-[#222210] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-600 focus:border-[#f2f20d] focus:ring-1 focus:ring-[#f2f20d] outline-none transition-all"
              placeholder="seu@email.com"
              type="email"
            />
          </div>
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">Senha</label>
          <div className="relative">
            <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              className="w-full h-14 pl-12 pr-12 bg-[#222210] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-600 focus:border-[#f2f20d] focus:ring-1 focus:ring-[#f2f20d] outline-none transition-all"
              placeholder="••••••••"
              type="password"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="button" className="text-[#fd7e14] text-sm font-semibold hover:opacity-80">Esqueceu a senha?</button>
        </div>
        <button
          type="submit"
          className="w-full h-14 bg-[#0d6efd] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#0d6efd]/20 active:scale-[0.98] transition-transform"
        >
          Entrar na Conta
        </button>
      </form>
      <div className="flex items-center my-8">
        <div className="flex-1 h-px bg-slate-800"></div>
        <span className="px-4 text-slate-500 text-sm">ou continue com</span>
        <div className="flex-1 h-px bg-slate-800"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center h-12 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
          <span className="text-slate-300 font-bold">GOOGLE</span>
        </button>
        <button className="flex items-center justify-center h-12 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
          <span className="text-slate-300 font-bold">APPLE</span>
        </button>
      </div>
      <p className="mt-10 text-center text-slate-400">
        Ainda não tem conta?
        <button className="text-[#fd7e14] font-bold ml-1 hover:underline">Criar conta</button>
      </p>
    </div>
  </div>
);

const HomeScreen = ({
  onOpenMenu,
  setView,
  simulados
}: {
  onOpenMenu: () => void,
  setView: (v: View) => void,
  simulados: Simulado[]
}) => {
  const featured = simulados.find(s => s.is_featured && s.is_active) || FEATURED_SIMULADO;
  const available = simulados.filter(s => s.is_active && !s.is_featured);
  const displayList = available.length > 0 ? available : AVAILABLE_SIMULADOS;

  return (
    <div className="bg-background-light dark:bg-[#1a1a0d] min-h-screen">
      <header className="sticky top-0 z-50 bg-[#f2f20d] px-4 pt-12 pb-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onOpenMenu} className="p-1 rounded-full hover:bg-black/5 transition-colors">
            <Menu className="text-[#1a1a0d]" size={24} />
          </button>
          <h1 className="text-[#1a1a0d] text-xl font-bold tracking-tight">IQ Simulados</h1>
        </div>
        <div className="flex items-center gap-3">
          <Search className="text-[#1a1a0d]" size={24} />
          <button onClick={() => setView('profile')} className="size-8 rounded-full bg-[#1a1a0d]/10 flex items-center justify-center">
            <User className="text-[#1a1a0d]" size={20} />
          </button>
        </div>
      </header>

      <div className="bg-[#f2f20d]/10 dark:bg-[#2a2a14]/50 py-4">
        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              className={`flex h-10 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition-colors ${i === 0 ? 'bg-[#f2f20d] text-[#1a1a0d]' : 'bg-white/20 dark:bg-[#2a2a14] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-[#f97316]">🔥</span> Destaques da Semana
          </h2>
          <div className="relative overflow-hidden rounded-xl bg-[#f97316] p-1">
            <div className="bg-white dark:bg-[#2a2a14] rounded-lg overflow-hidden flex flex-col">
              <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 relative">
                <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-3 left-3 bg-[#f97316] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Mais Procurado
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg leading-tight">{featured.title}</h3>
                  <span className="text-[#2563eb] font-bold">R$ {featured.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{featured.description}</p>
                <button className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <ShoppingBag size={18} /> Comprar Agora
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold mb-4">Simulados Disponíveis</h2>
          {displayList.map(sim => (
            <div key={sim.id} className="bg-white dark:bg-[#2a2a14] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4">
              <div className="size-20 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <img src={sim.image_url} alt={sim.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm leading-tight line-clamp-2">{sim.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{sim.questions_count} Questões Objetivas</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-[#2563eb] text-sm">R$ {sim.price.toFixed(2)}</span>
                  <button className="bg-[#2563eb] text-white px-3 py-1.5 rounded-lg text-xs font-bold">Comprar</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

const MyExamsScreen = ({ onOpenMenu, setView }: { onOpenMenu: () => void, setView: (v: View) => void }) => (
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
          <button onClick={() => setView('profile')} className="rounded-full bg-black/10 p-2">
            <User className="text-black" size={20} />
          </button>
        </div>
      </div>
      <div className="px-4">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {['Todos', 'Em andamento', 'Finalizados', 'Favoritos'].map((tab, i) => (
            <button
              key={tab}
              className={`flex flex-col items-center justify-center pb-3 pt-2 shrink-0 border-b-2 transition-colors ${i === 0 ? 'border-[#f2f20d] text-slate-900 dark:text-slate-100' : 'border-transparent text-slate-500 dark:text-slate-400'
                }`}
            >
              <p className={`text-sm ${i === 0 ? 'font-bold' : 'font-medium'}`}>{tab}</p>
            </button>
          ))}
        </div>
      </div>
    </header>

    <main className="p-4 space-y-4">
      {USER_SIMULADOS.map((sim) => (
        <div key={sim.id} className={`flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#2a2a0e] shadow-sm border border-slate-200 dark:border-slate-800 ${sim.status === 'finished' ? 'opacity-80' : ''}`}>
          {sim.status !== 'finished' && (
            <div className="relative w-full aspect-[21/9] bg-slate-200 dark:bg-slate-800">
              <img src={sim.image_url} alt={sim.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm ${sim.status === 'in-progress' ? 'bg-[#f97316]' : 'bg-[#f2f20d] text-[#1a1a08]'}`}>
                {sim.status === 'in-progress' ? 'EM ALTA' : 'NOVO'}
              </div>
            </div>
          )}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#f2f20d] text-[10px] font-bold uppercase tracking-wider mb-1">{sim.categories[0]}</p>
                <h3 className="text-lg font-bold leading-tight">{sim.title}</h3>
              </div>
              {sim.status === 'finished' && (
                <div className="bg-green-500/10 text-green-500 p-1 rounded-full">
                  <CheckCircle2 size={18} fill="currentColor" />
                </div>
              )}
            </div>

            {sim.status === 'finished' ? (
              <div className="flex items-center gap-4 py-2 border-y border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Acertos</span>
                  <span className="font-bold text-green-500">{sim.score}%</span>
                </div>
                <div className="w-px h-6 bg-slate-100 dark:bg-slate-800"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Tempo</span>
                  <span className="font-bold">{sim.timeTaken}</span>
                </div>
                <div className="w-px h-6 bg-slate-100 dark:bg-slate-800"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Rank</span>
                  <span className="font-bold text-[#f97316]">{sim.rank}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                  <FileText size={14} />
                  <span>{sim.questions_count} questões • Edital 2024</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Progresso</span>
                    <span>{sim.progress}% ({Math.round(sim.progress * sim.questions_count / 100)}/{sim.questions_count})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#f2f20d]" style={{ width: `${sim.progress}%` }}></div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setView('exam-execution')}
                className="flex-1 bg-[#0284c7] hover:bg-[#0284c7]/90 text-white h-11 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {sim.status === 'in-progress' ? <Play size={18} /> : (sim.status === 'finished' ? <BarChart3 size={18} /> : <Rocket size={18} />)}
                {sim.status === 'in-progress' ? 'Continuar' : (sim.status === 'finished' ? 'Ver Desempenho' : 'Iniciar Simulado')}
              </button>
              <button className="w-11 h-11 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </main>
  </div>
);

const ExamExecutionScreen = ({ setView }: { setView: (v: View) => void }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className="bg-background-light dark:bg-[#1a1a0a] min-h-screen flex flex-col font-display">
      <header className="bg-[#f2f20d] text-slate-900 pt-12 pb-4 px-4 shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setView('my-exams')} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-bold uppercase tracking-wider opacity-70">IQ Simulados</h1>
            <h2 className="text-lg font-bold leading-tight">Simulado PRF - 2024</h2>
          </div>
          <div className="flex items-center gap-1 bg-black/10 px-3 py-1 rounded-full">
            <Timer size={14} />
            <span className="text-sm font-bold tabular-nums">01:45:22</span>
          </div>
        </div>
        <div className="space-y-2 px-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold uppercase">Progresso Geral</span>
            <span className="text-xs font-bold">45 / 120</span>
          </div>
          <div className="w-full bg-black/10 h-2.5 rounded-full overflow-hidden">
            <div className="bg-slate-900 h-full rounded-full" style={{ width: '37.5%' }}></div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#3b82f6]/10 text-[#3b82f6] text-xs font-bold px-3 py-1 rounded-full border border-[#3b82f6]/20">QUESTÃO 45</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{MOCK_QUESTION.subject}</span>
          </div>
          <h3 className="text-lg font-semibold leading-relaxed mb-6 dark:text-slate-100 whitespace-pre-line">
            {MOCK_QUESTION.text}
          </h3>
          <div className="space-y-4">
            {MOCK_QUESTION.options.map((opt) => (
              <label
                key={opt.id}
                className={`relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedOption === opt.id
                  ? 'border-[#f2f20d] bg-[#f2f20d]/5'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5'
                  }`}
              >
                <input
                  type="radio"
                  name="question"
                  className="hidden"
                  onChange={() => setSelectedOption(opt.id)}
                  checked={selectedOption === opt.id}
                />
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${selectedOption === opt.id ? 'border-[#f2f20d]' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                  {selectedOption === opt.id && <div className="w-3 h-3 rounded-full bg-[#f2f20d]"></div>}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5">Alternativa {opt.label}</span>
                  <p className="text-sm font-medium leading-normal">{opt.text}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#f2f20d] transition-colors">
              <Edit size={18} /> Adicionar anotação
            </button>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1a1a0a]/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 pb-8">
        <div className="max-w-md mx-auto grid grid-cols-12 gap-3">
          <button className="col-span-3 h-12 flex items-center justify-center rounded-xl bg-[#f97316] text-white font-bold shadow-lg shadow-[#f97316]/20 active:scale-95 transition-transform">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setView('my-exams')} className="col-span-4 h-12 flex items-center justify-center rounded-xl border-2 border-[#3b82f6] text-[#3b82f6] font-bold active:scale-95 transition-transform">
            Sair
          </button>
          <button
            onClick={() => setView('answer-key')}
            className="col-span-5 h-12 flex items-center justify-center rounded-xl bg-[#3b82f6] text-white font-bold shadow-lg shadow-[#3b82f6]/20 active:scale-95 transition-transform"
          >
            Responder
          </button>
        </div>
      </footer>
    </div>
  );
};

const ProfileScreen = ({ onOpenMenu, setView, onLogout }: { onOpenMenu: () => void, setView: (v: View) => void, onLogout: () => void }) => (
  <div className="bg-background-light dark:bg-[#1a1a0d] min-h-screen flex flex-col font-display">
    <header className="sticky top-0 z-10 bg-[#f2f20d] border-b border-black/5 px-4 py-4 pt-12">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button onClick={onOpenMenu} className="flex items-center justify-center p-2 rounded-full hover:bg-black/10 text-black">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-black">Meu Perfil</h1>
        <button onClick={() => setView('admin-dashboard')} className="flex items-center justify-center p-2 rounded-full hover:bg-black/10 text-black">
          <Settings size={24} />
        </button>
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
          <h2 className="text-2xl font-bold tracking-tight">Ricardo Oliveira</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">ricardo.oliveira@exemplo.com.br</p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#f2f20d]/20 text-[#f2f20d] text-xs font-bold uppercase tracking-wider border border-[#f2f20d]/30">
            Plano Premium
          </div>
        </div>
      </section>

      <section className="px-4 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 ml-2">Informações Pessoais</h3>
        <div className="bg-white dark:bg-[#2a2a16] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
          <button className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9]">
                <User size={20} />
              </div>
              <span className="font-medium">Dados Cadastrais</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9]">
                <ShieldCheck size={20} />
              </div>
              <span className="font-medium">Segurança e Senha</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      </section>

      <section className="px-4 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 ml-2">Informações de Pagamento</h3>
        <div className="bg-white dark:bg-[#2a2a16] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
          <button onClick={() => setView('purchase-history')} className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9]">
                <CreditCard size={20} />
              </div>
              <span className="font-medium">Métodos de Pagamento</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9]">
                <Receipt size={20} />
              </div>
              <span className="font-medium">Notas Fiscais</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      </section>

      <section className="px-4 mt-8">
        <button
          onClick={onLogout}
          className="w-full bg-[#f97316] hover:bg-[#f97316]/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <LogOut size={20} /> Sair da Conta
        </button>
        <p className="text-center text-slate-400 text-xs mt-6">IQ Simulados v2.4.0</p>
      </section>
    </main>
  </div>
);

const AdminDashboardScreen = ({ onOpenMenu, setView, onAddNew }: { onOpenMenu: () => void, setView: (v: View) => void, onAddNew: () => void }) => (
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
          onClick={onAddNew}
          className="w-full bg-[#f2f20d] hover:bg-[#f2f20d]/90 text-[#1a1a08] font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#f2f20d]/10 transition-all"
        >
          <Plus size={20} /> Adicionar Novo Conteúdo
        </button>
      </div>

      <div className="px-6 space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Gerenciamento</h2>
        {[
          { icon: FileText, label: 'Gerenciar Simulados', sub: 'Provas, questões e cronômetros', color: '#f97316', onClick: () => setView('admin-list-simulados') },
          { icon: Users, label: 'Usuários e Acessos', sub: 'Assinaturas e permissões', color: '#0ea5e9', onClick: () => setView('user-registration') },
          { icon: Rocket, label: 'Recomendações AI', sub: 'Destaques personalizados por aluno', color: '#f97316' }
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

const MaterialsScreen = ({ onOpenMenu, setView }: { onOpenMenu: () => void, setView: (v: View) => void }) => (
  <div className="bg-background-light dark:bg-[#222210] min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
    <header className="bg-[#f2f20d] px-4 py-4 sticky top-0 z-10 shadow-md pt-12">
      <div className="flex items-center justify-between">
        <button onClick={onOpenMenu} className="flex size-10 items-center justify-center rounded-full bg-black/10">
          <Menu size={24} className="text-[#222210]" />
        </button>
        <h1 className="text-lg font-bold text-[#222210] tracking-tight">Materiais</h1>
        <button className="flex size-10 items-center justify-center rounded-full bg-black/10">
          <Search size={24} className="text-[#222210]" />
        </button>
      </div>
    </header>
    <main className="flex-1 px-4 py-6 space-y-8 pb-24">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Play size={20} className="text-[#f97316]" /> Canais do Youtube
          </h2>
          <span className="text-xs font-medium text-[#f2f20d] uppercase tracking-wider">Ver todos</span>
        </div>
        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-[#1a1a08]/40 border border-[#f2f20d]/10 p-4 shadow-lg">
          <div className="flex flex-[2_2_0px] flex-col justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-white text-base font-bold leading-tight">IQ Simulados Oficial</p>
              <p className="text-slate-400 text-sm font-normal">Aulas ao vivo e dicas de estudo diárias para concursos.</p>
            </div>
            <button className="mt-4 flex items-center justify-center rounded-lg h-9 px-4 bg-[#f97316] text-white gap-2 text-sm font-bold w-fit">
              <Play size={16} fill="currentColor" /> Assistir
            </button>
          </div>
          <div className="w-32 h-24 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200" alt="Youtube" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ExternalLink size={20} className="text-[#3b82f6]" /> Links Rápidos
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a1a08]/40 border border-[#f2f20d]/10 p-4 rounded-xl flex flex-col items-center text-center gap-3">
            <div className="size-12 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
              <GraduationCap size={24} className="text-[#3b82f6]" />
            </div>
            <div>
              <p className="font-bold text-sm">Cursos IQ</p>
              <p className="text-xs text-slate-400">Acesse sua área</p>
            </div>
          </div>
          <div className="bg-[#1a1a08]/40 border border-[#f2f20d]/10 p-4 rounded-xl flex flex-col items-center text-center gap-3">
            <div className="size-12 rounded-full bg-[#f97316]/20 flex items-center justify-center">
              <HomeIcon size={24} className="text-[#f97316]" />
            </div>
            <div>
              <p className="font-bold text-sm">Páginas Web</p>
              <p className="text-xs text-slate-400">Links úteis</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText size={20} className="text-[#f2f20d]" /> Materiais PDF
        </h2>
        <div className="space-y-3">
          {[
            { title: 'Cronograma de Estudos 2024', sub: 'Google Drive • 2.4 MB', icon: FileText, color: 'text-red-500' },
            { title: 'Pasta: Mapas Mentais', sub: 'Google Drive • 15 arquivos', icon: FolderOpen, color: 'text-[#3b82f6]' },
            { title: 'Simulado Comentado #12', sub: 'Google Drive • 1.1 MB', icon: FileText, color: 'text-red-500' }
          ].map((file) => (
            <div key={file.title} className="flex items-center gap-4 bg-[#1a1a08]/40 border border-[#f2f20d]/10 p-4 rounded-xl">
              <div className={`size-10 flex items-center justify-center rounded-lg bg-white/5`}>
                <file.icon size={20} className={file.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{file.title}</p>
                <p className="text-xs text-slate-400">{file.sub}</p>
              </div>
              <Download size={20} className="text-slate-500" />
            </div>
          ))}
        </div>
      </section>
    </main>
  </div>
);

const AnswerKeyScreen = ({ setView }: { setView: (v: View) => void }) => (
  <div className="bg-background-light dark:bg-[#111621] min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
    <header className="bg-[#FFD700] p-4 pt-12 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setView('exam-execution')} className="flex items-center text-[#1754cf]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Questão 15</h1>
        <div className="w-8"></div>
      </div>
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-4 py-1 text-sm font-bold text-[#2E7D32] border border-[#2E7D32]/20">
          <CheckCircle2 size={14} /> VOCÊ ACERTOU
        </span>
      </div>
    </header>
    <main className="flex flex-col gap-4 p-4 pb-32">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-base font-medium leading-relaxed">
          Qual é a principal função da membrana plasmática nas células eucarióticas, considerando o modelo do mosaico fluido?
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 opacity-70">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 text-xs font-bold">A</div>
          <p className="text-sm font-medium">Produção de energia (ATP) via oxidação celular.</p>
        </div>
        <div className="flex items-center gap-4 rounded-xl border-2 border-[#2E7D32] bg-[#E8F5E9] p-4 shadow-sm">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2E7D32] text-white text-xs font-bold">B</div>
          <div className="flex grow flex-col">
            <p className="text-sm font-bold text-[#2E7D32]">Permeabilidade seletiva e controle de trocas.</p>
            <p className="text-xs font-medium text-[#2E7D32]/80 italic">Sua resposta • Correta</p>
          </div>
          <CheckCircle2 size={20} className="text-[#2E7D32]" />
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 opacity-70">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 text-xs font-bold">C</div>
          <p className="text-sm font-medium">Síntese de proteínas nos ribossomos aderidos.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-xl border-2 border-[#1754cf]/30 bg-white dark:bg-slate-800 p-5 shadow-lg">
        <div className="flex items-center gap-2 text-[#1754cf]">
          <GraduationCap size={20} />
          <h3 className="text-base font-bold uppercase tracking-wider">Comentário do Professor</h3>
        </div>
        <div className="h-px w-full bg-[#1754cf]/10"></div>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A membrana plasmática é uma estrutura fundamental que delimita a célula e controla o que entra e o que sai, propriedade conhecida como <strong>permeabilidade seletiva</strong>.
        </p>
        <div className="mt-2 rounded-lg bg-[#1754cf]/5 p-3 flex items-start gap-3">
          <Lightbulb size={18} className="text-[#1754cf] mt-0.5" />
          <p className="text-xs text-[#1754cf] font-medium italic">Dica: Lembre-se que o colesterol regula a fluidez da membrana em células animais.</p>
        </div>
      </div>
    </main>
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 pb-8">
      <div className="flex gap-3 max-w-lg mx-auto">
        <button onClick={() => setView('exam-execution')} className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#1754cf] py-3 text-sm font-bold text-[#1754cf] active:bg-[#1754cf]/5">
          <History size={18} /> Voltar para Questão
        </button>
        <button onClick={() => setView('my-exams')} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1754cf] py-3 text-sm font-bold text-white shadow-md active:bg-[#1754cf]/90">
          Próxima Questão <ArrowRight size={18} />
        </button>
      </div>
    </footer>
  </div>
);

const UserRegistrationScreen = ({ setView }: { setView: (v: View) => void }) => (
  <div className="bg-background-light dark:bg-[#111621] min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
    <header className="bg-[#fbbf24] px-4 pt-12 pb-6 flex items-center gap-4">
      <button onClick={() => setView('admin-dashboard')} className="flex items-center justify-center size-10 rounded-full bg-white/20 text-slate-900">
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">Novo Usuário</h1>
    </header>
    <main className="flex-1 overflow-y-auto pb-24">
      <section className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="text-[#1754cf]" size={20} />
          <h2 className="text-lg font-bold leading-tight tracking-tight">Dados Pessoais</h2>
        </div>
        <div className="space-y-4">
          {['Nome Completo', 'E-mail', 'Senha Provisória'].map((label) => (
            <label key={label} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{label}</span>
              <input
                className="w-full h-14 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1754cf] focus:border-[#1754cf] transition-all outline-none"
                placeholder={`Digite o ${label.toLowerCase()}`}
                type={label.includes('Senha') ? 'password' : 'text'}
              />
            </label>
          ))}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Perfil de Acesso</span>
            <select className="w-full h-14 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1754cf] focus:border-[#1754cf] transition-all outline-none">
              <option value="aluno">Aluno</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
        </div>
      </section>
      <hr className="mx-4 border-slate-200 dark:border-slate-800" />
      <section className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="text-[#1754cf]" size={20} />
          <h2 className="text-lg font-bold leading-tight tracking-tight">Acesso a Simulados</h2>
        </div>
        <div className="space-y-3">
          {['Combo OAB 1ª Fase', 'Residência Médica 2024', 'Concursos Federais'].map((sim) => (
            <label key={sim} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <input type="checkbox" className="size-5 rounded border-slate-300 text-[#1754cf] focus:ring-[#1754cf]" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{sim}</span>
                <span className="text-xs text-slate-500">Acesso aos simulados base</span>
              </div>
            </label>
          ))}
        </div>
      </section>
      <section className="p-4 space-y-3">
        <button onClick={() => setView('admin-dashboard')} className="w-full h-14 bg-[#1754cf] text-white font-bold rounded-xl shadow-lg shadow-[#1754cf]/20 active:scale-[0.98] transition-transform">
          Cadastrar Usuário
        </button>
        <button onClick={() => setView('admin-dashboard')} className="w-full h-14 border-2 border-[#f97316] text-[#f97316] font-bold rounded-xl active:scale-[0.98] transition-transform">
          Cancelar
        </button>
      </section>
    </main>
  </div>
);

const PurchaseHistoryScreen = ({ setView }: { setView: (v: View) => void }) => (
  <div className="bg-background-light dark:bg-[#222110] min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
    <header className="bg-[#f2df0d] p-6 pt-12 pb-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('profile')} className="flex items-center justify-center bg-white/20 rounded-full p-2">
          <ChevronLeft size={24} className="text-slate-900" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Histórico de Compras</h1>
      </div>
      <p className="text-slate-800 font-medium text-sm">Acompanhe suas transações e planos ativos</p>
    </header>
    <nav className="bg-white dark:bg-[#222110] border-b border-slate-200 dark:border-slate-700 flex">
      <button className="flex-1 py-4 text-center border-b-4 border-[#0d6ef2] text-[#0d6ef2] font-bold text-sm">ATIVAS</button>
      <button className="flex-1 py-4 text-center border-b-4 border-transparent text-slate-500 dark:text-slate-400 font-bold text-sm">INATIVAS</button>
    </nav>
    <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
      {[
        { title: 'Simulado ENEM Premium 2024', date: '12 Out 2023', price: '89,90', status: 'Aprovado' },
        { title: 'Curso Matemática do Zero', date: '05 Set 2023', price: '149,00', status: 'Aprovado' }
      ].map((item) => (
        <div key={item.title} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comprado em: {item.date}</p>
            </div>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{item.status}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase font-semibold">Valor</span>
              <span className="text-[#0d6ef2] font-bold text-xl">R$ {item.price}</span>
            </div>
            <button className="flex items-center gap-1 text-[#f28d0d] font-bold text-sm hover:opacity-80">
              <span>Ver Detalhes</span> <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ))}
      <div className="relative overflow-hidden rounded-xl bg-[#0d6ef2] p-4 text-white">
        <div className="relative z-10 flex flex-col gap-2">
          <h4 className="font-bold">Upgrade disponível!</h4>
          <p className="text-xs opacity-90">Adquira o plano vitalício e economize 40% em todos os simulados.</p>
          <button className="mt-2 w-fit bg-white text-[#0d6ef2] px-4 py-2 rounded-lg text-xs font-bold uppercase">Saiba Mais</button>
        </div>
        <CreditCard size={80} className="absolute -right-4 -bottom-4 opacity-20" />
      </div>
    </main>

  </div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [selectedSimuladoId, setSelectedSimuladoId] = useState<string>('');

  const fetchSimulados = async () => {
    try {
      const { data, error } = await supabase
        .from('simulados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSimulados(data || []);
    } catch (error) {
      console.error('Error fetching simulados:', error);
    }
  };

  React.useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchSimulados();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={view}
        setView={setView}
        onLogout={handleLogout}
      />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomeScreen onOpenMenu={() => setSidebarOpen(true)} setView={setView} simulados={simulados} />
          </motion.div>
        )}

        {view === 'my-exams' && (
          <motion.div
            key="my-exams"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MyExamsScreen onOpenMenu={() => setSidebarOpen(true)} setView={setView} />
          </motion.div>
        )}

        {view === 'materials' && (
          <motion.div
            key="materials"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MaterialsScreen onOpenMenu={() => setSidebarOpen(true)} setView={setView} />
          </motion.div>
        )}

        {view === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ProfileScreen onOpenMenu={() => setSidebarOpen(true)} setView={setView} onLogout={handleLogout} />
          </motion.div>
        )}

        {view === 'exam-execution' && (
          <motion.div
            key="exam-execution"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <ExamExecutionScreen setView={setView} />
          </motion.div>
        )}

        {view === 'answer-key' && (
          <motion.div
            key="answer-key"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AnswerKeyScreen setView={setView} />
          </motion.div>
        )}

        {view === 'purchase-history' && (
          <motion.div
            key="purchase-history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PurchaseHistoryScreen setView={setView} />
          </motion.div>
        )}

        {view === 'admin-dashboard' && (
          <motion.div
            key="admin-dashboard"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <AdminDashboardScreen
              onOpenMenu={() => setSidebarOpen(true)}
              setView={setView}
              onAddNew={() => {
                setSelectedSimuladoId('');
                setView('admin-simulados');
              }}
            />
          </motion.div>
        )}

        {view === 'user-registration' && (
          <motion.div
            key="user-registration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <UserRegistrationScreen setView={setView} />
          </motion.div>
        )}

        {view === 'admin-simulados' && (
          <motion.div
            key="admin-simulados"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AdminSimulados setView={setView} onPublishSuccess={fetchSimulados} simuladoId={selectedSimuladoId} />
          </motion.div>
        )}

        {view === 'admin-list-simulados' && (
          <motion.div
            key="admin-list-simulados"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AdminListSimulados
              setView={setView}
              onEditSimulado={(id) => {
                setSelectedSimuladoId(id);
                setView('admin-simulados');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
