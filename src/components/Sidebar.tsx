import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    FileText,
    FolderOpen,
    User,
    LogOut,
    X,
    Sparkles
} from 'lucide-react';
import './SidebarStyles.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    onLogout
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Vitrine', icon: Home },
        { path: '/my-exams', label: 'Meus Simulados', icon: FileText },
        { path: '/materials', label: 'Materiais', icon: FolderOpen },
        { path: '/profile', label: 'Meu Perfil', icon: User },
        { path: '/IQ_Concursos_App_v. 2.0.0/preparaai', label: 'PreparaAI v2.0', icon: Sparkles, external: true },
    ];

    const handleNav = (item: typeof navItems[0]) => {
        if (item.external) {
            window.location.href = item.path;
        } else {
            navigate(item.path);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="sidebar-overlay"
                    />

                    {/* Sidebar Menu */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="sidebar-menu"
                    >
                        <div className="sidebar-header">
                            <div className="flex justify-between items-center gap-4">
                                <div>
                                    <span className="sidebar-logo">IQ Simulados</span>
                                    <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500 font-semibold">Menu principal</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <nav className="sidebar-content">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNav(item)}
                                    className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    <item.icon size={22} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="sidebar-footer">
                            <button
                                onClick={() => {
                                    onLogout();
                                    onClose();
                                }}
                                className="sidebar-logout"
                            >
                                <LogOut size={20} />
                                <span>Sair da Conta</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
