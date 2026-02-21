
import React, { useState } from 'react';
import { useStore } from '../store';
import { DollarSign, Package, TrendingUp, Zap, ExternalLink, Copy, CheckCircle2, Settings, Share2, ArrowUpRight, AlertCircle, ShoppingBag, ArrowRight, Store, BarChart3, Layers } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { Button } from './ui/Button';
import { ProductImage } from './ProductImage';
import { PromoBanner } from './PromoBanner';

interface StatsDashboardProps {
    onActionClick?: (filterType: 'warranty' | 'stagnant') => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onActionClick }) => {
    const { inventory, settings, session, setWhatsAppModalOpen, setCurrentView, orders, isDemoMode } = useStore();
    const [copiedLink, setCopiedLink] = useState(false);

    // --- DATA CALCULATION ---
    const totalItems = inventory.length;
    const totalStock = inventory.reduce((acc, item) => acc + item.stock, 0);
    const totalValue = inventory.reduce((acc, item) => acc + (item.price * item.stock), 0);

    // Potential Profit
    const totalCost = inventory.reduce((acc, item) => acc + (item.cost * item.stock), 0);
    const potentialProfit = totalValue - totalCost;

    // Stagnant Items
    const stagnantThreshold = settings.stagnantDaysThreshold || 90;
    const stagnantItems = inventory.filter(item => {
        if (item.stock === 0 || !item.entryDate) return false;
        try {
            const days = differenceInDays(new Date(), parseISO(item.entryDate));
            return days > stagnantThreshold;
        } catch { return false; }
    }).slice(0, 5);

    // Top Products (Mock logic: High price or high stock as proxy for "Top" if no orders)
    // In a real scenario, filter 'orders' to find best sellers.
    const topProducts = [...inventory].sort((a, b) => b.price - a.price).slice(0, 3);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    const storeId = session?.user.id;
    const storeUrl = session ? `${window.location.origin}?shop=${storeId}` : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(storeUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    if (totalItems === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95 duration-500">
                <PromoBanner />
                <div className="max-w-xl w-full mx-auto flex flex-col items-center mt-10">
                    <div className="bg-[#111] p-8 rounded-full mb-6 border border-white/5 shadow-2xl">
                        <Package size={64} className="text-gray-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Tu Dashboard está vacío</h2>
                    <p className="text-gray-400 mb-8">
                        Agrega productos o importa tu inventario para ver las métricas en tiempo real.
                    </p>
                    <Button onClick={() => setCurrentView('files')} className="bg-green-600 hover:bg-green-500 text-black px-8 py-3 font-bold">
                        Agregar Primer Producto
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 h-full overflow-y-auto space-y-8 bg-[#050505]" id="tour-stats">

            {/* 1. STORE HEADER BANNER */}
            <div className="w-full bg-[#111] border border-white/5 rounded-2xl p-2 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4 px-4 py-2 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                        <Store size={20} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            Tu Tienda Pública
                            <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded font-bold tracking-wide animate-pulse">ONLINE</span>
                        </h1>
                        {settings.whatsappEnabled ? (
                            <p className="text-xs text-gray-500">Lista para recibir pedidos</p>
                        ) : (
                            <p className="text-xs text-amber-500 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setWhatsAppModalOpen(true)}>
                                <AlertCircle size={10} /> Configura WhatsApp
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto px-2">
                    <button
                        onClick={handleCopyLink}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        title="Copiar Enlace"
                    >
                        {copiedLink ? <CheckCircle2 size={20} className="text-green-500" /> : <Share2 size={20} />}
                    </button>
                    <button
                        onClick={() => setCurrentView('settings')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#222] text-gray-300 border border-white/5 rounded-xl text-sm font-medium transition-colors"
                    >
                        <Settings size={16} /> Configurar
                    </button>
                    <button
                        id="tour-visit-store-btn"
                        onClick={() => {
                            if (isDemoMode) {
                                setCurrentView('public-store');
                            } else {
                                window.open(storeUrl, '_blank');
                            }
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-black rounded-xl text-sm font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105"
                    >
                        Visitar <ExternalLink size={16} />
                    </button>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold text-white">Resumen de Inventario</h2>
                    <button
                        id="tour-financial-report-card"
                        onClick={() => setCurrentView('financial-health')}
                        className="text-xs font-bold text-green-500 hover:text-green-400 flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 transition-all hover:bg-green-500/20"
                    >
                        <BarChart3 size={14} /> Ver Reporte Financiero
                    </button>
                </div>

                {/* 2. KPI CARDS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Card 1: Value */}
                    <div className="bg-[#111] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 relative overflow-hidden group transition-all duration-300 md:hover:scale-[1.02] md:hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] md:hover:border-green-500/30">
                        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-green-500/5 rounded-full blur-[30px] md:blur-[50px] -mr-8 -mt-8 md:-mr-10 md:-mt-10 transition-opacity opacity-50 md:group-hover:opacity-100"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">DINERO POTENCIAL EN VENTAS</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{formatMoney(totalValue)}</h3>
                            </div>
                            <div className="bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                                <TrendingUp size={14} className="text-green-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs relative z-10">
                            <span className="text-green-400 font-bold">+12%</span>
                            <span className="text-gray-500">crecimiento este mes</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-3 border-t border-white/5 pt-3">
                            Si vendes todo hoy, ganarías <span className="text-green-500 font-bold">{formatMoney(potentialProfit)}</span> limpios.
                        </p>
                    </div>

                    {/* Card 2: Products */}
                    <div className="bg-[#111] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 relative overflow-hidden group transition-all duration-300 md:hover:scale-[1.02] md:hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] md:hover:border-blue-500/30">
                        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-blue-500/5 rounded-full blur-[30px] md:blur-[50px] -mr-8 -mt-8 md:-mr-10 md:-mt-10 transition-opacity opacity-50 md:group-hover:opacity-100"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">VARIEDAD DE PRODUCTOS</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{totalItems} <span className="text-sm text-gray-500 font-medium">Modelos</span></h3>
                            </div>
                            <div className="bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1">
                                <Layers size={14} className="text-blue-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs relative z-10">
                            <span className="text-gray-400">Total unidades físicas:</span>
                            <span className="text-white font-bold">{totalStock}</span>
                        </div>
                        <div className="absolute bottom-4 right-4 text-blue-900/20 group-hover:text-blue-500/20 transition-colors">
                            <Package size={32} />
                        </div>
                    </div>

                    {/* Card 3: Stagnant */}
                    <div
                        className="bg-[#111] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 relative overflow-hidden group cursor-pointer transition-all duration-300 md:hover:scale-[1.02] md:hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] md:hover:border-orange-500/30"
                        onClick={() => onActionClick && onActionClick('stagnant')}
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-orange-500/5 rounded-full blur-[30px] md:blur-[50px] -mr-8 -mt-8 md:-mr-10 md:-mt-10 transition-opacity opacity-50 md:group-hover:opacity-100"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">PRODUCTOS LENTOS</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{stagnantItems.length}</h3>
                            </div>
                            <div className="bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 flex items-center gap-1">
                                <AlertCircle size={14} className="text-orange-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs relative z-10">
                            <span className="text-gray-500">
                                {stagnantItems.length === 0 ? '¡Excelente! Todo se mueve.' : 'No se han vendido en 90 días.'}
                            </span>
                        </div>
                        {stagnantItems.length > 0 && (
                            <p className="text-[10px] text-orange-400 mt-3 font-bold flex items-center gap-1 group-hover:underline">
                                Ver sugerencias <ArrowRight size={10} />
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. CHART & TOP PRODUCTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section (Mock Visual) */}
                <div className="lg:col-span-2 bg-[#111] rounded-2xl md:rounded-3xl border border-white/5 p-5 md:p-6 relative overflow-hidden flex flex-col justify-between min-h-[200px] md:min-h-[300px] group transition-colors md:hover:border-white/10">
                    <div className="flex justify-between items-center mb-6 z-10">
                        <h3 className="text-lg font-bold text-white">Actividad de Ventas</h3>
                        {orders.length > 0 && <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded animate-pulse">En vivo</span>}
                    </div>

                    {/* Decorative Chart Line */}
                    <div className="absolute inset-0 hidden md:flex items-end pt-20 pointer-events-none">
                        <svg className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" preserveAspectRatio="none" viewBox="0 0 100 50">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0 45 C 20 40, 30 20, 50 25 S 70 5, 100 15 V 50 H 0 Z"
                                fill="url(#chartGradient)"
                            />
                            <path
                                d="M0 45 C 20 40, 30 20, 50 25 S 70 5, 100 15"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="0.5"
                                vectorEffect="non-scaling-stroke"
                                className="drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                            />
                        </svg>
                    </div>

                    {/* Optional: Overlay if no orders */}
                    {orders.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <p className="text-xs text-gray-600 bg-[#111]/80 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
                                Esperando primeros pedidos...
                            </p>
                        </div>
                    )}
                </div>

                {/* Top Products List */}
                <div className="bg-[#111] rounded-3xl border border-white/5 p-6 flex flex-col group hover:border-white/10 transition-colors">
                    <h3 className="text-lg font-bold text-white mb-6">Más Vendidos / Alta Valoración</h3>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[250px]">
                        {topProducts.map(product => (
                            <div key={product.id} className="flex items-center gap-4 group/item p-2 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-black border border-white/10 overflow-hidden flex-shrink-0 relative">
                                    <ProductImage src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white truncate group-hover/item:text-green-400 transition-colors">{product.name}</h4>
                                    <p className="text-[10px] text-gray-500 truncate">{product.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-white block">${product.price}</span>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <p className="text-xs text-gray-500 text-center py-4">Sin datos suficientes</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. LOW ROTATION TABLE */}
            <div className="bg-[#111] rounded-3xl border border-white/5 p-6 group hover:border-white/10 transition-colors">
                <h3 className="text-lg font-bold text-white mb-6">Productos que necesitan atención</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                                <th className="font-bold py-3 pl-2">Producto</th>
                                <th className="font-bold py-3">Días sin Venta</th>
                                <th className="font-bold py-3">Stock</th>
                                <th className="font-bold py-3 text-right pr-2">Acción Sugerida</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {stagnantItems.length > 0 ? stagnantItems.map(item => {
                                const days = item.entryDate ? differenceInDays(new Date(), parseISO(item.entryDate)) : 0;
                                return (
                                    <tr key={item.id} className="group/row hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-black border border-white/10 overflow-hidden group-hover/row:border-green-500/30 transition-colors">
                                                    <ProductImage src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-gray-300 font-medium group-hover/row:text-white transition-colors">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-gray-400">{days}</td>
                                        <td className="py-4 text-gray-400">{item.stock}</td>
                                        <td className="py-4 text-right pr-2">
                                            <div className="flex items-center justify-end gap-3 text-xs text-gray-500">
                                                <button className="hover:text-green-400 flex items-center gap-1 transition-colors bg-green-500/5 hover:bg-green-500/10 px-2 py-1 rounded">
                                                    <Zap size={12} /> Promocionar
                                                </button>
                                                <button
                                                    className="hover:text-white flex items-center gap-1 transition-colors px-2 py-1"
                                                    onClick={() => setCurrentView('files')}
                                                >
                                                    <ArrowRight size={12} /> Mover
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-600 text-xs">
                                        No hay items estancados por ahora. ¡Buen trabajo!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
