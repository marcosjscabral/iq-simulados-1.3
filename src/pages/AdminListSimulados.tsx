import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Search,
    Trash2,
    Edit2,
    TrendingUp,
    Filter,
    Image as ImageIcon,
    Link,
    Link2Off
} from 'lucide-react';
import { Simulado } from '../types';
import { supabase } from '../lib/supabase';
import { useModal } from '../components/ModalContext';
import { StripeToggle } from '../components/StripeToggle';
import { StripeService } from '../lib/stripeService';
import { Ticket } from 'lucide-react';

interface AdminListSimuladosProps {
    onPublishSuccess?: () => void;
}

const AdminListSimulados: React.FC<AdminListSimuladosProps> = ({ onPublishSuccess }) => {
    const navigate = useNavigate();
    const [simulados, setSimulados] = useState<Simulado[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showAlert, showConfirm } = useModal();

    const formatPrice = (price: number) => {
        return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const fetchSimulados = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('simulados')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSimulados(data || []);
        } catch (error) {
            console.error('Error fetching simulados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSimulados();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        showConfirm('Excluir Simulado', `Tem certeza que deseja excluir o simulado "${title}"?`, async () => {
            try {
                // 1. Check if Stripe is enabled and if we have a product ID
                const { data: settings } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'stripe_enabled')
                    .single();

                const stripeEnabled = settings?.value === 'true';

                if (stripeEnabled) {
                    const { data: sim } = await supabase
                        .from('simulados')
                        .select('stripe_product_id')
                        .eq('id', id)
                        .single();

                    if (sim?.stripe_product_id) {
                        try {
                            await StripeService.archiveProduct(sim.stripe_product_id);
                        } catch (err) {
                            console.error('Error archiving stripe product:', err);
                        }
                    }
                }

                const { error } = await supabase
                    .from('simulados')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setSimulados(prev => prev.filter(s => s.id !== id));
                showAlert('Sucesso', 'Simulado excluído com sucesso!', 'success');
            } catch (error: any) {
                console.error('Error deleting:', error);
                showAlert('Erro', 'Erro ao excluir: ' + error.message, 'error');
            }
        });
    };

    const filteredSimulados = simulados.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-slate-50 min-h-screen flex justify-center text-slate-900">
            <div className="relative flex min-h-screen w-full flex-col bg-slate-50 overflow-x-hidden">

                {/* Header */}
                <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <div className="flex items-center p-4 justify-between pt-12 w-full mx-auto max-w-6xl">
                        <button
                            onClick={() => navigate('/admin')}
                            className="size-10 flex items-center justify-center rounded-2xl bg-slate-100 p-2 text-slate-900 shadow-sm hover:bg-slate-200 transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex flex-col items-center">
                            <h1 className="text-xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">Gerenciar Vitrine</h1>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Administração</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/admin/coupons')}
                                className="text-slate-900 bg-slate-100 p-2 rounded-xl shadow-sm hover:bg-slate-200 transition-all"
                                title="Gerenciar Cupons"
                            >
                                <Ticket size={24} />
                            </button>
                            <button
                                onClick={() => navigate('/admin/simulados/new')}
                                className="text-slate-900 bg-slate-100 p-2 rounded-xl shadow-sm hover:bg-slate-200 transition-all"
                                title="Novo Simulado"
                            >
                                <Plus size={24} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-5 pt-6 space-y-6 pb-24 w-full mx-auto">
                    {/* Search Bar */} <StripeToggle />

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar simulado pelo nome"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-slate-300 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>

                    {/* List Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60">
                                Simulados Ativos ({filteredSimulados.length})
                            </h2>
                            <button className="text-slate-500 hover:text-white transition-colors">
                                <TrendingUp size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {filteredSimulados.map((sim) => (
                                <div
                                    key={sim.id}
                                    className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group"
                                >
                                    <div className="size-16 shrink-0 rounded-2xl bg-slate-900 overflow-hidden border border-white/5">
                                        {sim.image_url ? (
                                            <img src={sim.image_url} alt={sim.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-sm text-white truncate leading-tight">
                                                {sim.title}
                                            </h3>
                                            {sim.stripe_product_id ? (
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" title="Sincronizado com Stripe">
                                                    <Link size={10} />
                                                    <span className="text-[8px] font-black uppercase">Stripe OK</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20" title="Apenas Local (Necessário Salvar Novamente)">
                                                    <Link2Off size={10} />
                                                    <span className="text-[8px] font-black uppercase">Local Only</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                            <span className="text-slate-900">R$ {formatPrice(sim.price)}</span>
                                            <span className="opacity-30">•</span>
                                            <span className="truncate max-w-[100px]">{sim.categories[0]}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/simulados/${sim.id}`)}
                                            className="bg-white p-2.5 rounded-full text-blue-600 shadow-lg hover:scale-110 transition-transform active:scale-95"
                                        >
                                            <Edit2 size={16} strokeWidth={3} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sim.id, sim.title)}
                                            className="bg-red-50 p-2.5 rounded-full text-red-600 shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                        >
                                            <Trash2 size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {!loading && filteredSimulados.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 font-medium">Nenhum simulado encontrado.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default AdminListSimulados;
