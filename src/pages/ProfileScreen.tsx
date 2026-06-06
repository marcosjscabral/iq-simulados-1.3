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

  const menuItems = [
    {
      icon: Receipt,
      label: 'Histórico de Pedidos',
      sub: 'Acessar todas as compras',
      onClick: () => navigate('/profile/purchases'),
    },
    {
      icon: User,
      label: 'Editar Dados Pessoais',
      sub: 'Nome, e-mail e telefone',
      onClick: () => navigate('/profile/edit'),
    },
    {
      icon: ShieldCheck,
      label: 'Trocar Senha',
      sub: 'Enviar e-mail de redefinição',
      onClick: handlePasswordChange,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col select-none relative overflow-x-hidden" style={{ background: '#f9f9ff' }}>

      {/* Decorative background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(225,224,255,0.35) 0%, transparent 70%)', transform: 'translate(25%, -25%)' }} />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(249,249,255,0.85)', backdropFilter: 'blur(12px)', borderColor: '#e7eeff' }}>
        <div className="flex items-center p-4 justify-between pt-10 max-w-5xl mx-auto">
          <button
            onClick={onOpenMenu}
            className="size-10 flex items-center justify-start focus:outline-none transition-colors"
            style={{ color: '#515f74' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4648d4')}
            onMouseLeave={e => (e.currentTarget.style.color = '#515f74')}
          >
            <Menu size={24} />
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <h1 className="text-lg font-bold tracking-tight" style={{ color: '#111c2d' }}>Perfil</h1>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#767586' }}>Conta</p>
          </div>

          <div className="size-10 flex items-center justify-end">
            {isAdmin ? (
              <button
                onClick={() => navigate('/admin')}
                className="rounded-xl p-2.5 active:scale-95 transition-all shadow-sm cursor-pointer"
                style={{ background: '#ffffff', border: '1px solid #e7eeff', color: '#515f74' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4648d4'; (e.currentTarget as HTMLElement).style.color = '#4648d4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e7eeff'; (e.currentTarget as HTMLElement).style.color = '#515f74'; }}
              >
                <Settings size={18} />
              </button>
            ) : <div className="size-10" />}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto pb-24 px-4 overflow-y-auto relative z-10">

        {/* Avatar Section */}
        <section className="flex flex-col items-center py-10 animate-fade-in-up">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-full p-1 overflow-hidden transition-all duration-300 ${uploading ? 'opacity-50' : ''}`}
              style={{ border: '3px solid #e7eeff', background: '#f0f3ff', boxShadow: '0 8px 24px rgba(70,72,212,0.1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4648d4'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e7eeff'; }}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center"
                  style={{ background: '#f0f3ff' }}>
                  <User size={52} style={{ color: '#c7c4d7' }} />
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 p-2 rounded-xl shadow-md cursor-pointer transition-all hover:scale-110 active:scale-95"
              style={{ background: '#4648d4', color: '#ffffff', border: '2px solid #ffffff' }}>
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Edit size={14} />
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>

          <div className="mt-5 text-center">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: '#111c2d' }}>{userName}</h2>
            <p className="text-sm mt-1" style={{ color: '#767586' }}>Minha Conta</p>
          </div>
        </section>

        {/* Settings Menu */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 px-1" style={{ color: '#767586' }}>
            Configurações e Segurança
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 4px 16px rgba(71,85,105,0.06)' }}>
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                className="w-full flex items-center justify-between p-5 transition-colors cursor-pointer"
                style={{ borderBottom: idx < menuItems.length - 1 ? '1px solid #f0f3ff' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9f9ff')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-11 rounded-xl"
                    style={{ background: '#f0f3ff', border: '1px solid #e7eeff', color: '#4648d4' }}>
                    <item.icon size={20} />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold text-sm" style={{ color: '#111c2d' }}>{item.label}</span>
                    <span className="block text-[11px] font-medium mt-0.5" style={{ color: '#767586' }}>{item.sub}</span>
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: '#c7c4d7' }} />
              </button>
            ))}
          </div>
        </section>

        {/* Logout */}
        <section className="mt-6 pb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={onLogout}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] font-bold uppercase tracking-widest text-xs cursor-pointer"
            style={{ background: 'rgba(186,26,26,0.05)', color: '#ba1a1a', border: '1px solid rgba(186,26,26,0.12)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ba1a1a'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(186,26,26,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(186,26,26,0.05)'; (e.currentTarget as HTMLElement).style.color = '#ba1a1a'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <LogOut size={16} /> Sair da Conta
          </button>
        </section>
      </main>
    </div>
  );
};
