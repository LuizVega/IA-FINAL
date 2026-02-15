
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { TrendingUp, DollarSign, Wallet, Activity, ArrowUpRight, PieChart, BarChart3, Target, Printer, X, FileText, Layers, AlertCircle, TrendingDown } from 'lucide-react';
import { Button } from './ui/Button';

// --- SVG CHART COMPONENTS ---

const DonutChart = ({ data, size = 160 }: { data: { label: string; value: number; color: string }[], size?: number }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let currentAngle = 0;
  
  if (total === 0) return <div className="flex items-center justify-center text-gray-600 text-xs" style={{ width: size, height: size }}>Sin Datos</div>;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      {data.map((item, index) => {
        const angle = (item.value / total) * 360;
        const radius = size / 2 - 10; // stroke width 20
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
        const offset = -1 * (currentAngle / 360) * circumference;
        currentAngle += angle;

        return (
          <circle
            key={index}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            stroke={item.color}
            strokeWidth="20"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out hover:opacity-80"
          />
        );
      })}
      {/* Inner Text */}
      <text x="50%" y="50%" textAnchor="middle" dy="0.3em" className="fill-white font-bold text-xs transform rotate-90" style={{ fontSize: '10px' }}>
         {(total / 1000).toFixed(1)}k
      </text>
    </svg>
  );
};

