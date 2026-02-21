import React from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import {
    ChevronLeft,
    Printer,
    Download,
    FileText,
    Activity,
    Calendar,
    Building2
} from 'lucide-react';

export const MobileFinancialReportView: React.FC = () => {
    const { t } = useTranslation();
    const { inventory, settings, setCurrentView } = useStore() as any;

    const totalRetailValue = inventory.reduce((acc: number, i: any) => acc + (i.price * i.stock), 0);
    const totalCostValue = inventory.reduce((acc: number, i: any) => acc + (i.cost * i.stock), 0);
    const potentialProfit = totalRetailValue - totalCostValue;
    const grossMarginPercent = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

    const topAssets = [...inventory]
        .sort((a, b) => (b.cost * b.stock) - (a.cost * a.stock))
        .slice(0, 5);

    const dateStr = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const fmt = (n: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(n);

    return (
        <div className="flex flex-col min-h-screen bg-[#121212] text-black font-serif pb-32">
            {/* Header / Actions */}
            <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-white/10 z-20 px-4 py-4 flex justify-between items-center text-white font-sans">
                <button
                    onClick={() => setCurrentView('stats')}
                    className="flex items-center gap-2 text-sm font-medium hover:text-[#32D74B] transition-colors"
                >
                    <ChevronLeft size={20} />
                    Atrás
                </button>
                <h1 className="text-sm font-bold uppercase tracking-widest">Previsualización</h1>
                <div className="flex gap-2">
                    <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <Printer size={18} />
                    </button>
                </div>
            </header>

            {/* Document Body - Simulating Paper on Mobile */}
            <main className="mt-20 px-4 flex-1 overflow-y-auto pt-4">
                <div className="bg-white shadow-2xl overflow-hidden min-h-[100vh]">
                    {/* Fake Paper Header */}
                    <div className="p-6 border-b-2 border-black flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-black flex items-center justify-center text-white rounded">
                                <Activity size={24} />
                            </div>
                            <div className="text-right">
                                <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Confidencial</div>
                                <div className="text-xs font-bold font-sans">{dateStr}</div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-1 font-sans">Reporte Financiero</h2>
                            <div className="flex items-center gap-2 text-[10px] text-gray-600 font-sans font-bold uppercase tracking-widest">
                                <Building2 size={10} />
                                {settings.companyName || 'Mi Empresa'}
                            </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="p-6 space-y-8">
                        {/* Summary Section */}
                        <section>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-1 mb-4 font-sans">Resumen Ejecutivo</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-gray-400 uppercase font-sans">Capital en Inventario</p>
                                    <p className="text-lg font-bold font-sans">{fmt(totalCostValue)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] text-gray-400 uppercase font-sans">Margen Bruto</p>
                                    <p className="text-lg font-bold font-sans text-green-700">{grossMarginPercent.toFixed(1)}%</p>
                                </div>
                            </div>
                        </section>

                        {/* Valuation Section */}
                        <section className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="text-[9px] text-gray-400 uppercase font-sans mb-1 text-center">Valor Comercial Proyectado</p>
                            <p className="text-3xl font-black text-center font-sans">{fmt(totalRetailValue)}</p>
                        </section>

                        {/* Top Assets */}
                        <section>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-1 mb-4 font-sans">Top 5 Activos por Costo</h3>
                            <div className="space-y-4">
                                {topAssets.map((item: any, idx) => (
                                    <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-2 last:border-0">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-sm font-bold truncate leading-tight">{item.name}</p>
                                            <p className="text-[9px] text-gray-400 uppercase font-sans">Stock: {item.stock} • {item.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold font-sans">{fmt(item.cost * item.stock)}</p>
                                            <p className="text-[8px] text-gray-400 font-sans">{(((item.cost * item.stock) / totalCostValue) * 100).toFixed(1)}% del capital</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Note */}
                        <div className="pt-20 border-t border-gray-100 text-center">
                            <p className="text-[8px] uppercase tracking-[0.2em] text-gray-300 font-sans mb-1">MyMorez AI System Optimization</p>
                            <p className="text-[7px] text-gray-200 font-sans">ID: #REPORT-FIN-2026-M</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
