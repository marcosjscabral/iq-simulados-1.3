import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function CheckoutCancel() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="size-20 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center mb-6">
                <XCircle size={40} />
            </div>

            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Compra Cancelada</h2>
            <p className="text-slate-500 mt-2 mb-8 w-full max-w-md mx-auto">
                O processo de pagamento foi interrompido. Nenhuma cobrança foi realizada.
            </p>

            <div className="flex flex-col gap-4 w-full max-w-md">
                <button
                    onClick={() => navigate('/')}
                    className="bg-[#2c73eb] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-sm italic"
                >
                    <ShoppingCart size={18} /> Voltar para Vitrine
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-500 font-black uppercase tracking-widest text-xs hover:text-white transition-colors py-4 flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={14} /> Tentar Novamente
                </button>
            </div>
        </div>
    );
}
