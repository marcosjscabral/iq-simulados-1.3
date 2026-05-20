import React from 'react';
import { Menu, Rocket } from 'lucide-react';

interface MaterialsScreenProps {
  onOpenMenu: () => void;
  setView: (v: any) => void;
}

export const MaterialsScreen = ({ onOpenMenu }: MaterialsScreenProps) => (
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
      <div className="size-24 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-6 border border-slate-200">
        <Rocket size={48} />
      </div>
      <h2 className="text-2xl font-black mb-2 italic text-slate-900">EM BREVE!</h2>
      <p className="text-slate-600 max-w-xs mx-auto">Estamos preparando apostilas, resumos e mapas mentais exclusivos para turbinar sua aprovação.</p>
    </main>
  </div>
);
