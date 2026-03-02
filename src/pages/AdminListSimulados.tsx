import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Search,
    Edit2,
    Trash2,
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
        if (window.confirm(`Tem certeza que deseja excluir o simulado "${title}"?`)) {
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
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen flex justify-center">
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] shadow-2xl bg-white dark:bg-slate-900 overflow-x-hidden">

                {/* Header */}
                <header className="bg-[#FFD700] p-6 pt-12 pb-10 rounded-b-[2.5rem] shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="bg-white/40 p-2 rounded-full backdrop-blur-sm transition-colors text-slate-900 shadow-sm"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 leading-tight">Gerenciar Vitrine</h1>
                                <p className="text-slate-800 text-[10px] font-bold uppercase tracking-wider opacity-80">Administração</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/admin/simulados/new')}
                            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg active:scale-95 transition-all"
                        >
                            <Plus size={16} /> Novo Simulado
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-5 -mt-6 space-y-6 pb-24">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar simulado pelo nome"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#FFD700] transition-all font-medium"
                        />
                    </div>

                    {/* List Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                {loading ? 'Carregando...' : `Simulados Ativos (${filteredSimulados.length})`}
                            </h2>
                            <button className="p-1.5 text-slate-400">
                                <Filter size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {filteredSimulados.map((sim) => (
                                <div
                                    key={sim.id}
                                    className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group"
                                >
                                    <div className="size-16 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-50 dark:border-slate-700">
                                        {sim.image_url ? (
                                            <img src={sim.image_url} alt={sim.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate leading-tight mb-1">
                                            {sim.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                            <span className="text-blue-600 dark:text-blue-400">R$ {sim.price.toFixed(2)}</span>
                                            <span className="opacity-30">•</span>
                                            <span className="truncate max-w-[100px]">{sim.categories[0]}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/simulados/${sim.id}`)}
                                            className="size-9 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sim.id, sim.title)}
                                            className="size-9 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} />
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
