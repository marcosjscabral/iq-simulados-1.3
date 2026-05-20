import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Simulado } from './types';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import AdminSimulados from './pages/AdminSimulados';
import AdminListSimulados from './pages/AdminListSimulados';
import AdminCoupons from './pages/AdminCoupons';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MyExamsScreen } from './pages/MyExamsScreen';
import { UserRegistrationScreen } from './pages/UserRegistrationScreen';
import { AdminQuestoesScreen } from './pages/AdminQuestoesScreen';
import { ExamExecutionScreen } from './pages/ExamExecutionScreen';
import { PurchaseHistoryScreen } from './pages/PurchaseHistoryScreen';
import { PremiumStorefrontScreen } from './pages/PremiumStorefrontScreen';
import { ModalProvider } from './components/ModalContext';

// Import newly refactored screen components
import { HomeScreen } from './pages/HomeScreen';
import { MaterialsScreen } from './pages/MaterialsScreen';
import { AnswerKeyScreen } from './pages/AnswerKeyScreen';
import { ResetPasswordScreen } from './pages/ResetPasswordScreen';
import { EditProfileScreen } from './pages/EditProfileScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { AdminDashboardScreen } from './pages/AdminDashboardScreen';

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [simulados, setSimulados] = useState<Simulado[]>([]);

  useEffect(() => {
    const checkUser = async (user: SupabaseUser | null) => {
      if (user && !user.email_confirmed_at) {
        await supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(user);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUser(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);

      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password';
        return;
      }

      checkUser(session?.user ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSimulados = async () => {
    try {
      const { data, error } = await supabase
        .from('simulados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSimulados(data);
    } catch (error) {
      console.error('Error fetching simulados:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSimulados();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={() => { }} />;
  }

  const uniqueCategories = Array.from(new Set(simulados.flatMap(s => s.categories || [])));

  return (
    <ModalProvider>
      <Router>
        <div className="relative flex min-h-screen w-full flex-col lg:flex-row bg-slate-50">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />

          <div className="flex-1 min-w-0 flex flex-col relative w-full">
            <Routes>
              <Route path="/" element={
                <HomeScreen
                  onOpenMenu={() => setSidebarOpen(true)}
                  setView={() => { }}
                  simulados={simulados}
                />
              } />
              <Route path="/my-exams" element={
                <MyExamsScreen onOpenMenu={() => setSidebarOpen(true)} />
              } />
              <Route path="/materials" element={
                <MaterialsScreen onOpenMenu={() => setSidebarOpen(true)} setView={() => { }} />
              } />
              <Route path="/profile" element={
                <ProfileScreen
                  onOpenMenu={() => setSidebarOpen(true)}
                  onLogout={handleLogout}
                />
              } />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              <Route path="/profile/edit" element={<EditProfileScreen />} />
              <Route path="/profile/purchases" element={<PurchaseHistoryScreen />} />
              <Route path="/exam/:id" element={<ExamExecutionScreen />} />
              <Route path="/exam/:id/answer-key" element={<AnswerKeyScreen />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />

              {/* Admin Routes (Protected) */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboardScreen onOpenMenu={() => setSidebarOpen(true)} />
                </ProtectedRoute>
              } />
              <Route path="/admin/list" element={
                <ProtectedRoute requireAdmin>
                  <AdminListSimulados onPublishSuccess={fetchSimulados} />
                </ProtectedRoute>
              } />
              <Route path="/admin/simulados/new" element={
                <ProtectedRoute requireAdmin>
                  <AdminSimulados onPublishSuccess={fetchSimulados} availableCategories={uniqueCategories} />
                </ProtectedRoute>
              } />
              <Route path="/admin/simulados/:id" element={
                <ProtectedRoute requireAdmin>
                  <AdminSimulados onPublishSuccess={fetchSimulados} availableCategories={uniqueCategories} />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                  <UserRegistrationScreen />
                </ProtectedRoute>
              } />
              <Route path="/admin/questoes" element={
                <ProtectedRoute requireAdmin>
                  <AdminQuestoesScreen />
                </ProtectedRoute>
              } />
              <Route path="/admin/coupons" element={
                <ProtectedRoute requireAdmin>
                  <AdminCoupons />
                </ProtectedRoute>
              } />

              <Route path="/premium/:id" element={
                <ProtectedRoute>
                  <PremiumStorefrontScreen />
                </ProtectedRoute>
              } />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ModalProvider>
  );
}
