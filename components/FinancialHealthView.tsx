import React from 'react';
import { useStore } from '../store';
import { HelpCircle, TrendingUp, DollarSign, Wallet, Activity, ArrowUpRight, Info } from 'lucide-react';
import { Button } from './ui/Button';

const HelpTip: React.FC<{ title: string, description: string }> = ({ title, description }) => {
    return (
        <div className="group relative inline-block ml-2 cursor-pointer z-50">
            <HelpCircle size={14} className="text-gray-500 hover:text-green-400 transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black border border-green-500/30 rounded-lg shadow-2xl text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                <strong className="block text-green-400 mb-1">{title}</strong>
                {description}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-green-500/30 rotate-45"></div>
            </div>
        </div>
    );
};

export const FinancialHealthView: React.FC = () => {
  const { inventory, settings } = useStore();

  // Metrics Calculation
  const totalItems = inventory.length;
  const totalStock = inventory.reduce((acc, i) => acc + i.stock, 0);
  
  // Value (Retail Price)
  const totalRetailValue = inventory.reduce((acc, i) => acc + (i.price * i.stock), 0);
  
  // Cost (Acquisition Cost)
  const totalCostValue = inventory.reduce((acc, i) => acc + (i.cost * i.stock), 0);
  
  // Potential Profit
  const potentialProfit = totalRetailValue - totalCostValue;
  
  // Margin %
  const grossMargin = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

  // Formatting
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const handleDownloadPDF = () => {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
          alert('Por favor permite ventanas emergentes para descargar el reporte.');
          return;
      }

      const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      printWindow.document.write(`
        <html>
          <head>
            <title>Reporte Financiero MyMorez</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; background: #fff; }
              .header { border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
              .header h1 { margin: 0; font-size: 24px; color: #000; }
              .header span { color: #666; font-size: 14px; }
              .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
              .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
              .kpi-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
              .kpi-value { font-size: 20px; font-weight: bold; color: #000; }
              .section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; border-left: 4px solid #22c55e; padding-left: 10px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
              th { text-align: left; background: #f0f0f0; padding: 8px; border-bottom: 1px solid #ddd; }
              td { padding: 8px; border-bottom: 1px solid #eee; }
              .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
                <div>
                    <h1>Reporte de Salud Financiera</h1>
                    <span>${settings.companyName || 'Empresa No Registrada'}</span>
                </div>
                <div style="text-align: right;">
                    <strong>MyMorez System</strong><br/>
                    ${date}
                </div>
            </div>

            <div class="section-title">Métricas Generales</div>
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-label">Valor Venta Total</div>
                    <div class="kpi-value">${fmt(totalRetailValue)}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Costo Inversión</div>
                    <div class="kpi-value">${fmt(totalCostValue)}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Ganancia Potencial</div>
                    <div class="kpi-value">${fmt(potentialProfit)}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Margen Global</div>
                    <div class="kpi-value">${grossMargin.toFixed(1)}%</div>
                </div>
            </div>

            <div class="section-title">Resumen de Inventario</div>
            <table>
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Total Items</td><td>${totalItems}</td></tr>
                    <tr><td>Total Unidades Físicas</td><td>${totalStock}</td></tr>
                    <tr><td>Costo Promedio</td><td>${totalItems > 0 ? fmt(totalCostValue/totalItems) : '$0'}</td></tr>
                    <tr><td>Retorno por Dólar Invertido</td><td>$${(totalRetailValue/totalCostValue || 0).toFixed(2)}</td></tr>
                </tbody>
            </table>

            <div class="footer">
                Generado automáticamente por MyMorez AutoStock AI. Este documento es confidencial.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
          printWindow.print();
          printWindow.close();
      }, 500);
  };

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto custom-scrollbar bg-[#050505] space-y-8">
        
        {/* Header with Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Activity className="text-green-500 animate-pulse" /> Salud Financiera
                </h2>
                <p className="text-gray-500 mt-1 max-w-xl">
                    Diagnóstico detallado de la rentabilidad y liquidez de tu inventario.
                </p>
            </div>
            <div className="bg-[#111] px-4 py-2 rounded-full border border-green-900/30">
                <span className="text-xs text-green-400 font-mono font-bold tracking-widest uppercase">Análisis en Tiempo Real</span>
            </div>
        </div>

        {/* Top Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Net Liquidation Value */}
            <div className="bg-gradient-to-br from-[#111] to-black p-6 rounded-3xl border border-green-900/20 relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[50px] group-hover:bg-green-500/20 transition-all overflow-hidden pointer-events-none"></div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider flex items-center">
                        Valor Venta Total 
                        <HelpTip title="Valor de Liquidación" description="Dinero total si vendieras todo tu stock hoy al precio actual." />
                    </h3>
                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><TrendingUp size={20}/></div>
                </div>
                <div className="text-4xl font-bold text-white mb-2 relative z-10">{fmt(totalRetailValue)}</div>
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 w-fit px-2 py-1 rounded relative z-10">
                    <ArrowUpRight size={12} /> Proyección Positiva
                </div>
            </div>

            {/* Locked Capital */}
            <div className="bg-gradient-to-br from-[#111] to-black p-6 rounded-3xl border border-white/5 relative group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[50px] group-hover:bg-blue-500/10 transition-all overflow-hidden pointer-events-none"></div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider flex items-center">
                        Capital Inmovilizado
                        <HelpTip title="Costo del Inventario" description="Dinero que has gastado en comprar estos productos. Es dinero 'parado' en estanterías." />
                    </h3>
                    <div className="bg-blue-900/20 p-2 rounded-lg text-blue-400"><Wallet size={20}/></div>
                </div>
                <div className="text-4xl font-bold text-white mb-2 relative z-10">{fmt(totalCostValue)}</div>
                <p className="text-xs text-gray-500 relative z-10">Inversión actual en {totalStock} unidades.</p>
            </div>

            {/* Net Profit */}
            <div className="bg-gradient-to-br from-[#111] to-black p-6 rounded-3xl border border-purple-900/20 relative group">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] group-hover:bg-purple-500/20 transition-all overflow-hidden pointer-events-none"></div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider flex items-center">
                        Ganancia Potencial
                        <HelpTip title="Utilidad Bruta" description="La ganancia neta que obtendrás después de recuperar tu inversión." />
                    </h3>
                    <div className="bg-purple-900/20 p-2 rounded-lg text-purple-400"><DollarSign size={20}/></div>
                </div>
                <div className="text-4xl font-bold text-white mb-2 relative z-10">{fmt(potentialProfit)}</div>
                <div className="text-xs text-purple-400 font-bold relative z-10">
                    Margen Promedio: {grossMargin.toFixed(1)}%
                </div>
            </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ROI Explanation */}
            <div className="col-span-1 lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative">
                <h3 className="text-xl font-bold text-white mb-6">Análisis de Retorno (ROI)</h3>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Costo (Inversión)</span>
                            <span className="text-white font-mono">{fmt(totalCostValue)}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Retorno Total (Ventas)</span>
                            <span className="text-white font-mono">{fmt(totalRetailValue)}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden flex">
                            {/* Cost Part */}
                            <div 
                                className="bg-blue-500/50 h-full" 
                                style={{ width: `${(totalCostValue / totalRetailValue) * 100}%` }}
                            ></div>
                            {/* Profit Part */}
                            <div 
                                className="bg-green-500 h-full" 
                                style={{ width: `${(potentialProfit / totalRetailValue) * 100}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex justify-end gap-4">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500/50"></div> Recuperación Inversión</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Ganancia Neta</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-green-900/10 border border-green-500/20 p-4 rounded-xl flex gap-4 items-start">
                    <Info className="text-green-500 flex-shrink-0 mt-1" size={20} />
                    <div>
                        <h4 className="text-green-400 font-bold text-sm">Interpretación Sencilla</h4>
                        <p className="text-green-200/70 text-xs mt-1 leading-relaxed">
                            Por cada <strong>$1.00</strong> que inviertes en mercadería, estás generando aproximadamente <strong>${(totalRetailValue/totalCostValue || 0).toFixed(2)}</strong> de vuelta. 
                            Tu inventario es saludable si este número es superior a $1.30.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="bg-[#111] rounded-3xl p-6 border border-white/5 flex flex-col justify-center gap-6">
                <div className="text-center p-4 rounded-2xl bg-black border border-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ticket Promedio</p>
                    <p className="text-2xl font-bold text-white">
                        {totalItems > 0 ? fmt(totalRetailValue / totalItems) : '$0'}
                    </p>
                    <p className="text-[10px] text-gray-600">Precio promedio por item</p>
                </div>
                
                <div className="text-center p-4 rounded-2xl bg-black border border-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Densidad de Stock</p>
                    <p className="text-2xl font-bold text-white">
                        {totalItems > 0 ? (totalStock / totalItems).toFixed(1) : '0'}
                    </p>
                    <p className="text-[10px] text-gray-600">Unidades promedio por producto</p>
                </div>

                <div className="text-center">
                    <Button variant="ghost" className="text-xs" onClick={handleDownloadPDF}>Descargar Reporte PDF</Button>
                </div>
            </div>
        </div>
    </div>
  );
};