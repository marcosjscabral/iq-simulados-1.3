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
        <div className={`flex flex-col rounded-xl overflow-hidden border-2 bg-[#0f172a] focus-within:border-[#ffd700] transition-colors ${className || 'border-[#334155]'}`}>
            <div className="flex bg-[#1e293b] border-b-2 border-inherit p-1 gap-1">
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); execCommand('bold'); }}
                    className="p-1.5 rounded-lg text-slate-300 hover:bg-black/20 hover:text-white transition-colors"
                    title="Negrito"
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); execCommand('italic'); }}
                    className="p-1.5 rounded-lg text-slate-300 hover:bg-black/20 hover:text-white transition-colors"
                    title="Itálico"
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); execCommand('underline'); }}
                    className="p-1.5 rounded-lg text-slate-300 hover:bg-black/20 hover:text-white transition-colors"
                    title="Sublinhado"
                >
                    <Underline size={18} />
                </button>
            </div>

            <div
                ref={editorRef}
                className="p-4 text-white font-medium outline-none min-h-[120px] max-h-[300px] overflow-y-auto cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                data-placeholder={placeholder}
            />
        </div>
    );
};
