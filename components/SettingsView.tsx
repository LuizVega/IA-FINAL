import React from 'react';
import { useStore } from '../store';
import { Building2, Coins, ReceiptText, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, setCurrentView } = useStore();

  return (
    <div className="p-6 max-w-4xl mx-auto custom-scrollbar overflow-y-auto h-full pb-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>
      
      {/* General Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-gray-400" />
          General de la Cuenta
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
            <input 
              type="text" 
              value={settings.companyName}
              onChange={(e) => updateSettings({ companyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Coins size={14} /> Moneda Principal
            </label>
            <select 
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="USD">Dólar Estadounidense (USD)</option>
              <option value="MXN">Peso Mexicano (MXN)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="COP">Peso Colombiano (COP)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <ReceiptText size={14} /> Impuesto (%)
            </label>
             <input 
              type="number" 
              value={settings.taxRate * 100}
              onChange={(e) => updateSettings({ taxRate: parseFloat(e.target.value) / 100 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Margins Redirect */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-1">Márgenes de Ganancia</h3>
          <p className="text-sm text-blue-700">
            La configuración de márgenes y prefijos SKU ahora se gestiona en la sección de Categorías.
          </p>
        </div>
        <Button onClick={() => setCurrentView('categories')} variant="primary" size="sm" icon={<ArrowRight size={16} />}>
          Ir a Categorías
        </Button>
      </div>
    </div>
  );
};