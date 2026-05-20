import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../components/ModalContext';
import { supabase } from '../lib/supabase';

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

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

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

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-display text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
          <button onClick={() => navigate('/profile')} className="size-10 flex items-center justify-start text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight text-slate-900 italic uppercase tracking-tighter">Editar Perfil</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Dados Pessoais</p>
          </div>
          <div className="size-10" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-8 overflow-y-auto">
        <form onSubmit={handleSave} className="space-y-6 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:border-slate-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sobrenome</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:border-slate-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">E-mail de Contato</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:border-slate-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Telefone / WhatsApp</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:border-slate-400 outline-none transition-all"
              placeholder="(00) 00000-0000"
            />
          </div>

          <button
            disabled={saving}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm uppercase tracking-widest text-sm"
          >
            {saving ? <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Salvar Alterações'}
          </button>
        </form>
      </main>
    </div>
  );
};
