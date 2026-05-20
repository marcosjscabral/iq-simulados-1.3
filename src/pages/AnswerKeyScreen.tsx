import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnswerKeyScreen = () => {
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 max-w-lg w-full">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Selecione um simulado finalizado para ver o gabarito.</p>
        </div>
      </main>
    </div>
  );
};
