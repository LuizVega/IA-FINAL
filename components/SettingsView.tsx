
import React from 'react';
import { useStore } from '../store';
import { Building2, Coins, ReceiptText, CheckCircle2, Clock, MessageCircle, Bot, Share2 } from 'lucide-react';
import { PromoBanner } from './PromoBanner';
import { Button } from './ui/Button';
import { WhatsAppModal } from './WhatsAppModal';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, isWhatsAppModalOpen, setWhatsAppModalOpen } = useStore();

  return (
    <div className="p-6 max-w-6xl mx-auto custom-scrollbar overflow-y-auto h-full pb-20 space-y-12">
      
      {/* Header */}
      <div>
         <h2 className="text-3xl font-bold text-white mb-2">Configuración del Sistema</h2>
         <p className="text-gray-500">Gestiona los parámetros de tu empresa y preferencias.</p>
      </div>
      
      {/* Integrations Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] rounded-3xl border border-green-500/20 p-6 relative overflow-hidden group md:col-span-2">
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-green-500/10 transition-all"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                  <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500 shadow-lg shadow-green-900/20">
                          <MessageCircle size={32} strokeWidth={1.5} />
                      </div>
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-white">Asistente IA WhatsApp</h3>
                              {settings.whatsappEnabled ? (
                                  <span className="text-[10px] bg-green-500 text-black font-bold px-2 py-0.5 rounded-full">ACTIVO</span>
                              ) : (
                                  <span className="text-[10px] bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded-full">DESCONECTADO</span>
                              )}
                          </div>
                          <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                              Conecta tu negocio a WhatsApp para agregar items enviando fotos, consultar stock con voz y recibir alertas automáticas.
                          </p>
                      </div>
                  </div>
                  
                  <Button 
                    onClick={() => setWhatsAppModalOpen(true)}
                    className={`${settings.whatsappEnabled ? 'bg-[#1a1a1a] text-white border border-white/10' : 'bg-green-600 text-black hover:bg-green-500'} font-bold shadow-xl`}
                  >
                      {settings.whatsappEnabled ? 'Configurar Bot' : 'Conectar Ahora'}
                  </Button>
              </div>
              
              {settings.whatsappEnabled && (
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                          <Bot size={14} className="text-green-500" />
                          <span>Respuestas Automáticas: <span className="text-white">Activadas</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                          <Share2 size={14} className="text-green-500" />
                          <span>Catálogo Sincronizado</span>
                      </div>
                  </div>
              )}
          </div>

          {/* More integrations placeholder */}
          <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-6 flex flex-col justify-center items-center text-center opacity-60">
              <div className="w-12 h-12 bg-gray-800 rounded-xl mb-4 flex items-center justify-center">
                  <Coins size={24} className="text-gray-500" />
              </div>
              <h4 className="font-bold text-white mb-1">Facturación</h4>
              <p className="text-xs text-gray-500 mb-4">Integración con SUNAT/DIAN</p>
              <span className="text-[10px] border border-white/10 px-2 py-1 rounded text-gray-400">Próximamente</span>
          </div>
      </div>

      {/* General Settings */}
      <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
        
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
          <Building2 size={24} className="text-green-500" />
          Datos de la Empresa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre Comercial</label>
            <input 
              type="text" 
              value={settings.companyName}
              onChange={(e) => updateSettings({ companyName: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-700 font-medium"
              placeholder="Mi Empresa S.A."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Coins size={12} /> Moneda Base
            </label>
            <select 
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 outline-none appearance-none"
            >
              <option value="USD">Dólar (USD)</option>
              <option value="PEN">Sol Peruano (PEN)</option>
              <option value="MXN">Peso Mexicano (MXN)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="COP">Peso Colombiano (COP)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <ReceiptText size={12} /> Impuesto (IGV/IVA)
            </label>
             <div className="relative">
               <input 
                type="number" 
                value={Math.round(settings.taxRate * 100)}
                onChange={(e) => updateSettings({ taxRate: parseFloat(e.target.value) / 100 })}
                className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 outline-none transition-all font-mono pr-8"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
             </div>
             <p className="text-[10px] text-gray-600 mt-1">Usado para cálculo de precios netos.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} /> Umbral de Estancamiento
            </label>
             <div className="relative">
               <input 
                type="number" 
                value={settings.stagnantDaysThreshold || 90}
                onChange={(e) => updateSettings({ stagnantDaysThreshold: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 outline-none transition-all font-mono pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">DÍAS</span>
             </div>
             <p className="text-[10px] text-gray-600 mt-1">Días sin movimiento para alerta.</p>
          </div>
        </div>
      </div>

      {/* PROMOTIONAL BANNER */}
      <PromoBanner />

      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setWhatsAppModalOpen(false)} />
    </div>
  );
};