export const FinancialHealthView: React.FC = () => {
  const { inventory, settings, categories } = useStore();
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // --- FINANCIAL CALCULATIONS (ACCOUNTING LEVEL) ---
  
  const totalItems = inventory.length;
  const totalStock = inventory.reduce((acc, i) => acc + i.stock, 0);
  
  // Valuation metrics
  const totalRetailValue = inventory.reduce((acc, i) => acc + (i.price * i.stock), 0);
  const totalCostValue = inventory.reduce((acc, i) => acc + (i.cost * i.stock), 0); // COGS held
  const potentialProfit = totalRetailValue - totalCostValue; // Gross Profit
  
  // Ratios
  const grossMarginPercent = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;
  const markupMultiplier = totalCostValue > 0 ? (totalRetailValue / totalCostValue) : 0;
  const avgItemCost = totalStock > 0 ? totalCostValue / totalStock : 0;
  const avgItemPrice = totalStock > 0 ? totalRetailValue / totalStock : 0;

  // Breakdown by Category for Charts
  const categoryData = useMemo(() => {
      const map = new Map<string, number>();
      inventory.forEach(item => {
          const current = map.get(item.category) || 0;
          map.set(item.category, current + (item.price * item.stock));
      });
      
      const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
      const top5 = sorted.slice(0, 5);
      const others = sorted.slice(5).reduce((acc, curr) => acc + curr[1], 0);
      
      const colors = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#6b7280'];
      
      const finalData = top5.map((item, idx) => ({
          label: item[0],
          value: item[1],
          color: colors[idx % colors.length]
      }));
      
      if (others > 0) {
          finalData.push({ label: 'Otros', value: others, color: colors[5] });
      }
      return finalData;
  }, [inventory]);

  // Top Assets (Pareto Analysis)
  const topAssets = useMemo(() => {
      return [...inventory]
        .sort((a, b) => (b.cost * b.stock) - (a.cost * a.stock))
        .slice(0, 5);
  }, [inventory]);

  // Formatters
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const fmtPct = (n: number) => `${n.toFixed(1)}%`;
  const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });

  // --- PRINT / EXPORT HANDLER ---
  const handlePrint = () => {
      const printWindow = window.open('', '', 'width=900,height=1200');
      if (!printWindow) { alert('Permite ventanas emergentes.'); return; }

      // HTML Template for Print
      const htmlContent = `
        <html>
          <head>
            <title>Reporte Financiero - ${settings.companyName}</title>
            <style>
              @page { size: A4; margin: 2cm; }
              body { font-family: 'Helvetica', 'Arial', sans-serif; color: #111; line-height: 1.5; font-size: 11px; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
              .subtitle { font-size: 12px; color: #555; margin-top: 4px; }
              .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #ccc; margin-top: 30px; margin-bottom: 10px; padding-bottom: 4px; text-transform: uppercase; }
              
              .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
              .kpi-box { border: 1px solid #ddd; padding: 10px; border-radius: 4px; background: #f9f9f9; }
              .kpi-label { font-size: 9px; text-transform: uppercase; color: #666; font-weight: bold; }
              .kpi-value { font-size: 16px; font-weight: bold; margin-top: 4px; }
              
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f0f0f0; font-weight: bold; font-size: 10px; text-transform: uppercase; }
              .text-right { text-align: right; }
              
              .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 9px; text-align: center; color: #888; }
            </style>
          </head>
          <body>
            <div class="header">
                <div>
                    <div class="title">${settings.companyName || 'Mi Empresa'}</div>
                    <div class="subtitle">Reporte de Valorización de Inventario & Rentabilidad</div>
                </div>
                <div style="text-align: right;">
                    <div><strong>Fecha:</strong> ${dateStr}</div>
                    <div><strong>Moneda:</strong> USD</div>
                </div>
            </div>

            <div class="section-title">Resumen Ejecutivo</div>
            <div class="kpi-grid">
                <div class="kpi-box">
                    <div class="kpi-label">Valor de Venta (Proyección)</div>
                    <div class="kpi-value">${fmt(totalRetailValue)}</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-label">Capital Inmovilizado (Costo)</div>
                    <div class="kpi-value">${fmt(totalCostValue)}</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-label">Margen Bruto Global</div>
                    <div class="kpi-value">${fmtPct(grossMarginPercent)}</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-label">Markup Multiplier</div>
                    <div class="kpi-value">${markupMultiplier.toFixed(2)}x</div>
                </div>
            </div>

            <div class="section-title">Análisis de Pareto (Top 5 Activos de Mayor Costo)</div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Categoría</th>
                        <th class="text-right">Stock</th>
                        <th class="text-right">Costo Unit.</th>
                        <th class="text-right">Valor Total Costo</th>
                        <th class="text-right">% del Capital</th>
                    </tr>
                </thead>
                <tbody>
                    ${topAssets.map(item => `
                        <tr>
                            <td>${item.name}<br/><small>${item.sku}</small></td>
                            <td>${item.category}</td>
                            <td class="text-right">${item.stock}</td>
                            <td class="text-right">${fmt(item.cost)}</td>
                            <td class="text-right"><strong>${fmt(item.cost * item.stock)}</strong></td>
                            <td class="text-right">${(( (item.cost * item.stock) / totalCostValue ) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="section-title">Desglose por Categoría</div>
            <table>
                <thead>
                    <tr>
                        <th>Categoría</th>
                        <th class="text-right">Valor Venta Total</th>
                        <th class="text-right">% Participación</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryData.map(cat => `
                        <tr>
                            <td>${cat.label}</td>
                            <td class="text-right">${fmt(cat.value)}</td>
                            <td class="text-right">${((cat.value / totalRetailValue) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                Generado automáticamente por MyMorez Systems AI. Documento confidencial.
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar bg-[#050505] text-gray-200">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 pb-6 border-b border-white/10 gap-6">
          <div>
              <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <Activity className="text-green-500" size={28} />
                  Dashboard Financiero
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-mono">
                  <span>ACTUALIZADO: {new Date().toLocaleTimeString()}</span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <span>MONEDA BASE: {settings.currency}</span>
              </div>
          </div>
          <div className="flex gap-3">
              <Button 
                  onClick={() => setShowPdfPreview(true)} 
                  className="bg-[#222] hover:bg-[#333] text-white border border-white/10 shadow-lg font-mono text-xs uppercase tracking-wider"
                  icon={<FileText size={16} />}
              >
                  Generar Informe
              </Button>
          </div>
      </div>

      {/* KPI GRID - TECHNICAL STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          
          {/* KPI 1: Gross Valuation */}
          <div className="bg-[#0f0f0f] rounded-xl p-5 border border-white/10 hover:border-green-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-green-900/20 rounded-lg text-green-500 border border-green-500/20"><DollarSign size={20}/></div>
                  <span className="text-[10px] font-bold text-green-500 bg-green-900/10 px-2 py-1 rounded border border-green-500/20">+Proyección</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Valor Comercial Total</p>
              <h3 className="text-3xl font-bold text-white font-mono tracking-tight group-hover:text-green-400 transition-colors">{fmt(totalRetailValue)}</h3>
          </div>

          {/* KPI 2: COGS / Cost Basis */}
          <div className="bg-[#0f0f0f] rounded-xl p-5 border border-white/10 hover:border-blue-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-900/20 rounded-lg text-blue-500 border border-blue-500/20"><Wallet size={20}/></div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">Retenido</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Capital Inmovilizado (Costo)</p>
              <h3 className="text-3xl font-bold text-white font-mono tracking-tight group-hover:text-blue-400 transition-colors">{fmt(totalCostValue)}</h3>
          </div>

          {/* KPI 3: Net Margin */}
          <div className="bg-[#0f0f0f] rounded-xl p-5 border border-white/10 hover:border-purple-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-900/20 rounded-lg text-purple-500 border border-purple-500/20"><TrendingUp size={20}/></div>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Margen Bruto Global</p>
              <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-white font-mono tracking-tight group-hover:text-purple-400 transition-colors">{grossMarginPercent.toFixed(1)}%</h3>
                  <span className="text-xs text-gray-500 mb-1.5 font-medium">de utilidad</span>
              </div>
          </div>

          {/* KPI 4: Markup */}
          <div className="bg-[#0f0f0f] rounded-xl p-5 border border-white/10 hover:border-orange-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-orange-900/20 rounded-lg text-orange-500 border border-orange-500/20"><Target size={20}/></div>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Factor Markup (Avg)</p>
              <h3 className="text-3xl font-bold text-white font-mono tracking-tight group-hover:text-orange-400 transition-colors">{markupMultiplier.toFixed(2)}x</h3>
          </div>
      </div>

      {/* COMPLEX VISUALIZATION ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* 1. Category Distribution (Donut) */}
          <div className="bg-[#111] rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <h4 className="w-full text-left text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <PieChart size={14}/> Composición del Portafolio
              </h4>
              <div className="flex items-center gap-8">
                  <div className="relative">
                      <DonutChart data={categoryData} size={180} />
                  </div>
                  <div className="flex flex-col gap-2">
                      {categoryData.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                              <span className="text-gray-400 w-20 truncate">{d.label}</span>
                              <span className="text-white font-mono">{((d.value/totalRetailValue)*100).toFixed(0)}%</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* 2. Profitability Analysis (Waterfall Style) */}
          <div className="lg:col-span-2 bg-[#111] rounded-2xl border border-white/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <h4 className="w-full text-left text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <BarChart3 size={14}/> Análisis de Rentabilidad Neta
              </h4>
              
              <div className="relative pt-4 px-4 pb-2">
                  {/* Bars Container */}
                  <div className="flex items-end gap-2 h-40 w-full relative z-10">
                      
                      {/* Total Sales Bar */}
                      <div className="w-1/3 flex flex-col justify-end h-full group">
                          <div className="text-center text-white font-bold text-sm mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 w-1/3 left-0">{fmt(totalRetailValue)}</div>
                          <div className="w-full bg-blue-600/20 border border-blue-500 rounded-t-lg relative hover:bg-blue-600/30 transition-colors" style={{ height: '100%' }}>
                              <div className="absolute bottom-2 w-full text-center text-[10px] font-bold text-blue-400 uppercase">Ingreso Bruto</div>
                          </div>
                      </div>

                      {/* Arrow Cost */}
                      <div className="flex-1 flex flex-col items-center justify-center text-red-500/50 pb-8">
                          <TrendingDown size={24} />
                      </div>

                      {/* Cost Bar */}
                      <div className="w-1/3 flex flex-col justify-end h-full group">
                          <div className="text-center text-white font-bold text-sm mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-10 w-1/3 left-1/3">{fmt(totalCostValue)}</div>
                          <div className="w-full bg-red-900/20 border border-red-500 rounded-t-lg relative hover:bg-red-900/30 transition-colors" style={{ height: `${(totalCostValue/totalRetailValue)*100}%` }}>
                              <div className="absolute bottom-2 w-full text-center text-[10px] font-bold text-red-400 uppercase">Costo (COGS)</div>
                          </div>
                      </div>

                      {/* Equal Sign */}
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-600 pb-8 font-bold text-xl">=</div>

                      {/* Profit Bar */}
                      <div className="w-1/3 flex flex-col justify-end h-full group">
                          <div className="text-center text-white font-bold text-sm mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-20 w-1/3 right-0">{fmt(potentialProfit)}</div>
                          <div className="w-full bg-green-600/20 border border-green-500 rounded-t-lg relative hover:bg-green-600/30 transition-colors" style={{ height: `${(potentialProfit/totalRetailValue)*100}%` }}>
                              <div className="absolute bottom-2 w-full text-center text-[10px] font-bold text-green-400 uppercase">Utilidad Neta</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Base Line */}
                  <div className="w-full h-px bg-white/10 mt-0"></div>
              </div>
          </div>
      </div>

      {/* ASSET BREAKDOWN TABLE */}
      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#161616]">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Layers size={16} className="text-yellow-500"/> Activos de Alto Valor (Top 5 Riesgo)
              </h4>
              <span className="text-[10px] bg-yellow-900/20 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded font-mono">
                  PARETO ANALYSIS
              </span>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-[#0f0f0f] text-xs font-bold text-gray-500 uppercase">
                      <tr>
                          <th className="px-6 py-4 font-mono">SKU / Item</th>
                          <th className="px-6 py-4">Categoría</th>
                          <th className="px-6 py-4 text-right">Stock Físico</th>
                          <th className="px-6 py-4 text-right">Costo Unit.</th>
                          <th className="px-6 py-4 text-right text-white">Valor Total (Costo)</th>
                          <th className="px-6 py-4 text-right">% Del Capital</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {topAssets.map((item, i) => {
                          const itemTotalCost = item.cost * item.stock;
                          const percent = (itemTotalCost / totalCostValue) * 100;
                          return (
                              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="font-bold text-white text-sm font-sans mb-0.5">{item.name}</div>
                                      <div className="text-gray-600">{item.sku}</div>
                                  </td>
                                  <td className="px-6 py-4 font-sans text-gray-300">{item.category}</td>
                                  <td className="px-6 py-4 text-right">{item.stock}</td>
                                  <td className="px-6 py-4 text-right text-gray-500">${item.cost.toFixed(2)}</td>
                                  <td className="px-6 py-4 text-right font-bold text-blue-400">${itemTotalCost.toFixed(2)}</td>
                                  <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                          <span>{percent.toFixed(1)}%</span>
                                          <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                                              <div className="h-full bg-yellow-500" style={{ width: `${percent}%` }}></div>
                                          </div>
                                      </div>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>

      {/* PDF PREVIEW MODAL */}
      {showPdfPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-[#111] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-white/10">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#161616]">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Printer size={18} className="text-green-500"/> Previsualización de Impresión
                        </h3>
                        <button onClick={() => setShowPdfPreview(false)} className="bg-[#222] p-2 rounded-full hover:bg-[#333] text-gray-400 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    
                    {/* Document Preview Area (Mocking Paper) */}
                    <div className="flex-1 bg-[#222] p-8 overflow-y-auto custom-scrollbar flex justify-center">
                        <div className="bg-white text-black w-full max-w-[600px] min-h-[700px] shadow-xl p-10 text-xs sm:text-sm font-serif">
                            <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
                                <div>
                                    <h1 className="text-2xl font-bold uppercase mb-1 tracking-tight font-sans">Reporte Financiero</h1>
                                    <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">{settings.companyName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-gray-500 text-[10px] uppercase">Confidencial</p>
                                    <p className="font-mono text-black font-bold">{dateStr}</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 border-b border-gray-200 pb-1">Resumen Ejecutivo</div>
                                <div className="grid grid-cols-2 gap-6 mt-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Proyección Venta</p>
                                        <p className="text-3xl font-bold text-black font-sans">{fmt(totalRetailValue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Capital Costo</p>
                                        <p className="text-3xl font-bold text-black font-sans">{fmt(totalCostValue)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8 border-t border-gray-200 pt-4">
                                <div>
                                    <div className="text-gray-500 text-[10px] uppercase font-bold mb-1">Margen Global</div>
                                    <div className="text-xl font-bold text-green-700 font-sans">{grossMarginPercent.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-[10px] uppercase font-bold mb-1">Utilidad Neta</div>
                                    <div className="text-xl font-bold text-green-700 font-sans">{fmt(potentialProfit)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-[10px] uppercase font-bold mb-1">Markup</div>
                                    <div className="text-xl font-bold text-black font-sans">{markupMultiplier.toFixed(2)}x</div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 border-b border-gray-200 pb-1">Desglose Categorías</div>
                                <table className="w-full text-left mt-2" style={{ fontSize: '10px' }}>
                                    <thead className="bg-gray-100 uppercase">
                                        <tr>
                                            <th className="p-1">Categoría</th>
                                            <th className="p-1 text-right">Valor</th>
                                            <th className="p-1 text-right">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryData.slice(0,5).map((c, i) => (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="p-1 font-bold">{c.label}</td>
                                                <td className="p-1 text-right">{fmt(c.value)}</td>
                                                <td className="p-1 text-right">{((c.value/totalRetailValue)*100).toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-12 text-center text-gray-400 text-[9px] uppercase tracking-widest font-mono">
                                Documento generado automáticamente por MyMorez AI Systems.
                                <br/>Validez interna exclusiva.
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-[#161616] border-t border-white/10 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowPdfPreview(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handlePrint}
                            icon={<Printer size={18}/>}
                            className="bg-white hover:bg-gray-200 text-black shadow-none border-none font-bold"
                        >
                            Imprimir Reporte
                        </Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
