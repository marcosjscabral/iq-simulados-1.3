import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnswerKeyScreen = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#f9f9ff', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

            <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(249,249,255,0.9)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
                <div className="flex items-center p-4 justify-between pt-10 max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="size-10 flex items-center justify-start transition-colors"
                        style={{ color: '#515f74' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#515f74')}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center gap-0.5">
                        <h1 className="text-lg font-bold tracking-tight" style={{ color: '#111c2d' }}>Gabarito</h1>
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#767586' }}>IQ Simulados</p>
                    </div>
                    <div className="size-10" />
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="rounded-2xl p-10 max-w-lg w-full text-center animate-fade-in-up"
                    style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.07)' }}>
                    <p className="font-semibold text-sm" style={{ color: '#767586' }}>
                        Selecione um simulado finalizado para ver o gabarito.
                    </p>
                </div>
            </main>
        </div>
    );
};
