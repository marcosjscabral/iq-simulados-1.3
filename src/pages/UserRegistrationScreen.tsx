import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, ShieldCheck, Plus, Loader2, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Simulado } from '../types';
import { useModal } from '../components/ModalContext';

interface UserData {
    id: string;
    email: string;
    created_at: string;
    is_admin: boolean;
}

interface UserAccess {
    id: string;
    user_id: string;
    simulado_id: string;
    simulados: Simulado;
}

export const UserRegistrationScreen = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserData[]>([]);
    const [simulados, setSimulados] = useState<Simulado[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { showAlert, showConfirm } = useModal();

    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [userAccesses, setUserAccesses] = useState<Record<string, UserAccess[]>>({});
    const [loadingAccess, setLoadingAccess] = useState<string | null>(null);
    const [selectedSimuladoId, setSelectedSimuladoId] = useState<string>('');

    useEffect(() => {
        fetchUsersAndSimulados();
    }, []);

    const fetchUsersAndSimulados = async () => {
        try {
            setLoading(true);
            const { data: userData, error: userError } = await supabase.rpc('get_all_users');
            if (userError) throw userError;

            const { data: simuladoData, error: simError } = await supabase
                .from('simulados')
                .select('*')
                .order('title', { ascending: true });

            if (simError) throw simError;

            setUsers(userData || []);
            setSimulados(simuladoData || []);
        } catch (error: any) {
            console.error('Error fetching data:', error);
            showAlert('Erro', 'Erro ao carregar dados: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadUserAccesses = async (userId: string) => {
        try {
            setLoadingAccess(userId);
            const { data, error } = await supabase
                .from('user_simulados')
                .select(`
          id,
          user_id,
          simulado_id,
          simulados (*)
        `)
                .eq('user_id', userId);

            if (error) throw error;

            setUserAccesses(prev => ({
                ...prev,
                [userId]: data || []
            }));
        } catch (error: any) {
            console.error('Error loading accesses:', error);
        } finally {
            setLoadingAccess(null);
        }
    };

    const toggleUserExpand = (userId: string) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
        } else {
            setExpandedUserId(userId);
            if (!userAccesses[userId]) {
                loadUserAccesses(userId);
            }
        }
    };

    const grantAccess = async (userId: string) => {
        if (!selectedSimuladoId) {
            showAlert('Atenção', 'Selecione um simulado primeiro.', 'alert');
            return;
        }

        try {
            setLoadingAccess(userId);
            const { error } = await supabase
                .from('user_simulados')
                .insert([{ user_id: userId, simulado_id: selectedSimuladoId }]);

            if (error) {
                if (error.code === '23505') {
                    showAlert('Atenção', 'Este usuário já possui acesso a este simulado.', 'alert');
                } else {
                    throw error;
                }
            } else {
                showAlert('Sucesso', 'Acesso concedido com sucesso!', 'success');
                await loadUserAccesses(userId);
                setSelectedSimuladoId('');
            }
        } catch (error: any) {
            console.error('Error granting access:', error);
            showAlert('Erro', 'Erro ao conceder acesso: ' + error.message, 'error');
        } finally {
            setLoadingAccess(null);
        }
    };

    const revokeAccess = async (accessId: string, userId: string) => {
        showConfirm('Revogar Acesso', 'Tem certeza que deseja remover o acesso deste usuário a este simulado?', async () => {
            try {
                setLoadingAccess(userId);
                const { error } = await supabase
                    .from('user_simulados')
                    .delete()
                    .eq('id', accessId);

                if (error) throw error;
                await loadUserAccesses(userId);
            } catch (error: any) {
                console.error('Error revoking access:', error);
                showAlert('Erro', 'Erro ao remover acesso: ' + error.message, 'error');
            } finally {
                setLoadingAccess(null);
            }
        });
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-900">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 pt-12 max-w-6xl mx-auto">
                    <button onClick={() => navigate('/admin')} className="size-10 flex items-center justify-center rounded-2xl bg-slate-100 p-2 text-slate-900 shadow-sm hover:bg-slate-200 transition">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-black leading-tight italic uppercase tracking-tighter">Usuários e Acessos</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Administração</p>
                    </div>
                    <div className="size-10" />
                </div>
            </header>

            <main className="flex-1 p-4 pb-12 max-w-6xl mx-auto">
                <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={20} />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por e-mail..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl h-12 pl-12 pr-4 outline-none focus:ring-2 focus:ring-slate-300 text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={40} className="text-slate-700 animate-spin mb-4" />
                        <p className="text-slate-500 font-semibold text-sm">Carregando usuários...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                                <Users size={32} className="mx-auto text-slate-500 mb-2" />
                                <p className="text-slate-500 font-bold text-sm">Nenhum usuário encontrado.</p>
                            </div>
                        ) : (
                            filteredUsers.map(user => (
                                <div key={user.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                                    <div
                                        onClick={() => toggleUserExpand(user.id)}
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                                                {user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-[15px] truncate">{user.email}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    {user.is_admin && (
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-wider">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-slate-500">
                                            {expandedUserId === user.id ? <ArrowLeft size={20} className="-rotate-90 transition-transform" /> : <ArrowLeft size={20} className="rotate-180 transition-transform" />}
                                        </div>
                                    </div>

                                    {expandedUserId === user.id && (
                                        <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-4">
                                            <div className="space-y-3">
                                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Conceder Acesso</h3>
                                                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                                    <select
                                                        value={selectedSimuladoId}
                                                        onChange={(e) => setSelectedSimuladoId(e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 text-sm text-slate-900 shadow-sm"
                                                    >
                                                        <option value="">Selecione um simulado...</option>
                                                        {simulados.map(sim => (
                                                            <option key={sim.id} value={sim.id}>{sim.title}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => grantAccess(user.id)}
                                                        disabled={loadingAccess === user.id}
                                                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 rounded-2xl font-bold flex items-center justify-center transition shadow-sm disabled:opacity-50"
                                                    >
                                                        {loadingAccess === user.id ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-2">Acessos Atuais</h3>

                                                {loadingAccess === user.id && !userAccesses[user.id] ? (
                                                    <div className="py-4 flex justify-center"><Loader2 size={24} className="text-slate-500 animate-spin" /></div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {(!userAccesses[user.id] || userAccesses[user.id].length === 0) ? (
                                                            <p className="text-sm text-slate-500 italic py-2">Sem simulados vinculados.</p>
                                                        ) : (
                                                            userAccesses[user.id].map(access => (
                                                                <div key={access.id} className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-3">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                                                                        <span className="text-sm font-bold truncate pr-2" title={access.simulados?.title}>
                                                                            {access.simulados?.title || 'Simulado Excluído'}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => revokeAccess(access.id, user.id)}
                                                                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-100 rounded-full transition"
                                                                        title="Revogar Acesso"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
