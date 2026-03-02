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
    Image as ImageIcon
} from 'lucide-react';
import { Simulado } from '../types';
import { supabase } from '../lib/supabase';

interface AdminListSimuladosProps {
    onPublishSuccess?: () => void;
}

const AdminListSimulados: React.FC<AdminListSimuladosProps> = ({ onPublishSuccess }) => {
    const navigate = useNavigate();
    const [simulados, setSimulados] = useState<Simulado[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
        if (window.confirm(`Tem certeza que deseja excluir o simulado "${title}" ? `)) {
            try {
                const { error } = await supabase
                    .from('simulados')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setSimulados(simulados.filter(s => s.id !== id));
                alert('Simulado excluído com sucesso!');
            } catch (error: any) {
                console.error('Error deleting:', error);
                alert('Erro ao excluir: ' + error.message);
            }
        }
    };

    const filteredSimulados = simulados.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#0f172a] min-h-screen flex justify-center text-white">
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] bg-[#0f172a] overflow-x-hidden">

                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#ffd700] rounded-b-[2.5rem] shadow-2xl">
                    <div className="flex items-center p-4 justify-between pt-12">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="bg-yellow-100 p-2 rounded-full text-black shadow-lg"
                            >
                                <ArrowLeft size={22} />
                            </button>
                            <div>
                                <h1 className="text-lg font-black text-black leading-tight uppercase">Gerenciar Vitrine</h1>
                                <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest">Administração</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/admin/simulados/new')}
                            className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase italic shadow-lg active:scale-95 transition-all"
                        >
                            <Plus size={16} strokeWidth={3} /> Novo Simulado
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-5 pt-6 space-y-6 pb-24">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar simulado pelo nome"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-[#1e293b] border-none rounded-full shadow-inner outline-none focus:ring-2 focus:ring-[#ffd700]/20 transition-all font-medium text-white placeholder:text-slate-500"
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
                                    className="bg-[#1e293b] p-4 rounded-[2rem] border border-white/5 shadow-xl flex items-center gap-4 group"
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
                                        <h3 className="font-bold text-sm text-white truncate leading-tight mb-1">
                                            {sim.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                            <span className="text-blue-400">R$ {formatPrice(sim.price)}</span>
                                            <span className="opacity-30">•</span>
                                            <span className="truncate max-w-[100px]">{sim.categories[0]}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/simulados/edit/${sim.id}`)}
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
