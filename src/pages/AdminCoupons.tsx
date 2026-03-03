import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Ticket,
    Plus,
    Trash2,
    Search,
    Percent,
    DollarSign,
    Calendar,
    AlertCircle,
    CheckCircle2,
    X
} from 'lucide-react';
import { StripeService } from '../lib/stripeService';
import { useModal } from '../components/ModalContext';

interface StripeCoupon {
    id: string;
    name: string;
    percent_off: number | null;
    amount_off: number | null;
    currency: string | null;
    duration: string;
    valid: boolean;
    times_redeemed: number;
}

export default function AdminCoupons() {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();
    const [coupons, setCoupons] = useState<StripeCoupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Create state
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
    const [discountValue, setDiscountValue] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await StripeService.listCoupons();
            if (data.data) {
                setCoupons(data.data);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            showAlert('Erro', 'Não foi possível carregar os cupons.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !discountValue) return;

        setCreating(true);
        try {
            const val = parseFloat(discountValue.replace(',', '.'));
            const percentOff = discountType === 'percent' ? val : undefined;
            const amountOff = discountType === 'amount' ? val : undefined;

            const result = await StripeService.createCoupon(newName, percentOff, amountOff);

            if (result.error) {
                throw new Error(result.error.message);
            }

            showAlert('Sucesso', 'Cupom criado com sucesso!', 'success');
            setShowCreate(false);
            setNewName('');
            setDiscountValue('');
            fetchCoupons();
        } catch (error: any) {
            console.error('Error creating coupon:', error);
            showAlert('Erro', error.message || 'Erro ao criar cupom.', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = (id: string) => {
        showConfirm('Excluir Cupom', 'Tem certeza que deseja excluir este cupom?', async () => {
            try {
                await StripeService.deleteCoupon(id);
                setCoupons(prev => prev.filter(c => c.id !== id));
                showAlert('Sucesso', 'Cupom excluído.', 'success');
            } catch (error) {
                console.error('Error deleting coupon:', error);
                showAlert('Erro', 'Não foi possível excluir o cupom.', 'error');
            }
        });
    };

    const filteredCoupons = coupons.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#0f172a] min-h-screen flex flex-col font-display text-white">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-[#ffd700] rounded-b-[2.5rem] shadow-2xl">
                <div className="flex items-center p-6 pt-12 justify-between">
                    <button onClick={() => navigate('/admin/list')} className="size-10 flex items-center justify-start text-black">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-xl font-black leading-tight text-black italic uppercase italic tracking-tighter">CUPONS</h1>
                        <p className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Stripe Marketing</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="size-10 flex items-center justify-end text-black"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-32 pt-8 px-6">
                {/* SEARCH */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar cupons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-[#ffd700]/50 transition-all"
                    />
                </div>

                {/* LIST */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <div className="w-8 h-8 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Carregando Cupons...</p>
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="bg-white/5 rounded-[2.5rem] p-12 text-center border border-white/5">
                        <Ticket size={48} className="mx-auto mb-4 text-slate-700" />
                        <p className="text-slate-500 font-bold text-sm">Nenhum cupom encontrado.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCoupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                className="bg-white/5 rounded-3xl p-6 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-[#ffd700] flex items-center justify-center text-black shrink-0 shadow-lg">
                                        <Ticket size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg uppercase italic text-white flex items-center gap-2">
                                            {coupon.name}
                                            {!coupon.valid && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full not-italic">Inválido</span>}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-bold text-[#ffd700] uppercase tracking-wider bg-[#ffd700]/10 px-2 py-0.5 rounded-lg border border-[#ffd700]/20">
                                                {coupon.percent_off ? `${coupon.percent_off}% OFF` : `R$ ${(coupon.amount_off! / 100).toFixed(2)} OFF`}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                {coupon.id}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                                        <CheckCircle2 size={12} /> {coupon.times_redeemed} USOS
                                    </div>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* CREATE MODAL */}
            {showCreate && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        className="w-full max-w-md bg-[#1e293b] rounded-[2.5rem] border border-white/10 shadow-2xl p-8 slide-in-from-bottom duration-500"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-black italic uppercase tracking-tight text-white">Novo Cupom</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Configurações de Desconto</p>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome Exibido</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: LANÇAMENTO 2024"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value.toUpperCase())}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#ffd700] outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipo de Desconto</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setDiscountType('percent')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${discountType === 'percent' ? 'bg-[#ffd700] text-black border-[#ffd700]' : 'bg-white/5 text-slate-400 border-white/5'}`}
                                    >
                                        <Percent size={18} /> % Porcento
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDiscountType('amount')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${discountType === 'amount' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/5 text-slate-400 border-white/5'}`}
                                    >
                                        <DollarSign size={18} /> R$ Fixo
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Valor do Desconto</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={discountType === 'percent' ? "20 (%)" : "15,00 (R$)"}
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#ffd700] outline-none transition-all"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={creating}
                                    className="w-full bg-[#ffd700] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-yellow-400/20 uppercase tracking-widest text-sm italic"
                                >
                                    {creating ? (
                                        <div className="size-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>Criar Cupom de Desconto</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
