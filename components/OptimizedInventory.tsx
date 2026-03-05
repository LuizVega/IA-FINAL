import React, { useMemo } from 'react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { differenceInDays, parseISO } from 'date-fns';
import { RefreshCw, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ProductImage } from './ProductImage';

export const OptimizedInventory: React.FC = () => {
    const { inventory, settings } = useStore();
    const { t } = useTranslation();

    // Filter items that need attention: Low Stock (< 5) or Stagnant (older than threshold)
    const priorityItems = useMemo(() => {
        const stagnantThreshold = settings.stagnantDaysThreshold || 90;

        // Sort logic: Low stock first, then stagnant, then just recent items if we don't have enough priority
        let items = [...inventory].sort((a, b) => {
            // Prioritize low stock
            if (a.stock <= 5 && b.stock > 5) return -1;
            if (b.stock <= 5 && a.stock > 5) return 1;

            // Secondary: Stagnant
            const aAge = a.entryDate ? differenceInDays(new Date(), parseISO(a.entryDate)) : 0;
            const bAge = b.entryDate ? differenceInDays(new Date(), parseISO(b.entryDate)) : 0;

            if (aAge > stagnantThreshold && bAge <= stagnantThreshold) return -1;
            if (bAge > stagnantThreshold && aAge <= stagnantThreshold) return 1;

            // Otherwise sort by lowest stock first
            return a.stock - b.stock;
        });

        return items.slice(0, 5); // Show top 5 items
    }, [inventory, settings.stagnantDaysThreshold]);

    if (priorityItems.length === 0) return null;

    const maxStock = Math.max(...inventory.map(i => i.stock), 50); // Use 50 as baseline if max is lower to avoid weird bars

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-4 px-2">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Inventario Optimizado</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Estado en tiempo real de artículos clave</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <RefreshCw size={12} className="animate-spin-slow" />
                    Actualizado hace un momento
                </div>
            </div>

            <div className="bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 md:p-5 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-black/20">
                    <div className="col-span-6 md:col-span-4 pl-2">Detalles del Producto</div>
                    <div className="hidden md:block col-span-3">Identificador</div>
                    <div className="col-span-3 md:col-span-2 text-center">Estado</div>
                    <div className="hidden md:block col-span-2 text-center">Disponibilidad</div>
                    <div className="col-span-3 md:col-span-1 text-right pr-2">Stock</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-white/5">
                    {priorityItems.map((item) => {
                        const isLowStock = item.stock <= 5;
                        const age = item.entryDate ? differenceInDays(new Date(), parseISO(item.entryDate)) : 0;
                        const isStagnant = age > (settings.stagnantDaysThreshold || 90);

                        // Availability Calculation
                        const availabilityPct = Math.min((item.stock / (maxStock * 0.5)) * 100, 100);

                        return (
                            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-white/5 transition-colors cursor-pointer group">

                                {/* Product Details */}
                                <div className="col-span-6 md:col-span-4 flex items-center gap-3 md:gap-4 overflow-hidden">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#222] rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
                                        <ProductImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">{item.name}</h3>
                                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.brand} • {item.category}</p>
                                    </div>
                                </div>

                                {/* SKU */}
                                <div className="hidden md:flex col-span-3 items-center">
                                    <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded truncate border border-white/5">{item.sku}</span>
                                </div>

                                {/* Status */}
                                <div className="col-span-3 md:col-span-2 flex justify-center">
                                    {isLowStock ? (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                            Stock Bajo
                                        </span>
                                    ) : isStagnant ? (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                                            <TrendingDown size={12} className="shrink-0" />
                                            Estancado
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            Sincronizado
                                        </span>
                                    )}
                                </div>

                                {/* Availability Bar */}
                                <div className="hidden md:flex col-span-2 items-center justify-center gap-3">
                                    <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isLowStock ? 'bg-orange-500' : 'bg-green-500'}`}
                                            style={{ width: `${availabilityPct}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 w-8">{availabilityPct.toFixed(0)}%</span>
                                </div>

                                {/* Stock Level */}
                                <div className="col-span-3 md:col-span-1 text-right flex flex-col justify-center items-end h-full">
                                    <span className={`text-sm font-bold ${isLowStock ? 'text-orange-400' : 'text-white'}`}>{item.stock}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5 hidden md:block">Unidades</span>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
