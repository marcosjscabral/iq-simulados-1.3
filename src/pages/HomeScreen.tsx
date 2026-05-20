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
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Por favor, faça login para continuar com a compra.');
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
    <div className="bg-bg-primary min-h-screen pb-24 text-text-primary font-interface select-none">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-slate-900 shadow-sm">
        <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-text-primary hover:text-brand-purple focus:outline-none transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400">Vitrine de Simulados</h1>
            <p className="text-[9px] uppercase tracking-[0.25em] text-text-secondary font-black mt-1">Plataforma IQ</p>
          </div>
          <div className="size-10 flex items-center justify-end">
            <button onClick={() => navigate(isAdmin ? '/admin' : '/profile')} className="rounded-xl bg-surface-card p-2.5 text-text-primary hover:border-brand-purple/50 active:scale-95 transition-all shadow-lg border border-slate-800 cursor-pointer">
              {isAdmin ? <Settings size={18} /> : <User size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="bg-bg-primary/50 backdrop-blur-md py-4.5 border-b border-slate-900 shadow-sm mb-6 sticky top-23 z-40">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-4 max-w-5xl mx-auto scroll-smooth">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-6 py-2 rounded-full text-[13px] font-bold transition-all border cursor-pointer ${selectedCategory === cat
                ? 'bg-brand-purple text-text-primary border-brand-purple shadow-lg shadow-brand-purple/20'
                : 'bg-surface-card text-text-secondary border-slate-800 hover:text-text-primary hover:border-slate-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 space-y-8 max-w-5xl mx-auto pt-2">
        {/* Destaques da Semana */}
        {showFeatured && featuredSimulado && (
          <section>
            <div className="flex items-center gap-2 mb-4.5 px-1">
              <Flame size={20} className="text-brand-purple" strokeWidth={2.5} />
              <h2 className="text-[17px] font-black text-text-primary uppercase tracking-wider">
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
              className="group relative flex flex-col md:flex-row w-full rounded-2xl overflow-hidden cursor-pointer border border-slate-800 bg-surface-card shadow-xl transition-all hover:border-slate-700 hover:shadow-brand-purple/5"
            >
              <div className="relative h-52 md:h-auto md:w-80 shrink-0 bg-slate-900 overflow-hidden border-b md:border-b-0 md:border-r border-slate-900">
                {featuredSimulado.featured_label && (
                  <span className="absolute top-6 left-6 z-10 px-3 py-1.5 bg-brand-purple text-text-primary text-[9px] font-black uppercase tracking-wider rounded-lg shadow-lg">
                    {featuredSimulado.featured_label}
                  </span>
                )}
                {featuredSimulado.image_url ? (
                  <img src={featuredSimulado.image_url} alt={featuredSimulado.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary/20 italic font-black text-4xl">IQ</div>
                )}
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-text-primary leading-tight uppercase tracking-tight mb-3 group-hover:text-brand-purple transition-colors">{featuredSimulado.title}</h3>
                  <p className="text-text-secondary text-sm font-medium leading-relaxed mb-6 line-clamp-3 uppercase">
                    {featuredSimulado.description || 'Descrição não informada.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-text-secondary/70 uppercase tracking-widest mb-6">
                    {featuredSimulado.questions_count > 0 && (
                      <span className="bg-bg-primary px-3 py-1.5 rounded-lg border border-slate-900">{featuredSimulado.questions_count} Questões Objetivas</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/40">
                  <span className="text-2xl sm:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400 tracking-tighter">
                    R$ {formatPrice(featuredSimulado.price)}
                  </span>
                  <button
                    disabled={buyingId === featuredSimulado.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(featuredSimulado);
                    }}
                    className={`px-8 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg cursor-pointer ${ownedIds.includes(featuredSimulado.id) ? 'bg-success-green/10 text-success-green border border-success-green/30' : 'bg-brand-purple text-text-primary shadow-brand-purple/20'}`}
                  >
                    {buyingId === featuredSimulado.id ? (
                      <div className="size-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
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
        <section className="pb-16">
          <h2 className="text-[17px] font-black text-text-primary uppercase tracking-wider mb-5 px-1">Simulados Disponíveis</h2>
          {filteredSimulados.length === 0 ? (
            <div className="p-10 text-center bg-surface-card rounded-2xl border border-slate-800 shadow-xl">
              <p className="text-text-secondary font-medium text-sm">Nenhum simulado disponível nesta categoria.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
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
                    className="group flex flex-col md:flex-row bg-surface-card border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all cursor-pointer shadow-xl md:h-44"
                  >
                    <div className="w-full md:w-52 h-44 md:h-full shrink-0 bg-slate-900 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-900">
                      {simulado.image_url ? (
                        <img src={simulado.image_url} alt={simulado.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary/10 italic font-black text-3xl">IQ</div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-md sm:text-lg font-black text-text-primary leading-tight uppercase tracking-tight mb-2 group-hover:text-brand-purple transition-colors">{simulado.title}</h3>
                        <p className="text-text-secondary text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed uppercase mb-4 pr-4">{simulado.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-[9px] font-black text-text-secondary/60 uppercase tracking-widest mb-4">
                          {simulado.questions_count > 0 && (
                            <span className="bg-bg-primary px-2.5 py-1 rounded border border-slate-900">{simulado.questions_count} Questões</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/40">
                        <span className="text-xl sm:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400 tracking-tighter">
                          R$ {formatPrice(simulado.price)}
                        </span>
                        <button
                          disabled={buyingId === simulado.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuy(simulado);
                          }}
                          className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg cursor-pointer ${isOwned ? 'bg-success-green/10 text-success-green border border-success-green/20' : 'bg-brand-purple text-text-primary shadow-brand-purple/20'}`}
                        >
                          {buyingId === simulado.id ? (
                            <div className="size-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
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
