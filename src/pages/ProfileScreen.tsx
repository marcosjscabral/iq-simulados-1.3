import React, { useState, useEffect } from 'react';
import { Menu, Settings, User, Edit, Receipt, ChevronRight, ShieldCheck, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../components/ModalContext';
import { supabase } from '../lib/supabase';

interface ProfileScreenProps {
  onOpenMenu: () => void;
  onLogout: () => void;
}

export const ProfileScreen = ({ onOpenMenu, onLogout }: ProfileScreenProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('Usuário');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAdmin(user.app_metadata?.is_admin === true || user.user_metadata?.is_admin === true);

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (profile?.first_name) {
          setUserName(profile.first_name);
        } else {
          const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
          const firstName = fullName.split(' ')[0];
          setUserName(firstName);
        }

        if (user.user_metadata?.avatar_url) {
          setUserAvatar(user.user_metadata.avatar_url);
        }
      }
    };
    fetchUser();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('simulados')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('simulados')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setUserAvatar(publicUrl);
      showAlert('Sucesso', 'Foto de perfil atualizada!', 'success');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showAlert('Erro', 'Erro ao fazer upload: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    showConfirm(
      'Alterar Senha?',
      'Tem certeza que deseja alterar sua senha atual?',
      async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.email) return;

          const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;
          showAlert('Sucesso', 'E-mail de redefinição enviado para ' + user.email, 'success');
        } catch (error: any) {
          showAlert('Erro', 'Erro ao solicitar troca: ' + error.message, 'error');
        }
      },
      'Alterar',
      'Cancelar'
    );
  };

  return (
    <div className="bg-bg-primary min-h-screen flex flex-col font-interface text-text-primary select-none">
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-slate-900 shadow-sm">
        <div className="flex items-center p-4 justify-between pt-12 max-w-5xl mx-auto">
          <button onClick={onOpenMenu} className="size-10 flex items-center justify-start text-text-primary hover:text-brand-purple focus:outline-none transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black leading-tight italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400">Perfil</h1>
            <p className="text-[9px] uppercase tracking-[0.25em] text-text-secondary font-black mt-1">Conta</p>
          </div>
          <div className="size-10 flex items-center justify-end">
            {isAdmin ? (
              <button onClick={() => navigate('/admin')} className="rounded-xl bg-surface-card p-2.5 text-text-primary hover:border-brand-purple/50 active:scale-95 transition-all shadow-lg border border-slate-800 cursor-pointer">
                <Settings size={18} />
              </button>
            ) : <div className="size-10" />}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto pb-24 px-4 overflow-y-auto">
        <section className="flex flex-col items-center py-10">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-full border-4 border-slate-800 p-1 bg-slate-900 shadow-xl ${uploading ? 'opacity-50' : ''} overflow-hidden transition-all duration-300 group-hover:border-brand-purple`}>
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                  <User size={56} className="text-text-secondary" />
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-brand-purple text-text-primary p-2 rounded-xl shadow-lg border border-slate-900 cursor-pointer hover:scale-110 active:scale-95 transition-all">
              {uploading ? (
                <Loader2 size={14} className="animate-spin text-text-primary" />
              ) : (
                <Edit size={14} />
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-xl font-black tracking-wider uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400">{userName}</h2>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary mb-4 px-2">Configurações e Segurança</h3>
          <div className="bg-surface-card rounded-2xl overflow-hidden divide-y divide-slate-900 border border-slate-800 shadow-xl">
            <button
              onClick={() => navigate('/profile/purchases')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-11 rounded-xl bg-bg-primary text-brand-purple border border-slate-900">
                  <Receipt size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm text-text-primary">Histórico de Pedidos</span>
                  <span className="block text-[8px] text-text-secondary uppercase font-bold tracking-widest">Acessar todas as compras</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary" />
            </button>

            <button onClick={() => navigate('/profile/edit')} className="w-full flex items-center justify-between p-5 hover:bg-slate-800/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-11 rounded-xl bg-bg-primary text-brand-purple border border-slate-900">
                  <User size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm text-text-primary">Editar Dados Pessoais</span>
                  <span className="block text-[8px] text-text-secondary uppercase font-bold tracking-widest">Nome, e-mail e telefone</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary" />
            </button>

            <button onClick={handlePasswordChange} className="w-full flex items-center justify-between p-5 hover:bg-slate-800/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-11 rounded-xl bg-bg-primary text-brand-purple border border-slate-900">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm text-text-primary">Trocar Senha</span>
                  <span className="block text-[8px] text-text-secondary uppercase font-bold tracking-widest">Enviar e-mail de redefinição</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
          </div>
        </section>

        <section className="mt-12 pb-12">
          <button
            onClick={onLogout}
            className="w-full bg-error-red/10 hover:bg-error-red text-error-red hover:text-text-primary font-black py-4.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] border border-error-red/15 hover:border-error-red hover:shadow-lg hover:shadow-error-red/10 uppercase tracking-widest text-xs cursor-pointer"
          >
            <LogOut size={16} /> Sair da Conta
          </button>
        </section>
      </main>
    </div>
  );
};
