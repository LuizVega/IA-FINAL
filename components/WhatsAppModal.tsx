
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, MessageCircle, Smartphone, Check, Loader2, Save, FileText, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_TEMPLATE = "Hola *{{TIENDA}}*, me interesa:\n\n{{PEDIDO}}\n\n💰 Total: {{TOTAL}}\n👤 Mis datos: {{CLIENTE}}";

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
  const { saveProfileSettings, settings } = useStore();
  const [phone, setPhone] = useState('');
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
      if (isOpen) {
          setPhone(settings.whatsappNumber || '');
          setTemplate(settings.whatsappTemplate || DEFAULT_TEMPLATE);
      }
  }, [isOpen, settings.whatsappNumber, settings.whatsappTemplate]);

  const handleSave = async () => {
      if (phone.length < 9) return;
      setLoading(true);
      
      try {
          await saveProfileSettings({ 
              whatsappEnabled: true, 
              whatsappNumber: phone,
              whatsappTemplate: template
          });
          onClose();
      } catch (e: any) {
          console.error(e);
          alert(`Error al guardar: ${e.message || "Verifica tu conexión."}`);
      } finally {
          setLoading(false);
      }
  };

  const handleDisconnect = async () => {
      setLoading(true);
      try {
          await saveProfileSettings({ whatsappEnabled: false, whatsappNumber: '' });
          setPhone('');
          onClose();
      } catch (e) {
          alert("Error al desconectar.");
      } finally {
          setLoading(false);
      }
  };

  const resetTemplate = () => {
      setTemplate(DEFAULT_TEMPLATE);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111] w-full max-w-md rounded-3xl shadow-2xl border border-green-500/20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-green-600 p-6 text-center relative overflow-hidden flex-shrink-0">
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

        <div className="p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
                
                {/* Step 1: Number */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">1. Número de Recepción</label>
                    <div className="flex gap-3">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-3 text-gray-400 font-mono text-sm flex items-center select-none">+51</div>
                        <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))}
                            placeholder="999 000 000"
                            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-green-500 outline-none transition-all placeholder-gray-600"
                        />
                    </div>
                </div>

                {/* Step 2: Template Toggle */}
                <div>
                    <button 
                        onClick={() => setShowTemplate(!showTemplate)}
                        className="flex items-center gap-2 text-sm text-green-500 hover:text-green-400 font-medium w-full"
                    >
                        <FileText size={16} /> 
                        {showTemplate ? 'Ocultar Plantilla de Mensaje' : 'Personalizar Mensaje del Cliente'}
                    </button>

                    {showTemplate && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="relative">
                                <textarea 
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm text-gray-300 h-32 focus:border-green-500 outline-none resize-none"
                                />
                                <button onClick={resetTemplate} className="absolute bottom-2 right-2 text-gray-500 hover:text-white p-1" title="Restaurar por defecto">
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-500">
                                <span>Variables:</span>
                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-300">{`{{PEDIDO}}`}</span>
                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-300">{`{{TOTAL}}`}</span>
                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-300">{`{{CLIENTE}}`}</span>
                            </div>
                        </div>
                    )}
                </div>

                <Button 
                    onClick={handleSave} 
                    disabled={phone.length < 6 || loading} 
                    className="w-full py-4 text-base font-bold shadow-lg"
                    isLoading={loading}
                    icon={<Save size={18}/>}
                >
                    Guardar y Activar
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
