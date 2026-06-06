import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../components/ModalContext';
import { supabase } from '../lib/supabase';

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#f9f9ff',
    border: '1px solid #c7c4d7',
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#111c2d',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'Inter, system-ui, sans-serif',
};

export const EditProfileScreen = () => {
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (error && error.code !== 'PGRST116') throw error;
                if (data) {
                    setFormData({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        email: data.email || user.email || '',
                        phone: data.phone || ''
                    });
                }
            } catch (error: any) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');
            const { error } = await supabase.from('profiles').upsert({
                id: user.id, ...formData, updated_at: new Date().toISOString()
            });
            if (error) throw error;
            showAlert('Sucesso', 'Perfil atualizado com sucesso!', 'success');
            navigate('/profile');
        } catch (error: any) {
            console.error('Error saving profile:', error);
            showAlert('Erro', 'Erro ao salvar: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9f9ff' }}>
                <div className="w-12 h-12 border-4 rounded-full animate-spin"
                    style={{ borderColor: '#e7eeff', borderTopColor: '#4648d4' }} />
            </div>
        );
    }

    const fields = [
        { key: 'first_name', label: 'Nome', type: 'text', placeholder: 'Seu nome', required: true },
        { key: 'last_name', label: 'Sobrenome', type: 'text', placeholder: 'Seu sobrenome', required: true },
        { key: 'email', label: 'E-mail de Contato', type: 'email', placeholder: 'seu@email.com', required: true },
        { key: 'phone', label: 'Telefone / WhatsApp', type: 'text', placeholder: '(00) 00000-0000', required: false },
    ] as const;

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#f9f9ff', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

            <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(249,249,255,0.9)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
                <div className="flex items-center p-4 justify-between pt-10 max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate('/profile')}
                        className="size-10 flex items-center justify-start focus:outline-none transition-colors"
                        style={{ color: '#515f74' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#515f74')}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center gap-0.5">
                        <h1 className="text-lg font-bold tracking-tight" style={{ color: '#111c2d' }}>Editar Perfil</h1>
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#767586' }}>Dados Pessoais</p>
                    </div>
                    <div className="size-10" />
                </div>
            </header>

            <main className="flex-1 w-full max-w-2xl mx-auto p-6 overflow-y-auto relative z-10">
                <form onSubmit={handleSave} className="space-y-5 rounded-2xl p-8 animate-fade-in-up"
                    style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.07)' }}>

                    {fields.map(field => (
                        <div key={field.key} className="space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-[0.15em]"
                                style={{ color: '#767586' }}>
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                required={field.required}
                                placeholder={field.placeholder}
                                value={formData[field.key]}
                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                style={inputStyle}
                                onFocus={e => {
                                    e.target.style.borderColor = '#4648d4';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(70,72,212,0.1)';
                                    e.target.style.background = '#ffffff';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#c7c4d7';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.background = '#f9f9ff';
                                }}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm mt-4"
                        style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }}
                        onMouseEnter={e => !saving && (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        {saving
                            ? <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : 'Salvar Alterações'}
                    </button>
                </form>
            </main>
        </div>
    );
};
