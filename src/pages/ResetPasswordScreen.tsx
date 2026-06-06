import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../components/ModalContext';
import { supabase } from '../lib/supabase';

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#f9f9ff',
    border: '1px solid #c7c4d7',
    borderRadius: '0.75rem',
    padding: '1rem 3.5rem 1rem 1.25rem',
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#111c2d',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'Inter, system-ui, sans-serif',
};

export const ResetPasswordScreen = () => {
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showAlert('Erro', 'As senhas não coincidem.', 'error');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            showAlert('Sucesso', 'Sua senha foi atualizada!', 'success');
            navigate('/profile');
        } catch (error: any) {
            showAlert('Erro', error.message || 'Erro ao atualizar senha.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const focusStyle = { borderColor: '#4648d4', boxShadow: '0 0 0 3px rgba(70,72,212,0.1)', background: '#ffffff' };
    const blurStyle = { borderColor: '#c7c4d7', boxShadow: 'none', background: '#f9f9ff' };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#f9f9ff', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

            <div className="w-full max-w-md rounded-2xl p-8 relative z-10 animate-fade-in-up"
                style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 8px 24px rgba(71,85,105,0.08)' }}>

                {/* Logo mark */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #4648d4 0%, #6063ee 100%)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight leading-none" style={{ color: '#111c2d' }}>Nova Senha</h1>
                        <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#767586' }}>Crie uma senha segura</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-5">
                    {[
                        { label: 'Senha', value: password, set: setPassword, show: showPassword, toggle: () => setShowPassword(v => !v) },
                        { label: 'Confirmar Senha', value: confirmPassword, set: setConfirmPassword, show: showConfirmPassword, toggle: () => setShowConfirmPassword(v => !v) },
                    ].map(field => (
                        <div key={field.label} className="space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: '#767586' }}>
                                {field.label}
                            </label>
                            <div className="relative">
                                <input
                                    type={field.show ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={field.value}
                                    onChange={e => field.set(e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                                    onBlur={e => Object.assign(e.target.style, blurStyle)}
                                />
                                <button
                                    type="button"
                                    onClick={field.toggle}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: '#767586' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#767586')}
                                >
                                    {field.show ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm mt-2"
                        style={{ background: '#4648d4', color: '#ffffff', boxShadow: '0 4px 16px rgba(70,72,212,0.3)' }}
                        onMouseEnter={e => !loading && (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        {loading
                            ? <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : 'Atualizar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};
