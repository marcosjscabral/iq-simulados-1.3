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

    const getConfig = () => {
        switch (type) {
            case 'error':
                return {
                    icon: <AlertTriangle size={32} className="text-red-500" />,
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    btnBg: 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                };
            case 'success':
                return {
                    icon: <CheckCircle2 size={32} className="text-emerald-400" />,
                    bg: 'bg-emerald-400/10',
                    border: 'border-emerald-400/20',
                    btnBg: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                };
            case 'confirm':
                return {
                    icon: <AlertTriangle size={32} className="text-amber-400" />,
                    bg: 'bg-amber-400/10',
                    border: 'border-amber-400/20',
                    btnBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                };
            default: // alert
                return {
                    icon: <Info size={32} className="text-blue-400" />,
                    bg: 'bg-blue-400/10',
                    border: 'border-blue-400/20',
                    btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                };
        }
    };

    const config = getConfig();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full max-w-sm rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`shrink-0 size-16 rounded-2xl flex items-center justify-center border ${config.bg} ${config.border}`}>
                            {config.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 italic uppercase tracking-tight leading-tight">{title}</h3>
                        </div>
                    </div>

                    <p className="text-slate-600 text-[15px] font-medium leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        {type === 'confirm' && onCancel && (
                            <button
                                onClick={onCancel}
                                className="flex-[1] py-4 rounded-xl font-bold uppercase tracking-widest text-xs border-2 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`flex-[1.5] py-4 rounded-xl font-black uppercase tracking-widest text-xs text-white shadow-lg transition-all active:scale-95 ${config.btnBg}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
