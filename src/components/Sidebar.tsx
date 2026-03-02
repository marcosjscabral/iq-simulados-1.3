import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    FileText,
    FolderOpen,
    User,
    LogOut,
    X
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
    ];

    const handleNav = (path: string) => {
        navigate(path);
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
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="sidebar-logo">IQ Simulados</span>
                                    <span className="sidebar-tagline">Sua evolução</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full hover:bg-black/10 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <nav className="sidebar-content">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNav(item.path)}
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
