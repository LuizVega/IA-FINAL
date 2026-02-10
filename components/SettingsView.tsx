
import React from 'react';
import { useStore } from '../store';
import { Building2, Coins, ReceiptText, CheckCircle2, Clock } from 'lucide-react';
import { PromoBanner } from './PromoBanner';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useStore();

  return (
    <div className="p-6 max-w-6xl mx-auto custom-scrollbar overflow-y-auto h-full pb-20 space-y-12">
      
      {/* Header */}
      <div>
         <h2 className="text-3xl font-bold text-white mb-2">Configuración del Sistema</h2>
         <p className="text-gray-500">Gestiona los parámetros de tu empresa y preferencias.</p>
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
    </div>
  );
};
