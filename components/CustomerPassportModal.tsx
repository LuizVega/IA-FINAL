import React, { useState } from 'react';
import { useStore } from '../store';
import { X, Phone, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

export const CustomerPassportModal: React.FC<{ isOpen: boolean; onClose: () => void; shopName: string }> = ({ isOpen, onClose, shopName }) => {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [step, setStep] = useState<'info' | 'register' | 'success'>('info');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulating lead capture / stamp registration
        // In a real scenario, this would call Supabase to register the lead for this vendor
        setTimeout(() => {
            setLoading(false);
            setStep('success');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[40px] shadow-2xl p-8 relative overflow-hidden">
                {/* Visual accents */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 blur-[60px] rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-500/10 blur-[60px] rounded-full"></div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {step === 'info' && (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mb-6 border border-green-500/20">
                            <Sparkles className="text-green-400" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 leading-tight">¡Bienvenido a {shopName}!</h2>
                        <p className="text-gray-400 text-sm mb-8 px-2">
                            Únete a nuestro Pasaporte Digital para recibir ofertas exclusivas y acumular sellos por cada compra.
                        </p>
                        <Button
                            onClick={() => setStep('register')}
                            className="w-full py-4 text-lg rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        >
                            Obtener mi Pasaporte
                        </Button>
                    </div>
                )}

                {step === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="text-center mb-2">
                            <h2 className="text-2xl font-black text-white mb-1 italic uppercase">Registro Rápido</h2>
                            <p className="text-gray-500 text-xs">Sin contraseñas, solo tu contacto.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Tu Nombre</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-green-500 outline-none transition-all placeholder-gray-800"
                                    placeholder="Ej: Luis Vega"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Teléfono WhatsApp</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 pl-12 text-white focus:border-green-500 outline-none transition-all placeholder-gray-800"
                                        placeholder="Tu número"
                                    />
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            isLoading={loading}
                            className="w-full py-4 text-lg rounded-2xl"
                        >
                            Confirmar Registro
                        </Button>
                    </form>
                )}

                {step === 'success' && (
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30 scale-in duration-500">
                            <CheckCircle className="text-green-400" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">¡Ya estás dentro!</h2>
                        <p className="text-gray-400 text-sm mb-8">
                            Tu pasaporte está activo. Tu siguiente compra en <b>{shopName}</b> te dará tu primer sello digital.
                        </p>
                        <Button
                            onClick={onClose}
                            variant="secondary"
                            className="w-full py-4 rounded-2xl"
                        >
                            Empezar a comprar
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
