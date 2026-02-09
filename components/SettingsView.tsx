
import React from 'react';
import { useStore } from '../store';
import { Building2, Coins, ReceiptText, Zap, Bot, CheckCircle2, Lock } from 'lucide-react';
import { Button } from './ui/Button';
import { PromoBanner } from './PromoBanner';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, claimOffer } = useStore();

  return (
    <div className="p-6 max-w-6xl mx-auto custom-scrollbar overflow-y-auto h-full pb-20 space-y-12">
      
      {/* Header */}
      <div>
         <h2 className="text-3xl font-bold text-white mb-2">Configuración del Sistema</h2>
         <p className="text-gray-500">Gestiona los parámetros de tu empresa y mejora tu plan.</p>
      </div>
      
      {/* General Settings */}
      <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
        
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
          <Building2 size={24} className="text-green-500" />
          Datos de la Empresa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
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
        </div>
      </div>

      {/* PROMOTIONAL BANNER */}
      <PromoBanner />

      {/* Pricing / Upgrade Section */}
      <div className="space-y-8 pt-6">
         <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Planes Mype
            </span>
            <h2 className="text-4xl font-bold text-white tracking-tight">Crece sin límites</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-end">
            
            {/* STARTER (Free) */}
            <div className="bg-[#111] rounded-3xl p-8 border border-white/5 flex flex-col relative group hover:border-white/10 transition-all h-[500px]">
                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                <div className="text-3xl font-bold text-white mb-6">$0 <span className="text-sm font-medium text-gray-500">/mes</span></div>
                <p className="text-gray-400 text-sm mb-6">
                    Perfecto para empezar. Importa tu inventario y organízate sin coste.
                </p>
                <div className="space-y-4 mb-8 flex-1">
                    <FeatureItem text="50 Items" active />
                    <FeatureItem text="1 Usuario" active />
                    <FeatureItem text="Importación Excel/CSV" active color="text-gray-200 font-bold" />
                    <FeatureItem text="Generación QR Básica" active={false} />
                    <FeatureItem text="Códigos de Barras" active={false} />
                </div>
                <Button className="w-full bg-white/10 text-white hover:bg-white/20 border-none" disabled>
                    Tu Plan Actual
                </Button>
            </div>

            {/* GROWTH (Standard) */}
            <div className="bg-[#111] rounded-3xl p-8 border border-green-500/30 flex flex-col relative group hover:border-green-400 transition-all shadow-lg hover:shadow-green-900/20 transform md:-translate-y-4 h-[540px] z-10">
                <div className="absolute top-0 inset-x-0 h-1 bg-green-500 rounded-t-3xl"></div>
                <div className="absolute top-4 right-4 bg-green-500 text-black text-[10px] font-bold px-3 py-1 rounded-full">
                    MYPE FAVORITO
                </div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Zap size={18} className="text-green-500" /> Growth
                </h3>
                <div className="text-4xl font-bold text-white mb-6">$9.90 <span className="text-sm font-medium text-gray-500">/mes</span></div>
                <p className="text-gray-300 text-sm mb-6">
                    Herramientas profesionales de etiquetado y alertas para negocios activos.
                </p>
                <div className="space-y-4 mb-8 flex-1">
                    <FeatureItem text="2,000 Items" active />
                    <FeatureItem text="Importación Ilimitada" active />
                    <FeatureItem text="Generación Códigos de Barras" active color="text-green-400 font-bold" icon={<Zap size={14}/>} />
                    <FeatureItem text="Códigos QR" active />
                    <FeatureItem text="Alertas Stock Bajo" active />
                    <FeatureItem text="Marca Personalizada (Logo)" active />
                </div>
                
                {settings.hasClaimedOffer ? (
                     <div className="w-full py-3 rounded-xl bg-green-500/20 text-green-400 font-bold text-sm flex items-center justify-center gap-2 border border-green-500/50">
                        <CheckCircle2 size={18} /> Plan Activado (3 Meses Gratis)
                     </div>
                ) : (
                    <Button variant="primary" className="w-full py-3 text-base" onClick={claimOffer}>
                        Activar Prueba Gratis
                    </Button>
                )}
            </div>

            {/* BUSINESS (Premium) */}
            <div className="bg-gradient-to-b from-[#1a1a1a] to-black rounded-3xl p-8 border border-purple-500/20 flex flex-col relative group hover:border-purple-500/50 transition-all h-[500px]">
                <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/50">
                    PRÓXIMAMENTE
                </div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Bot size={18} className="text-purple-500" /> Business
                </h3>
                <div className="text-3xl font-bold text-white mb-6 opacity-60">$29.90 <span className="text-sm font-medium text-gray-500">/mes</span></div>
                <p className="text-gray-400 text-sm mb-6">
                    Automatización completa e integraciones para empresas consolidadas.
                </p>
                <div className="space-y-4 mb-8 flex-1 opacity-60">
                    <FeatureItem text="Items Ilimitados" active />
                    <FeatureItem text="Todo lo de Growth" active />
                    <FeatureItem text="API & Webhooks" active color="text-purple-400" />
                    <FeatureItem text="Multi-Sucursal" active />
                    <FeatureItem text="Predicción Demanda (IA)" active color="text-purple-400" />
                </div>
                <Button className="w-full bg-white/5 text-gray-500 hover:bg-white/10 border-none py-3 cursor-not-allowed" disabled>
                    Notificarme
                </Button>
            </div>
         </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text, active, color, icon }: { text: string, active: boolean, color?: string, icon?: React.ReactNode }) => (
    <div className={`flex items-center gap-3 text-sm ${active ? (color || 'text-gray-300') : 'text-gray-600'}`}>
        {active ? (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${color ? 'bg-transparent' : 'bg-green-500/20'}`}>
                {icon ? icon : <CheckCircle2 size={14} className={color ? 'text-inherit' : 'text-green-500'} />}
            </div>
        ) : (
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
                <Lock size={12} />
            </div>
        )}
        <span className={!active ? 'line-through decoration-gray-700' : ''}>{text}</span>
    </div>
);
