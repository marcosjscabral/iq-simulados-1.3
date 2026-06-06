import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function CheckoutCancel() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
            style={{ background: '#f9f9ff' }}>
            <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

            <div className="relative z-10 animate-fade-in-up">
                <div className="size-20 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                    style={{ background: 'rgba(213,136,0,0.08)', color: '#c47a00' }}>
                    <XCircle size={40} />
                </div>

                <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: '#111c2d' }}>Compra Cancelada</h2>
                <p className="mb-10 max-w-sm mx-auto" style={{ color: '#767586' }}>
                    O processo de pagamento foi interrompido. Nenhuma cobrança foi realizada.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-md">
                    <button
                        onClick={() => navigate('/')}
                        className="py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm"
                        style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        <ShoppingCart size={18} /> Voltar para Vitrine
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="font-semibold uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2 transition-colors"
                        style={{ color: '#767586' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#767586')}
                    >
                        <ArrowLeft size={14} /> Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    );
}
