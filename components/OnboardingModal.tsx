import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { Sparkles, Store, User, ArrowRight } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
    const { settings, saveProfileSettings, session } = useStore();
    const [name, setName] = useState(settings.displayName || '');
    const [businessName, setBusinessName] = useState(settings.companyName || '');
    const [loading, setLoading] = useState(false);

    // Only show if logged in and missing business name
    if (!session || settings.companyName !== 'Mi Tienda') {
        // We use 'Mi Tienda' as the default value in store.ts. 
        // If it's still 'Mi Tienda', we assume they haven't set it yet.
        // Or we can check if it's empty string if we change the default.
        // Actually, let's just check if it's 'Mi Tienda' as per store.ts initial state.
    }

    // A better check would be in App.tsx to decide whether to render this.
    // For now, let's assume App.tsx renders this if needed.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await saveProfileSettings({
                displayName: name,
                companyName: businessName
            });
            // Success - store update will trigger re-render and hide this modal if logic is in App.tsx
        } catch (error) {
            alert("Error al guardar: " + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-[#111] border border-green-500/30 rounded-[2rem] shadow-[0_0_100px_rgba(34,197,94,0.1)] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col items-center mb-8 text-center relative z-10">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                        <Sparkles className="text-green-500" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">¡Casi listo!</h2>
                    <p className="text-gray-400">Personaliza tu perfil para empezar a vender.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <User size={14} className="text-green-500/50" /> Tu Nombre
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-700"
                            placeholder="Ej: Luis Vega"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Store size={14} className="text-green-500/50" /> Nombre del Negocio
                        </label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-700"
                            placeholder="Ej: Mi Morez Boutique"
                        />
                        <p className="text-[10px] text-gray-500 ml-1">Este nombre aparecerá en tu tienda pública y perfil.</p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-5 text-lg rounded-2xl bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_30px_rgba(34,197,94,0.2)] flex items-center justify-center gap-2"
                        isLoading={loading}
                    >
                        Comenzar Ahora <ArrowRight size={20} />
                    </Button>
                </form>
            </div>
        </div>
    );
};
