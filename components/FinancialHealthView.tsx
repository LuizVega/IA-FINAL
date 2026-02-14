
import React, { useState } from 'react';
import { useStore } from '../store';
import { TrendingUp, DollarSign, Wallet, Activity, ArrowUpRight, Download, BarChart3, Target, Printer, X, FileText } from 'lucide-react';
import { Button } from './ui/Button';

export const FinancialHealthView: React.FC = () => {
  const { inventory, settings } = useStore();
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // 1. Cálculos Base
  const totalItems = inventory.length;
  const totalStock = inventory.reduce((acc, i) => acc + i.stock, 0);
  
  // Valor Total de Venta (Revenue potencial)
  const totalRetailValue = inventory.reduce((acc, i) => acc + (i.price * i.stock), 0);
  
  // Valor Total de Costo (Inversión retenida)
  const totalCostValue = inventory.reduce((acc, i) => acc + (i.cost * i.stock), 0);
  
  // Ganancia Neta Potencial
  const potentialProfit = totalRetailValue - totalCostValue;
  
  // Margen Porcentual Global
  const grossMargin = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;
  
  // ROI (Retorno sobre Inversión)
  const roiPercentage = totalCostValue > 0 ? ((potentialProfit / totalCostValue) * 100) : 0;

  // Porcentajes para gráficas visuales
  const costPercent = totalRetailValue > 0 ? (totalCostValue / totalRetailValue) * 100 : 0;
  const profitPercent = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

  // Formateador de moneda
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
          alert('Permite ventanas emergentes para descargar.');
          return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Reporte Financiero - ${settings.companyName}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #111; }
              h1 { margin: 0; font-size: 24px; }
              .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
              .metric { margin-bottom: 20px; }
              .label { font-size: 10px; text-transform: uppercase; color: #666; letter-spacing: 1px; font-weight: bold; }
              .value { font-size: 32px; font-weight: bold; color: #000; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
              .box { background: #f5f5f5; padding: 20px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="header">
                <div>
                    <h1>Estado de Situación de Inventario</h1>
                    <p>${settings.companyName}</p>
                </div>
                <div style="text-align: right;">${dateStr}</div>
            </div>
            
            <div class="metric">
                <div class="label">Valor Total de Venta (Proyección)</div>
                <div class="value">${fmt(totalRetailValue)}</div>
            </div>

            <div class="grid">
                <div class="box">
                    <div class="label">Capital Invertido (Costo)</div>
                    <div class="value" style="color: #3b82f6;">${fmt(totalCostValue)}</div>
                </div>
                <div class="box">
                    <div class="label">Utilidad Bruta (Ganancia)</div>
                    <div class="value" style="color: #22c55e;">${fmt(potentialProfit)}</div>
                </div>
            </div>
            
            <div class="grid">
                 <div class="box">
                    <div class="label">Margen Global</div>
                    <div class="value">${grossMargin.toFixed(1)}%</div>
                </div>
                <div class="box">
                    <div class="label">ROI</div>
                    <div class="value">${roiPercentage.toFixed(1)}%</div>
                </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto custom-scrollbar bg-[#050505] relative">
        
        {/* Header Compacto */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pb-6 border-b border-white/5">
            <div className="w-full md:w-auto">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="text-green-500" size={24} />
                    Reporte de Rentabilidad
                </h2>
                <p className="text-gray-500 text-sm mt-1">Análisis de márgenes y proyección de ganancias basado en stock actual.</p>
            </div>
            
            <button 
                id="tour-export-pdf" // Tour target
                onClick={() => setShowPdfPreview(true)}
                className="w-full md:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-green-500/20"
            >
                <FileText size={16} />
                Exportar Reporte
            </button>
        </div>

        {/* Sección Principal: Proyección de Ingresos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Tarjeta Principal: Composición Financiera */}
            <div className="lg:col-span-2 bg-[#111] rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Proyección Total de Ventas</p>
                        <div className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            {fmt(totalRetailValue)}
                        </div>
                    </div>
                    <div className="bg-green-900/10 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-500" />
                        <span className="text-green-400 font-bold text-sm">Rentable</span>
                    </div>
                </div>

                {/* Gráfico de Barras CSS */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-blue-400">COSTO (Recuperación de Capital)</span>
                        <span className="text-green-400">UTILIDAD (Ganancia Neta)</span>
                    </div>
                    
                    {/* Barra de Progreso Stacked */}
                    <div className="h-4 w-full bg-[#222] rounded-full overflow-hidden flex mb-2">
                        <div 
                            className="h-full bg-blue-600 hover:bg-blue-500 transition-all duration-500" 
                            style={{ width: `${costPercent}%` }}
                            title={`Costo: ${costPercent.toFixed(1)}%`}
                        ></div>
                        <div 
                            className="h-full bg-green-500 hover:bg-green-400 transition-all duration-500 relative" 
                            style={{ width: `${profitPercent}%` }}
                            title={`Ganancia: ${profitPercent.toFixed(1)}%`}
                        >
                            {/* Line separator effect */}
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-black/20"></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <div>
                            <div className="text-2xl font-bold text-blue-500">{fmt(totalCostValue)}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Capital Invertido ({costPercent.toFixed(0)}%)</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-500">+{fmt(potentialProfit)}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Ganancia Neta ({profitPercent.toFixed(0)}%)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tarjeta Secundaria: ROI y Eficiencia */}
            <div className="bg-[#111] rounded-2xl p-6 border border-white/10 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[50px] pointer-events-none"></div>
                
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Target size={14} /> Rendimiento (ROI)
                </p>
                
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-white">{roiPercentage.toFixed(1)}</span>
                    <span className="text-xl text-gray-500 font-medium">%</span>
                </div>
                
                <p className="text-sm text-gray-400 mb-6 leading-tight">
                    Por cada <span className="text-white font-bold">$100</span> invertidos, generas <span className="text-green-400 font-bold">${roiPercentage.toFixed(0)}</span> adicionales de ganancia.
                </p>

                <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400" 
                        style={{ width: `${Math.min(roiPercentage, 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-mono">
                    <span>0%</span>
                    <span>OBJETIVO: 50%+</span>
                </div>
            </div>
        </div>

        {/* Métricas Secundarias */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <Activity size={16} />
                    <span className="text-xs font-bold uppercase">Margen Bruto</span>
                </div>
                <div className="text-2xl font-bold text-white">{grossMargin.toFixed(1)}%</div>
            </div>

            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <Wallet size={16} />
                    <span className="text-xs font-bold uppercase">Capital en Stock</span>
                </div>
                <div className="text-2xl font-bold text-white">{fmt(totalCostValue)}</div>
            </div>

            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <DollarSign size={16} />
                    <span className="text-xs font-bold uppercase">Ticket Promedio</span>
                </div>
                <div className="text-2xl font-bold text-white">
                    {totalItems > 0 ? fmt(totalRetailValue / totalItems) : '$0'}
                </div>
            </div>

            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <ArrowUpRight size={16} />
                    <span className="text-xs font-bold uppercase">Markup Promedio</span>
                </div>
                <div className="text-2xl font-bold text-white">
                    {totalCostValue > 0 ? ((totalRetailValue / totalCostValue) - 1).toFixed(2) : '0'}x
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
                * Datos calculados sobre {totalItems} items y {totalStock} unidades en inventario.
            </p>
            <div className="flex gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sistema Actualizado</span>
            </div>
        </div>

        {/* PDF PREVIEW MODAL */}
        {showPdfPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-[#111] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#161616]">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText size={18} className="text-green-500"/> Previsualización del Reporte
                        </h3>
                        <button onClick={() => setShowPdfPreview(false)} className="bg-[#222] p-2 rounded-full hover:bg-[#333] text-gray-400 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    
                    {/* Document Preview Area */}
                    <div className="flex-1 bg-[#222] p-8 overflow-y-auto custom-scrollbar flex justify-center">
                        <div className="bg-white text-black w-full max-w-[600px] min-h-[700px] shadow-xl p-8 text-xs sm:text-sm">
                            <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
                                <div>
                                    <h1 className="text-xl font-bold uppercase mb-1">Reporte Financiero</h1>
                                    <p className="text-gray-600 font-bold">{settings.companyName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-gray-500">{dateStr}</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Proyección de Venta</div>
                                <div className="text-4xl font-bold">{fmt(totalRetailValue)}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-100 p-4 rounded">
                                    <div className="text-gray-500 text-[10px] uppercase font-bold mb-1">Costo (Inversión)</div>
                                    <div className="text-xl font-bold text-blue-600">{fmt(totalCostValue)}</div>
                                </div>
                                <div className="bg-gray-100 p-4 rounded">
                                    <div className="text-gray-500 text-[10px] uppercase font-bold mb-1">Utilidad (Ganancia)</div>
                                    <div className="text-xl font-bold text-green-600">{fmt(potentialProfit)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
                                <div>
                                    <div className="text-gray-500 text-[10px] uppercase font-bold mb-1">Margen Global</div>
                                    <div className="text-lg font-bold">{grossMargin.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-[10px] uppercase font-bold mb-1">ROI</div>
                                    <div className="text-lg font-bold">{roiPercentage.toFixed(1)}%</div>
                                </div>
                            </div>
                            
                            <div className="mt-12 text-center text-gray-400 text-[10px] uppercase tracking-widest">
                                Generado automáticamente por MyMorez AI
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-[#161616] border-t border-white/10 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowPdfPreview(false)}>
                            Cerrar
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handlePrint}
                            icon={<Printer size={18}/>}
                            className="bg-white hover:bg-gray-200 text-black shadow-none border-none"
                        >
                            Imprimir / Guardar PDF
                        </Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
