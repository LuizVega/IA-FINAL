
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, MessageCircle, Smartphone, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
  const { updateSettings, settings } = useStore();
  const [step, setStep] = useState<'intro' | 'connecting' | 'connected'>('intro');
  const [phone, setPhone] = useState('');
  
  // Fake pairing code generation
  const [pairingCode, setPairingCode] = useState('');

  useEffect(() => {
      if (isOpen) {
          if (settings.whatsappEnabled) {
              setStep('connected');
          } else {
              setStep('intro');
              setPhone('');
          }
      }
  }, [isOpen, settings.whatsappEnabled]);

  const handleConnect = () => {
      if (phone.length < 9) return;
      setStep('connecting');
      
      // Simulate API call
      setTimeout(() => {
          updateSettings({ whatsappEnabled: true, whatsappNumber: phone });
          setPairingCode(`START-${Math.floor(1000 + Math.random() * 9000)}`);
          setStep('connected');
      }, 2000);
  };

  const handleDisconnect = () => {
      updateSettings({ whatsappEnabled: false, whatsappNumber: undefined });
      setStep('intro');
  };

  const handleTestChat = () => {
      // Open WhatsApp Web with a pre-filled message
      const text = `Hola, quiero probar el bot. Mi código es: ${pairingCode || 'DEMO-KEY'}`;
      window.open(`https://wa.me/51900000000?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111] w-full max-w-md rounded-3xl shadow-2xl border border-green-500/20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-green-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <button onClick={onClose} className="absolute top-4 right-4 text-green-900 hover:text-white transition-colors bg-white/20 rounded-full p-1">
                <X size={20} />
            </button>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <MessageCircle size={36} className="text-green-600" fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">AutoStock Bot</h3>
            <p className="text-green-100 text-xs font-medium opacity-90">Asistente de Inventario 24/7</p>
        </div>

        <div className="p-8">
            {step === 'intro' && (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h4 className="text-lg font-bold text-white">Conecta tu WhatsApp</h4>
                        <p className="text-sm text-gray-400">
                            Ingresa tu número para habilitar el bot. Podrás subir fotos, consultar stock y actualizar precios chateando.
                        </p>
                    </div>

                    <div className="bg-[#050505] p-4 rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-xs">1</div>
                            <p className="text-sm text-gray-300">Agrega el bot a tus contactos.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-xs">2</div>
                            <p className="text-sm text-gray-300">Envía fotos para agregar productos.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-xs">3</div>
                            <p className="text-sm text-gray-300">Recibe alertas de stock bajo.</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Tu Número de Móvil</label>
                        <div className="flex gap-3">
                            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-3 text-gray-400 font-mono text-sm flex items-center select-none">+51</div>
                            <input 
                                type="tel" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))}
                                placeholder="999 000 000"
                                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-green-500 outline-none transition-all placeholder-gray-600"
                                autoFocus
                            />
                        </div>
                    </div>

                    <Button onClick={handleConnect} disabled={phone.length < 6} className="w-full py-4 text-base font-bold shadow-lg">
                        Generar Código de Vinculación
                    </Button>
                </div>
            )}

            {step === 'connecting' && (
                <div className="text-center py-10">
                    <Loader2 size={48} className="text-green-500 animate-spin mx-auto mb-6" />
                    <h4 className="text-lg font-bold text-white mb-2">Conectando...</h4>
                    <p className="text-sm text-gray-500">Configurando tu asistente personal.</p>
                </div>
            )}

            {step === 'connected' && (
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-in zoom-in duration-300">
                        <Check size={32} className="text-black" strokeWidth={3} />
                    </div>
                    
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2">¡Bot Activo!</h4>
                        <p className="text-sm text-gray-400">
                            Tu número <span className="text-green-400 font-mono">{settings.whatsappNumber}</span> está vinculado.
                        </p>
                    </div>

                    <div className="bg-[#050505] p-5 rounded-2xl border border-dashed border-green-500/30">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold">Instrucciones</p>
                        <p className="text-sm text-white mb-4">
                            Para empezar, envía este código al bot en WhatsApp:
                        </p>
                        <div className="bg-[#1a1a1a] py-3 rounded-lg text-2xl font-mono font-bold text-green-400 tracking-widest select-all cursor-pointer hover:bg-[#222] transition-colors border border-white/5">
                            {pairingCode || 'START-8821'}
                        </div>
                        <Button 
                            onClick={handleTestChat}
                            variant="ghost" 
                            className="mt-4 w-full text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            icon={<ArrowRight size={16}/>}
                        >
                            Abrir WhatsApp y Enviar
                        </Button>
                    </div>

                    <Button variant="secondary" onClick={handleDisconnect} className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/10 border-none">
                        Desconectar Bot
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
