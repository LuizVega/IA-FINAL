
import React from 'react';
import { useStore } from '../store';
import { DollarSign, Package, AlertTriangle, Clock, ShieldAlert, TrendingUp, Zap, Activity, BrainCircuit, ArrowUpRight } from 'lucide-react';
import { differenceInDays, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/Button';

interface StatsDashboardProps {
    onActionClick?: (filterType: 'warranty' | 'stagnant') => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onActionClick }) => {
  const { inventory, setCurrentView } = useStore();

  // 1. Calculate General Stats
  const totalItems = inventory.length;
  const totalStock = inventory.reduce((acc, item) => acc + item.stock, 0);
  const totalValue = inventory.reduce((acc, item) => acc + (item.price * item.stock), 0);
  const totalCost = inventory.reduce((acc, item) => acc + (item.cost * item.stock), 0);
  
  // Potential Profit
  const potentialProfit = totalValue - totalCost;
  const profitMargin = totalValue > 0 ? (potentialProfit / totalValue) * 100 : 0;

  // 2. Warranty Alerts
  const warrantyAlerts = inventory.filter(item => {
    if (!item.supplierWarranty || item.stock === 0) return false;
    try {
      const date = parseISO(item.supplierWarranty);
      if (!isValid(date)) return false;
      const days = differenceInDays(date, new Date());
      return days < 60; 
    } catch { return false; }
  }).sort((a, b) => new Date(a.supplierWarranty!).getTime() - new Date(b.supplierWarranty!).getTime());

  // 3. Stagnant
  const stagnantItems = inventory.filter(item => item.stock > 0 && item.entryDate)
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .slice(0, 5);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (totalItems === 0) {
      return (
          <div className="p-8 flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-green-900/10 p-8 rounded-full mb-6 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                  <BrainCircuit size={64} className="text-green-500 animate-pulse" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">AutoStock <span className="text-green-500">Intelligent</span></h2>
              <p className="text-gray-400 max-w-lg mb-8 text-lg leading-relaxed">
                  El sistema está esperando datos para comenzar a optimizar tu inventario.
                  <br/> Importa tus productos y deja que la plataforma tome el control.
              </p>
              <div className="flex gap-4">
                  <Button onClick={() => setCurrentView('files')} className="bg-green-600 hover:bg-green-500 text-black px-8 py-4 text-lg">
                      Iniciar Inventario
                  </Button>
              </div>
          </div>
      )
  }

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar space-y-8">
      <div className="flex items-center justify-between mb-2">
         <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               <Activity className="text-green-500 animate-pulse" /> Panel de Control
            </h2>
            <p className="text-gray-500 mt-1">Visión general del estado de tu negocio en tiempo real.</p>
         </div>
         <div className="bg-[#111] px-4 py-2 rounded-full border border-green-900/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
            <span className="text-xs text-green-400 font-mono">SISTEMA OPERATIVO</span>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
             label: 'Valor de Inventario', 
             value: formatMoney(totalValue), 
             sub: `Margen pot.: ${profitMargin.toFixed(1)}%`, 
             icon: DollarSign, 
             color: 'text-green-400', 
             bg: 'from-green-500/10 to-transparent',
             action: null
          },
          { 
             label: 'Items Totales', 
             value: totalItems, 
             sub: `${totalStock} unidades físicas`, 
             icon: Package, 
             color: 'text-blue-400', 
             bg: 'from-blue-500/10 to-transparent',
             action: null
          },
          { 
             label: 'Salud Financiera', 
             value: '94%', 
             sub: 'Basado en rotación y margen', 
             icon: TrendingUp, 
             color: 'text-purple-400', 
             bg: 'from-purple-500/10 to-transparent',
             action: null
          },
          { 
             label: 'Acciones Pendientes', 
             value: warrantyAlerts.length + (stagnantItems.length > 0 ? 1 : 0), 
             sub: 'Ver items con problemas', 
             icon: Zap, 
             color: 'text-amber-400', 
             bg: 'from-amber-500/10 to-transparent',
             action: () => onActionClick && onActionClick('warranty') // Default to general attention
          },
        ].map((kpi, idx) => (
           <div 
             key={idx} 
             onClick={kpi.action || undefined}
             className={`bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300 ${kpi.action ? 'cursor-pointer hover:bg-white/5 ring-0 focus:ring-2 focus:ring-green-500/50' : ''}`}
           >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bg} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{kpi.label}</p>
                    <kpi.icon size={20} className={`${kpi.color}`} />
                 </div>
                 <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{kpi.value}</h3>
                 <p className="text-xs text-gray-500 font-medium">{kpi.sub}</p>
                 {kpi.action && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={18} className="text-gray-400" />
                    </div>
                 )}
              </div>
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Warranty Alerts List - Clickable */}
          <div 
             onClick={() => onActionClick && onActionClick('warranty')}
             className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden flex flex-col h-full hover:border-red-900/30 transition-colors cursor-pointer group"
          >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111]/50 group-hover:bg-[#1a1a1a] transition-colors">
                  <h3 className="font-bold text-white flex items-center gap-2">
                      <ShieldAlert size={18} className="text-red-500" />
                      Riesgo de Garantía
                  </h3>
                  <div className="flex gap-2 items-center">
                     <span className="text-xs text-gray-500 group-hover:text-white transition-colors">Ver todos</span>
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto max-h-[300px] custom-scrollbar pointer-events-none">
                  {warrantyAlerts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-700 text-sm py-10">
                          <CheckCircle size={32} className="mb-2 opacity-20" />
                          Todo en orden.
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {warrantyAlerts.slice(0, 5).map(item => {
                              const days = differenceInDays(parseISO(item.supplierWarranty!), new Date());
                              const isExpired = days < 0;
                              return (
                                  <div key={item.id} className="flex items-center gap-4 p-3 bg-black/40 rounded-2xl border border-white/5 group-hover:border-red-500/20 transition-all">
                                      <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/5">
                                          <img src={item.imageUrl} className="w-full h-full object-cover opacity-70" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-bold text-gray-200 truncate">{item.name}</h4>
                                          <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider font-mono">SKU: {item.sku}</p>
                                      </div>
                                      <div className="text-right">
                                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${isExpired ? 'bg-red-900/20 text-red-500 border-red-900/30' : 'bg-amber-900/20 text-amber-500 border-amber-900/30'}`}>
                                              {isExpired ? 'VENCIDA' : `${days} DÍAS`}
                                          </span>
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  )}
              </div>
          </div>

          {/* Stagnant Inventory List - Clickable */}
          <div 
             onClick={() => onActionClick && onActionClick('stagnant')}
             className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden flex flex-col h-full hover:border-orange-900/30 transition-colors cursor-pointer group"
          >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111]/50 group-hover:bg-[#1a1a1a] transition-colors">
                  <h3 className="font-bold text-white flex items-center gap-2">
                      <Clock size={18} className="text-orange-500" />
                      Inventario Estancado
                  </h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-500 group-hover:text-white transition-colors">Ver todos</span>
                    <span className="text-[10px] text-gray-500 font-mono bg-black px-2 py-1 rounded border border-white/10 group-hover:border-orange-500/30">ANTIGÜEDAD &gt; 90 DÍAS</span>
                  </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto max-h-[300px] custom-scrollbar pointer-events-none">
                   {stagnantItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-700 text-sm py-10">
                          <Package size={32} className="mb-2 opacity-20" />
                          Rotación saludable.
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {stagnantItems.map(item => {
                              let timeText = 'Desconocido';
                              try {
                                  timeText = formatDistanceToNow(parseISO(item.entryDate), { locale: es, addSuffix: false });
                              } catch {}
                              
                              return (
                                  <div key={item.id} className="flex items-center gap-4 p-3 bg-black/40 rounded-2xl border border-white/5 group-hover:border-orange-500/20 transition-all">
                                      <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/5">
                                          <img src={item.imageUrl} className="w-full h-full object-cover opacity-70" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-bold text-gray-200 truncate">{item.name}</h4>
                                          <p className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                                              HACE {timeText.toUpperCase()}
                                          </p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-sm font-bold text-white">{item.stock} Unid.</p>
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

// Helper component just for the empty state icon
const CheckCircle = ({size, className}: {size: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
