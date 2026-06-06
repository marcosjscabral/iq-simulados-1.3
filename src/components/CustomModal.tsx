import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ModalType = 'alert' | 'confirm' | 'success' | 'error';

interface CustomModalProps {
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const CustomModal: React.FC<CustomModalProps> = ({
    isOpen,
    type,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText = 'Cancelar'
}) => {
    if (!isOpen) return null;

    const configs = {
        error: {
            icon: <AlertTriangle size={28} />,
            iconBg: 'rgba(186,26,26,0.08)',
            iconColor: '#ba1a1a',
            iconBorder: 'rgba(186,26,26,0.15)',
            btnBg: '#ba1a1a',
            btnShadow: 'rgba(186,26,26,0.25)',
        },
        success: {
            icon: <CheckCircle2 size={28} />,
            iconBg: 'rgba(26,107,58,0.08)',
            iconColor: '#1a6b3a',
            iconBorder: 'rgba(26,107,58,0.15)',
            btnBg: '#1a6b3a',
            btnShadow: 'rgba(26,107,58,0.25)',
        },
        confirm: {
            icon: <AlertTriangle size={28} />,
            iconBg: 'rgba(180,100,0,0.08)',
            iconColor: '#c47a00',
            iconBorder: 'rgba(180,100,0,0.15)',
            btnBg: '#c47a00',
            btnShadow: 'rgba(180,100,0,0.25)',
        },
        alert: {
            icon: <Info size={28} />,
            iconBg: 'rgba(70,72,212,0.08)',
            iconColor: '#4648d4',
            iconBorder: 'rgba(70,72,212,0.15)',
            btnBg: '#4648d4',
            btnShadow: 'rgba(70,72,212,0.25)',
        },
    };

    const cfg = configs[type] || configs.alert;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(17,28,45,0.2)', backdropFilter: 'blur(8px)' }}
        >
            <div
                className="w-full max-w-sm rounded-2xl overflow-hidden animate-fade-in-up"
                style={{ background: '#ffffff', border: '1px solid #e7eeff', boxShadow: '0 24px 48px -12px rgba(17,28,45,0.12)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="shrink-0 size-14 rounded-xl flex items-center justify-center"
                            style={{ background: cfg.iconBg, border: `1px solid ${cfg.iconBorder}`, color: cfg.iconColor }}>
                            {cfg.icon}
                        </div>
                        <h3 className="text-lg font-bold leading-tight tracking-tight" style={{ color: '#111c2d' }}>
                            {title}
                        </h3>
                    </div>

                    <p className="text-sm font-medium leading-relaxed mb-7" style={{ color: '#464554' }}>
                        {message}
                    </p>

                    <div className="flex gap-3">
                        {type === 'confirm' && onCancel && (
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                                style={{ border: '1px solid #c7c4d7', color: '#515f74', background: 'transparent' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f3ff'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className="flex-[1.5] py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs text-white transition-all active:scale-95"
                            style={{ background: cfg.btnBg, boxShadow: `0 4px 16px ${cfg.btnShadow}` }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
