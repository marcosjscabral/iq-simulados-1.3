import React, { useState, useEffect } from 'react';
import { Menu, Settings, User, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Simulado } from '../types';
import { supabase } from '../lib/supabase';
import { StripeService } from '../lib/stripeService';

const formatPrice = (price: number) => {
  return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface HomeScreenProps {
  onOpenMenu: () => void;
  setView: (v: any) => void;
  simulados: Simulado[];
}

export const HomeScreen = ({ onOpenMenu, simulados }: HomeScreenProps) => {
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

  // Stripe checkout logic absolutely preserved line-by-line
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Por favor, faça login para continuar com a compra.');
        return;
      }

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
    <div className="min-h-screen pb-24 select-none relative overflow-x-hidden" style={{ background: '#f9f9ff' }}>

      {/* Decorative background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(225,224,255,0.4) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(222,232,255,0.5) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(249,249,255,0.85)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
        <div className="flex items-center p-4 justify-between pt-10 max-w-5xl mx-auto">
          <button
            onClick={onOpenMenu}
            className="size-10 flex items-center justify-start focus:outline-none transition-colors"
            style={{ color: '#515f74' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
            onMouseLeave={e => (e.currentTarget.style.color = '#515f74')}
          >
            <Menu size={24} />
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #4648d4 0%, #6063ee 100%)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold tracking-tight" style={{ color: '#111c2d' }}>Vitrine de Simulados</h1>
            </div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#767586' }}>Plataforma IQ</p>
          </div>

          <div className="size-10 flex items-center justify-end">
            <button
              onClick={() => navigate(isAdmin ? '/admin' : '/profile')}
              className="rounded-xl p-2.5 active:scale-95 transition-all shadow-sm cursor-pointer"
              style={{ background: '#ffffff', border: '1px solid #e7eeff', color: '#515f74' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4648d4'; (e.currentTarget as HTMLElement).style.color = '#4648d4'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e7eeff'; (e.currentTarget as HTMLElement).style.color = '#515f74'; }}
            >
              {isAdmin ? <Settings size={18} /> : <User size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="py-4 border-b sticky top-[72px] z-40" style={{ background: 'rgba(249,249,255,0.9)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-0.5 px-4 max-w-5xl mx-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer"
              style={selectedCategory === cat
                ? { background: '#4648d4', color: '#ffffff', border: '1px solid #4648d4', boxShadow: '0 4px 12px rgba(70,72,212,0.25)' }
                : { background: '#ffffff', color: '#515f74', border: '1px solid #c7c4d7' }
              }
              onMouseEnter={e => { if (selectedCategory !== cat) { (e.currentTarget as HTMLElement).style.borderColor = '#4648d4'; (e.currentTarget as HTMLElement).style.color = '#4648d4'; }}}
              onMouseLeave={e => { if (selectedCategory !== cat) { (e.currentTarget as HTMLElement).style.borderColor = '#c7c4d7'; (e.currentTarget as HTMLElement).style.color = '#515f74'; }}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 space-y-8 max-w-5xl mx-auto pt-8 relative z-10">

        {/* Destaques da Semana */}
        {showFeatured && featuredSimulado && (
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-5 px-1">
              <Flame size={18} style={{ color: '#4648d4' }} strokeWidth={2.5} />
              <h2 className="text-[15px] font-bold tracking-wide uppercase" style={{ color: '#111c2d' }}>
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
              className="glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col md:flex-row w-full"
            >
              <div className="relative h-52 md:h-auto md:w-80 shrink-0 overflow-hidden"
                style={{ background: '#f0f3ff', borderBottom: '1px solid #e7eeff' }}>
                <div className="md:hidden" style={{ borderBottom: '1px solid #e7eeff' }} />
                {featuredSimulado.featured_label && (
                  <span className="absolute top-4 left-4 z-10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg text-white shadow-lg"
                    style={{ background: '#4648d4', boxShadow: '0 4px 12px rgba(70,72,212,0.35)' }}>
                    {featuredSimulado.featured_label}
                  </span>
                )}
                {featuredSimulado.image_url ? (
                  <img src={featuredSimulado.image_url} alt={featuredSimulado.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black italic"
                    style={{ color: '#c7c4d7' }}>IQ</div>
                )}
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight mb-3 transition-colors"
                    style={{ color: '#111c2d' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#111c2d')}>
                    {featuredSimulado.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed mb-6 line-clamp-3" style={{ color: '#464554' }}>
                    {featuredSimulado.description || 'Descrição não informada.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    {featuredSimulado.questions_count > 0 && (
                      <span className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                        style={{ background: '#f0f3ff', color: '#4648d4', border: '1px solid #e7eeff' }}>
                        {featuredSimulado.questions_count} Questões Objetivas
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-5" style={{ borderTop: '1px solid #e7eeff' }}>
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight"
                    style={{ background: 'linear-gradient(135deg, #4648d4, #6063ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    R$ {formatPrice(featuredSimulado.price)}
                  </span>
                  <button
                    disabled={buyingId === featuredSimulado.id}
                    onClick={e => { e.stopPropagation(); handleBuy(featuredSimulado); }}
                    className="px-7 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    style={ownedIds.includes(featuredSimulado.id)
                      ? { background: 'rgba(26,107,58,0.08)', color: '#1a6b3a', border: '1px solid rgba(26,107,58,0.25)' }
                      : { background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }
                    }
                  >
                    {buyingId === featuredSimulado.id ? (
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : ownedIds.includes(featuredSimulado.id) ? 'Acessar' : 'Comprar'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Simulados Disponíveis */}
        <section className="pb-16">
          <h2 className="text-[15px] font-bold tracking-wide uppercase mb-5 px-1" style={{ color: '#111c2d' }}>
            Simulados Disponíveis
          </h2>
          {filteredSimulados.length === 0 ? (
            <div className="p-10 text-center rounded-2xl" style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 4px 16px rgba(71,85,105,0.06)' }}>
              <p className="font-medium text-sm" style={{ color: '#767586' }}>Nenhum simulado disponível nesta categoria.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredSimulados.map((simulado, idx) => {
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
                    className="glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col md:flex-row md:h-44 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="w-full md:w-52 h-44 md:h-full shrink-0 relative overflow-hidden"
                      style={{ background: '#f0f3ff', borderBottom: '1px solid #e7eeff' }}>
                      {simulado.image_url ? (
                        <img src={simulado.image_url} alt={simulado.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black italic"
                          style={{ color: '#c7c4d7' }}>IQ</div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold leading-tight tracking-tight mb-2 transition-colors group-hover:text-primary"
                          style={{ color: '#111c2d' }}>
                          {simulado.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed mb-4 pr-4"
                          style={{ color: '#464554' }}>
                          {simulado.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          {simulado.questions_count > 0 && (
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                              style={{ background: '#f0f3ff', color: '#4648d4', border: '1px solid #e7eeff' }}>
                              {simulado.questions_count} Questões
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid #e7eeff' }}>
                        <span className="text-xl sm:text-2xl font-bold tracking-tight"
                          style={{ background: 'linear-gradient(135deg, #4648d4, #6063ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                          R$ {formatPrice(simulado.price)}
                        </span>
                        <button
                          disabled={buyingId === simulado.id}
                          onClick={e => { e.stopPropagation(); handleBuy(simulado); }}
                          className="px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-sm cursor-pointer"
                          style={isOwned
                            ? { background: 'rgba(26,107,58,0.08)', color: '#1a6b3a', border: '1px solid rgba(26,107,58,0.2)' }
                            : { background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 12px rgba(70,72,212,0.25)' }
                          }
                        >
                          {buyingId === simulado.id ? (
                            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : isOwned ? 'Acessar' : 'Comprar'}
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
