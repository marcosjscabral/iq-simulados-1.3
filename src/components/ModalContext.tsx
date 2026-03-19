import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CustomModal, ModalType } from './CustomModal';

type ModalContextType = {
    showAlert: (title: string, message: string, type?: ModalType) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        type: ModalType;
        title: string;
        message: string;
        onConfirm: () => void;
        onCancel?: () => void;
        confirmText?: string;
        cancelText?: string;
    }>({
        type: 'alert',
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const showAlert = (title: string, message: string, type: ModalType = 'alert') => {
        setModalConfig({
            type,
            title,
            message,
            onConfirm: () => setIsOpen(false),
            confirmText: 'Entendi'
        });
        setIsOpen(true);
    };

    const showConfirm = (title: string, message: string, onConfirmAction: () => void, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar') => {
        setModalConfig({
            type: 'confirm',
            title,
            message,
            onConfirm: () => {
                setIsOpen(false);
                onConfirmAction();
            },
            onCancel: () => setIsOpen(false),
            confirmText,
            cancelText
        });
        setIsOpen(true);
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <CustomModal
                isOpen={isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
            />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
