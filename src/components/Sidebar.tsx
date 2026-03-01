import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Home,
    FileText,
    FolderOpen,
    User,
    LogOut,
    X
} from 'lucide-react';
import { View } from '../types';
import './SidebarStyles.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentView: View;
    setView: (v: View) => void;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    currentView,
    setView,
    onLogout
}) => {
    const navItems = [
        { id: 'home', label: 'Vitrine', icon: Home },
        { id: 'my-exams', label: 'Meus Simulados', icon: FileText },
        { id: 'materials', label: 'Materiais', icon: FolderOpen },
        { id: 'profile', label: 'Meu Perfil', icon: User },
    ];

    const handleNav = (view: View) => {
        setView(view);
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
                                    key={item.id}
                                    onClick={() => handleNav(item.id as View)}
                                    className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
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
