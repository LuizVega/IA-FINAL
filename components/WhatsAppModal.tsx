
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, MessageCircle, Smartphone, Check, Loader2, Save } from 'lucide-react';
import { Button } from './ui/Button';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
  const { updateSettings, settings } = useStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (isOpen) {
          setPhone(settings.whatsappNumber || '');
      }
  }, [isOpen, settings.whatsappNumber]);

  const handleSave = () => {
      if (phone.length < 9) return;
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
          updateSettings({ whatsappEnabled: true, whatsappNumber: phone });
          setLoading(false);
          onClose();
      }, 800);
  };

  const handleDisconnect = () => {
      updateSettings({ whatsappEnabled: false, whatsappNumber: undefined });
      setPhone('');
      onClose();
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
            <h3 className="text-xl font-bold text-white mb-1">Pedidos por WhatsApp</h3>
            <p className="text-green-100 text-xs font-medium opacity-90">Conecta tu catálogo con tu móvil</p>
        </div>

        <div className="p-8">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h4 className="text-lg font-bold text-white">¿Dónde recibirás los pedidos?</h4>
                    <p className="text-sm text-gray-400">
                        Ingresa tu número de WhatsApp. Cuando un cliente haga un pedido desde tu tienda pública, te llegará un mensaje pre-llenado a este número.
                    </p>
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

                <Button 
                    onClick={handleSave} 
                    disabled={phone.length < 6 || loading} 
                    className="w-full py-4 text-base font-bold shadow-lg"
                    isLoading={loading}
                    icon={<Save size={18}/>}
                >
                    Guardar Número
                </Button>

                {settings.whatsappEnabled && (
                    <button 
                        onClick={handleDisconnect}
                        className="w-full text-xs text-red-400 hover:text-red-300 hover:underline mt-2"
                    >
                        Desvincular número actual
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
