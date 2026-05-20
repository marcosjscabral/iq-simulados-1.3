import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../components/ModalContext';
import { supabase } from '../lib/supabase';

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

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-2xl bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Nova Senha</h1>
        <p className="text-slate-500 text-sm mb-8 uppercase tracking-[0.2em] font-bold">Crie uma senha segura para sua conta</p>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 pr-12 text-sm font-medium focus:border-slate-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirmar Senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 pr-12 text-sm font-medium focus:border-slate-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm uppercase tracking-widest text-sm"
          >
            {loading ? <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};
