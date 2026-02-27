import React from 'react';
import { MessageCircle } from 'lucide-react';

const WA_NUMBER = '51940656460';
const WA_MESSAGE = encodeURIComponent('Hola, necesito ayuda con MyMorez 👋');

interface WhatsAppHelpButtonProps {
    /** 'fixed' = floating bottom-right (default), 'inline' = normal button in a menu */
    variant?: 'fixed' | 'inline';
    className?: string;
}

export const WhatsAppHelpButton: React.FC<WhatsAppHelpButtonProps> = ({ variant = 'fixed', className = '' }) => {
    const href = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

    if (variant === 'fixed') {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`fixed bottom-24 right-4 z-[9990] flex items-center gap-2 bg-green-500 text-black text-xs font-black px-4 py-3 rounded-full shadow-lg shadow-green-500/30 active:scale-95 transition-all hover:bg-green-400 ${className}`}
                title="Ayuda por WhatsApp"
            >
                <MessageCircle size={18} />
                <span>Ayuda</span>
            </a>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 text-green-400 hover:text-green-300 transition-colors active:scale-95 ${className}`}
        >
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center">
                <MessageCircle size={20} />
            </div>
            <div>
                <p className="font-black text-sm text-white">¿Necesitas ayuda?</p>
                <p className="text-white/30 text-xs">+51 940 656 460</p>
            </div>
        </a>
    );
};
