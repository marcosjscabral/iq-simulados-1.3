import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import './AuthStyles.css';

export const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [capsLockActive, setCapsLockActive] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleKeyUp = (e: React.KeyboardEvent) => {
        if (e.getModifierState('CapsLock')) {
            setCapsLockActive(true);
        } else {
            setCapsLockActive(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                if (data.user && !data.user.email_confirmed_at) {
                    await supabase.auth.signOut();
                    throw new Error('Email not confirmed');
                }
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth-callback`,
                    }
                });
                if (error) throw error;

                if (data.session) {
                    await supabase.auth.signOut();
                }

                setMessage('Verifique seu e-mail para confirmar seu cadastro! O link expira em breve.');
            }
        } catch (err: any) {
            console.error('Auth error:', err);

            let errMsg = err?.message || err?.error_description || (typeof err === 'string' ? err : 'Erro desconhecido');
            if (typeof errMsg === 'object') {
                errMsg = JSON.stringify(errMsg);
            }
            if (errMsg === '{}') {
                errMsg = 'Serviço de e-mail temporariamente indisponível no servidor (limite excedido). Configure um SMTP customizado.';
            }

            const translatedError = errMsg === 'User already registered'
                ? 'Este e-mail já está cadastrado.'
                : errMsg === 'Invalid login credentials'
                    ? 'E-mail ou senha incorretos.'
                    : errMsg === 'Email not confirmed'
                        ? 'Por favor, confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada ou spam.'
                        : errMsg.includes('Password should be at least')
                            ? 'A senha deve ter pelo menos 6 caracteres.'
                            : errMsg.includes('rate_limit')
                                ? 'Muitas tentativas. Tente novamente mais tarde.'
                                : errMsg;

            setError(translatedError || 'Ocorreu um erro na autenticação');
        } finally {
            setLoading(false);
        }
    };
    const handleResetPassword = async () => {
        if (!email) {
            setError('Digite seu e-mail para recuperar a senha.');
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setMessage('Link de recuperação enviado para seu e-mail!');
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar e-mail de recuperação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="auth-card"
            >
                <div className="auth-header">
                    <span className="auth-logo">IQ Simulados</span>
                    <p className="auth-subtitle">
                        {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta gratuita'}
                    </p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Cadastro
                    </button>
                </div>

                <form onSubmit={handleAuth} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyUp={handleKeyUp}
                                className="auth-input password-input"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle-button"
                                aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {capsLockActive && (
                            <span className="caps-lock-warning">
                                Caps Lock Ativado
                            </span>
                        )}
                        {isLogin && (
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className="forgot-password-link"
                            >
                                Esqueci a senha
                            </button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="auth-error"
                            >
                                {error}
                            </motion.div>
                        )}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="auth-success"
                            >
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};
