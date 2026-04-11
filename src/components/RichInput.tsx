import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

interface RichInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const RichInput: React.FC<RichInputProps> = ({ value, onChange, placeholder, className }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync external value to internal contentEditable only if it's different and we are not focused
    // to avoid cursor jumping
    useEffect(() => {
        if (editorRef.current && document.activeElement !== editorRef.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string) => {
        document.execCommand(command, false, undefined);
        if (editorRef.current) {
            editorRef.current.focus();
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className={`flex flex-col rounded-xl overflow-hidden border-2 bg-white focus-within:border-slate-900 transition-colors ${className || 'border-slate-200'}`}>
            <div className="flex bg-slate-50 border-b border-slate-200 p-1 gap-1">
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); execCommand('bold'); }}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Negrito"
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); execCommand('italic'); }}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Itálico"
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); execCommand('underline'); }}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Sublinhado"
                >
                    <Underline size={18} />
                </button>
            </div>

            <div
                ref={editorRef}
                className="p-4 text-slate-900 font-medium outline-none min-h-[120px] max-h-[300px] overflow-y-auto cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 bg-white"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                data-placeholder={placeholder}
            />
        </div>
    );
};
