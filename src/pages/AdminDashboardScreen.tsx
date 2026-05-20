import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, 
  BarChart3, 
  FileText, 
  Ticket, 
  List, 
  Users, 
  ChevronRight, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  ArrowUpRight, 
  DollarSign, 
  Calendar,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { StripeService } from '../lib/stripeService';

interface AdminDashboardScreenProps {
  onOpenMenu: () => void;
}

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
}

interface Simulado {
  id: string;
  title: string;
  price: number;
}

interface Acquisition {
  id: string;
  created_at: string;
  user_id: string;
  profiles: Profile | null;
  simulados: Simulado | null;
}

const Sparkline = ({ points, color = '#10B981' }: { points: number[]; color?: string }) => {
  if (!points || points.length < 2) {
    return (
      <svg className="w-24 h-8 text-slate-200" viewBox="0 0 100 30" fill="none">
        <line x1="0" y1="15" x2="100" y2="15" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    );
  }
  
  const width = 120;
  const height = 40;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  
  const svgPoints = points.map((val, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * height + 2;
    return `${x},${Math.min(height - 2, Math.max(2, y))}`;
  }).join(' ');

  return (
    <svg className="w-[100px] h-[32px] overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={svgPoints}
      />
    </svg>
  );
};

export const AdminDashboardScreen = ({ onOpenMenu }: AdminDashboardScreenProps) => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number>(0);
  const [simuladosCount, setSimuladosCount] = useState<number>(0);
  const [stripeBalance, setStripeBalance] = useState<string>('R$ 0,00');
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Fetch users
      const { data: userData } = await supabase.rpc('get_all_users');
      if (userData) {
        setUserCount(userData.length);
      } else {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (count !== null) setUserCount(count);
      }

      // 2. Fetch simulados count
      const { count: simCount } = await supabase
        .from('simulados')
        .select('*', { count: 'exact', head: true });
      if (simCount !== null) setSimuladosCount(simCount);

      // 3. Fetch Stripe balance
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

      // 4. Fetch all user_simulados with profiles and simulados relationship joins
      const { data: acqData, error: acqError } = await supabase
        .from('user_simulados')
        .select(`
          id,
          created_at,
          user_id,
          profiles (
            first_name,
            last_name,
            email
          ),
          simulados (
            id,
            title,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (acqError) throw acqError;
      if (acqData) {
        // Normalize array vs object relation outputs
        const normalized = (acqData as any[]).map(item => ({
          ...item,
          profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
          simulados: Array.isArray(item.simulados) ? item.simulados[0] : item.simulados,
        }));
        setAcquisitions(normalized as Acquisition[]);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Filter acquisitions by selected timeframe
  const filteredAcquisitions = useMemo(() => {
    const now = new Date();
    return acquisitions.filter(item => {
      const itemDate = new Date(item.created_at);
      if (timeframe === '7d') {
        const limit = new Date();
        limit.setDate(now.getDate() - 7);
        return itemDate >= limit;
      }
      if (timeframe === '30d') {
        const limit = new Date();
        limit.setDate(now.getDate() - 30);
        return itemDate >= limit;
      }
      return true; // 'all'
    });
  }, [acquisitions, timeframe]);

  // Projected Revenue
  const estimatedRevenue = useMemo(() => {
    return filteredAcquisitions.reduce((acc, item) => {
      return acc + (item.simulados?.price || 0);
    }, 0);
  }, [filteredAcquisitions]);

  // Calculate dynamic sparkline counts for the selected timeframe
  const sparklineData = useMemo(() => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 15;
    const now = new Date();
    
    const acquisitionsPoints: number[] = [];
    const revenuePoints: number[] = [];
    const activeUsersPoints: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dayAcquisitions = acquisitions.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.getDate() === d.getDate() &&
               itemDate.getMonth() === d.getMonth() &&
               itemDate.getFullYear() === d.getFullYear();
      });

      acquisitionsPoints.push(dayAcquisitions.length);
      
      const revSum = dayAcquisitions.reduce((acc, item) => acc + (item.simulados?.price || 0), 0);
      revenuePoints.push(revSum);

      const uniqueUsers = new Set(dayAcquisitions.map(item => item.user_id)).size;
      activeUsersPoints.push(uniqueUsers);
    }

    // Catalog curve
    const catalogPoints: number[] = [];
    const base = Math.max(1, simuladosCount - 2);
    for (let i = 0; i < days; i++) {
      catalogPoints.push(base + Math.floor((i / days) * (simuladosCount - base)));
    }

    // Calculate trends based on first half vs second half
    const getTrendPercent = (points: number[]) => {
      if (points.length < 2) return 0;
      const half = Math.ceil(points.length / 2);
      const first = points.slice(0, half).reduce((a, b) => a + b, 0);
      const second = points.slice(half).reduce((a, b) => a + b, 0);
      if (first === 0) return second > 0 ? 100 : 0;
      return Math.round(((second - first) / first) * 100);
    };

    return {
      acquisitions: acquisitionsPoints,
      revenue: revenuePoints,
      activeUsers: activeUsersPoints,
      catalog: catalogPoints,
      acqTrend: getTrendPercent(acquisitionsPoints),
      revTrend: getTrendPercent(revenuePoints),
      userTrend: getTrendPercent(activeUsersPoints),
      catalogTrend: simuladosCount > 0 ? 4 : 0
    };
  }, [acquisitions, timeframe, simuladosCount]);

  // Real-time active in last 24h count
  const activeLast24h = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() - 1);
    const recent = acquisitions.filter(item => new Date(item.created_at) >= limit);
    return new Set(recent.map(item => item.user_id)).size;
  }, [acquisitions]);

  // Top Simulados Popularity
  const topSimulados = useMemo(() => {
    const counts: { [key: string]: { title: string; count: number } } = {};
    
    filteredAcquisitions.forEach(item => {
      const sim = item.simulados;
      if (!sim) return;
      if (!counts[sim.id]) {
        counts[sim.id] = { title: sim.title, count: 0 };
      }
      counts[sim.id].count += 1;
    });

    const totalCount = filteredAcquisitions.length || 1;

    return Object.values(counts)
      .map(item => ({
        title: item.title,
        count: item.count,
        percentage: Math.round((item.count / totalCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredAcquisitions]);

  // Clean relative time function in Portuguese
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    return `Há ${diffDays} dias`;
  };

  // Past gradients for profile avatars
  const getAvatarGradient = (name: string) => {
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'from-emerald-400 to-teal-500 text-emerald-950',
      'from-blue-400 to-indigo-500 text-blue-950',
      'from-purple-400 to-pink-500 text-purple-950',
      'from-orange-400 to-amber-500 text-orange-950',
      'from-rose-400 to-red-500 text-rose-950',
      'from-sky-400 to-blue-500 text-sky-950'
    ];
    return gradients[sum % gradients.length];
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'US';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest animate-pulse">Carregando métricas analíticas...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* GOOGLE ANALYTICS TYPE HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="flex items-center p-4 justify-between pt-12 w-full max-w-6xl mx-auto">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-slate-700 hover:text-indigo-600 transition-colors focus:outline-none">
            <Menu size={22} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <BarChart3 size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-extrabold leading-none text-slate-900 tracking-tight">IQ Analytics</h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Painel de Controle</p>
            </div>
          </div>

          <button 
            onClick={() => fetchStats(true)} 
            disabled={refreshing}
            className="size-10 flex items-center justify-end text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 pt-6">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          
          {/* HEADER ACTION BANNER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Resumo Geral</p>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">Instantâneo dos Relatórios</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Analise a interação dos alunos, conversão de vendas e o desempenho geral do catálogo de simulados.</p>
            </div>
            
            {/* TIMEFRAME SELECTOR */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 self-start md:self-auto shrink-0 shadow-inner">
              {[
                { id: '7d', label: '7 dias' },
                { id: '30d', label: '30 dias' },
                { id: 'all', label: 'Histórico' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTimeframe(opt.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${timeframe === opt.id 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC KPI GRID */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: Users */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Total de Usuários</span>
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <Users size={16} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{userCount}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${sparklineData.userTrend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {sparklineData.userTrend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {sparklineData.userTrend >= 0 ? '+' : ''}{sparklineData.userTrend}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Comparado ao período anterior</p>
              </div>
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Usuários Ativos</span>
                <Sparkline points={sparklineData.activeUsers} color="#6366f1" />
              </div>
            </motion.div>

            {/* Card 2: Catalog Size */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Simulados Ativos</span>
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <Layers size={16} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{simuladosCount}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 flex items-center gap-0.5">
                    Catálogo Ativo
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Disponíveis na vitrine</p>
              </div>
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Crescimento</span>
                <Sparkline points={sparklineData.catalog} color="#3b82f6" />
              </div>
            </motion.div>

            {/* Card 3: Acquisitions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Aquisições</span>
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <Activity size={16} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{filteredAcquisitions.length}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${sparklineData.acqTrend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {sparklineData.acqTrend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {sparklineData.acqTrend >= 0 ? '+' : ''}{sparklineData.acqTrend}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Total no período selecionado</p>
              </div>
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Conversão diária</span>
                <Sparkline points={sparklineData.acquisitions} color="#10b981" />
              </div>
            </motion.div>

            {/* Card 4: Faturamento Projetado */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Faturamento Estimado</span>
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    R$ {estimatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${sparklineData.revTrend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {sparklineData.revTrend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {sparklineData.revTrend >= 0 ? '+' : ''}{sparklineData.revTrend}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Stripe Saldo: <span className="font-bold text-slate-600">{stripeBalance}</span></p>
              </div>
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Volume de vendas</span>
                <Sparkline points={sparklineData.revenue} color="#f59e0b" />
              </div>
            </motion.div>
            
          </div>

          {/* MAIN RELATIONAL ANALYTICS SECTION */}
          <div className="grid gap-6 lg:grid-cols-5">
            
            {/* REAL-TIME MONITORING AND ACTIVITY FEED (3 cols wide) */}
            <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Monitoramento Real-Time</h3>
                  </div>
                  <p className="text-xs text-slate-500">Atividades de aquisição registradas recentemente pelos alunos.</p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{activeLast24h}</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Usuários Ativos (24h)</p>
                </div>
              </div>

              {/* FEED LIST */}
              <div className="p-5 flex-1 flex flex-col justify-center min-h-[300px]">
                {acquisitions.length === 0 ? (
                  <div className="text-center py-10">
                    <Activity size={32} className="mx-auto text-slate-300 animate-pulse mb-3" />
                    <p className="text-xs text-slate-400 font-semibold">Nenhuma interação registrada recentemente.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 space-y-4">
                    {acquisitions.slice(0, 5).map((item, idx) => {
                      const user = item.profiles;
                      const sim = item.simulados;
                      const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Estudante Convidado';
                      const emailStr = user?.email || 'Sem email cadastrado';
                      
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          key={item.id} 
                          className="flex items-center justify-between pt-4 first:pt-0 group hover:bg-slate-50/40 p-2 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {/* Colorful Pastel Avatar Circle */}
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(fullName)} flex items-center justify-center font-bold text-xs tracking-wider shadow-sm uppercase shrink-0`}>
                              {getInitials(fullName, emailStr)}
                            </div>
                            
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate leading-none uppercase tracking-wide">{fullName}</p>
                              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{emailStr}</p>
                              
                              {/* Subtitle describing the action */}
                              <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tight truncate max-w-[260px] sm:max-w-md">
                                Adquiriu <span className="font-bold text-slate-700 italic">{sim?.title || 'Simulado Excluído'}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <span className="inline-block text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm uppercase italic">
                              R$ {sim?.price !== undefined ? sim.price.toFixed(2) : '0.00'}
                            </span>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{getRelativeTime(item.created_at)}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* TOP SIMULADOS POPULARITY (2 cols wide) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="space-y-1 pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 size={16} className="text-slate-500" />
                    Top Simulados
                  </h3>
                  <p className="text-xs text-slate-500">Exames mais procurados e participação de mercado.</p>
                </div>

                <div className="mt-5 space-y-4">
                  {topSimulados.length === 0 ? (
                    <div className="text-center py-12">
                      <Layers size={28} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs text-slate-400 font-semibold">Nenhum simulado adquirido neste período.</p>
                    </div>
                  ) : (
                    topSimulados.map((item, index) => {
                      // Alternate bar gradient colors
                      const progressColors = [
                        'from-indigo-500 to-blue-600',
                        'from-emerald-400 to-teal-500',
                        'from-purple-500 to-indigo-600',
                        'from-amber-400 to-orange-500',
                        'from-rose-400 to-red-500'
                      ];

                      return (
                        <div key={item.title} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-700 truncate max-w-[190px] uppercase tracking-wide">
                              {index + 1}. {item.title}
                            </span>
                            <span className="text-slate-500 font-bold">
                              {item.count} <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
                            </span>
                          </div>
                          
                          {/* GA Style horizontal progress bars */}
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner border border-slate-200/20">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className={`bg-gradient-to-r ${progressColors[index % progressColors.length]} h-full rounded-full`}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 mt-6 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Computado sobre {filteredAcquisitions.length} vendas vinculadas
                </p>
              </div>
            </div>

          </div>

          {/* ADMIN ADMINISTRATIVE ACCESS QUICK ACTIONS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ações Administrativas</p>
              <h3 className="text-base font-bold tracking-tight text-slate-900 mt-1">Links de Acesso Rápido</h3>
              <p className="text-xs text-slate-500 mt-0.5">Gerencie o acervo de simulados, cupons promocionais no Stripe, banco de questões e usuários cadastrados.</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { 
                  icon: FileText, 
                  label: 'Catálogo de Simulados', 
                  sub: 'Editar e cadastrar simulados', 
                  color: 'from-orange-500 to-amber-500 shadow-orange-100', 
                  onClick: () => navigate('/admin/list') 
                },
                { 
                  icon: Ticket, 
                  label: 'Cupons Stripe', 
                  sub: 'Configurar promoções', 
                  color: 'from-amber-400 to-yellow-500 shadow-amber-100', 
                  onClick: () => navigate('/admin/coupons') 
                },
                { 
                  icon: List, 
                  label: 'Banco de Questões', 
                  sub: 'Editar perguntas e respostas', 
                  color: 'from-sky-500 to-blue-500 shadow-sky-100', 
                  onClick: () => navigate('/admin/questoes') 
                },
                { 
                  icon: Users, 
                  label: 'Usuários e Acessos', 
                  sub: 'Níveis de permissão e status', 
                  color: 'from-emerald-500 to-teal-500 shadow-emerald-100', 
                  onClick: () => navigate('/admin/users') 
                }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex flex-col justify-between items-start text-left p-5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/60 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer transition-all duration-300 group hover:-translate-y-0.5 h-36"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md`}>
                      <item.icon size={18} />
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors group-hover:translate-x-0.5" />
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-wide">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 truncate max-w-[190px]">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
