import React from 'react';
import { Menu } from 'lucide-react';

interface MaterialsScreenProps {
    onOpenMenu: () => void;
    setView: (v: any) => void;
}

export const MaterialsScreen = ({ onOpenMenu }: MaterialsScreenProps) => (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: '#f9f9ff', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
        <div className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle, rgba(225,224,255,0.4) 0%, transparent 70%)', transform: 'translate(-25%, -25%)' }} />

        <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(249,249,255,0.9)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
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
                    <h1 className="text-lg font-bold tracking-tight" style={{ color: '#111c2d' }}>Materiais</h1>
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#767586' }}>IQ Simulados</p>
                </div>
                <div className="size-10" />
            </div>
        </header>

        <main className="flex-1 p-6 flex flex-col items-center justify-center text-center relative z-10">
            <div className="animate-fade-in-up">
                {/* Illustration placeholder */}
                <div className="size-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"
                    style={{ background: '#f0f3ff', border: '1px solid #e7eeff' }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#4648d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3 tracking-tight" style={{ color: '#111c2d' }}>Em Breve!</h2>
                <p className="max-w-xs mx-auto text-sm leading-relaxed" style={{ color: '#464554' }}>
                    Estamos preparando apostilas, resumos e mapas mentais exclusivos para turbinar sua aprovação.
                </p>
            </div>
        </main>
    </div>
);
