import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ProductImage } from '../ProductImage';
import { DEFAULT_PRODUCT_IMAGE, getPlanLimit, getPlanName } from '../../constants';
import { Search, SlidersHorizontal, Plus, Minus, AlertCircle } from 'lucide-react';

export const MobileInventoryView: React.FC = () => {
    const { t } = useTranslation();
    const {
        getFilteredInventory,
        currentFolderId,
        incrementStock,
        decrementStock,
        searchQuery,
        setSearchQuery,
        setAddProductModalOpen,
        setSelectedProduct,
        setIsDetailsOpen,
        inventory,
        folders,
        setFilters,
        resetFilters,
        setEditingProduct,
        filters,
        settings,
        setCurrentView
    } = useStore() as any;

    // Local filter state for pills
    const [activePill, setActivePill] = useState<'all' | 'recent' | 'low' | string>(filters.stockBelow !== undefined ? 'low' : 'all');

    // Sync activePill with filters.stockBelow if changed externally (e.g. from dashboard)
    useEffect(() => {
        if (filters.stockBelow !== undefined) {
            setActivePill('low');
        }
    }, [filters.stockBelow]);

    const items = useMemo(() => {
        let filtered = getFilteredInventory();

        // If we have categories from pills
        if (activePill !== 'all' && activePill !== 'recent' && activePill !== 'low') {
            filtered = filtered.filter((i: any) => i.folderId === activePill || i.category === activePill);
        }

        if (currentFolderId) {
            filtered = filtered.filter((i: any) => i.folderId === currentFolderId);
        }

        if (activePill === 'recent') {
            filtered = [...filtered].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
        } else if (activePill === 'low') {
            filtered = filtered.filter((i: any) => i.stock <= 5);
        }

        return filtered;
    }, [getFilteredInventory, currentFolderId, activePill, inventory, filters.stockBelow]);

    // Reset filters on unmount or when navigating away
    // This ensures that if we entered via "View All" (stockBelow: 5), 
    // it doesn't stay that way forever.
    React.useEffect(() => {
        return () => {
            resetFilters();
        };
    }, []);

    const handleAddItem = () => {
        setEditingProduct(null);
        setAddProductModalOpen(true);
    };

    const handleItemClick = (item: any) => {
        setSelectedProduct(item);
        setIsDetailsOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
                <div className="max-w-md mx-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight text-white">{t('dashboard.inventory') || 'Inventario'}</h1>
                        <button
                            onClick={handleAddItem}
                            className="w-10 h-10 rounded-full bg-[#32D74B] flex items-center justify-center text-black border border-white/10 shadow-[0_0_15px_rgba(50,215,75,0.3)] active:scale-95 transition-transform"
                        >
                            <Plus size={24} />
                        </button>
                    </div>

                    <div className="flex gap-2 items-center">
                        <div className="flex-grow relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#32D74B]/50 transition-colors placeholder:text-white/40"
                                placeholder={t('dashboard.searchPlaceholder') || 'Buscar productos...'}
                            />
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                        <button
                            onClick={() => setActivePill('all')}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activePill === 'all' ? 'bg-[#14c00f] text-black shadow-lg shadow-[#14c00f]/20' : 'bg-white/5 border border-white/5 text-white/60'}`}
                        >
                            Todo
                        </button>
                        <button
                            onClick={() => setActivePill('recent')}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activePill === 'recent' ? 'bg-[#14c00f] text-black shadow-lg shadow-[#14c00f]/20' : 'bg-white/5 border border-white/5 text-white/60'}`}
                        >
                            {t('dashboard.recents') || 'Recientes'}
                        </button>
                        <button
                            onClick={() => {
                                setActivePill('low');
                                setFilters({ stockBelow: 5 });
                            }}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activePill === 'low' || filters.stockBelow !== undefined ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 border border-white/5 text-white/60'}`}
                        >
                            {t('dashboard.lowStock') || 'Bajo Stock'}
                        </button>

                        {/* Dynamic Category Pills */}
                        {folders.map((folder: any) => (
                            <button
                                key={folder.id}
                                onClick={() => {
                                    setActivePill(folder.id);
                                    resetFilters();
                                }}
                                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activePill === folder.id ? 'bg-[#32D74B] text-black shadow-lg shadow-[#32D74B]/20' : 'bg-white/5 border border-white/5 text-white/60'}`}
                            >
                                {folder.name}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content List */}
            <main className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
                <div className="flex flex-col gap-3 mb-4 px-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight text-white/60">{t('dashboard.products') || 'Productos'}</h2>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{items.length} {t('dashboard.items') || 'ITEMS'}</span>
                    </div>

                    {/* Compact Usage Bar in Inventory */}
                    {getPlanLimit(settings.plan) < Infinity && (
                        <div
                            onClick={() => setCurrentView('pricing')}
                            className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-2 active:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                <span className="text-white/40">Uso Plan {getPlanName(settings.plan)}: {inventory.length} / {getPlanLimit(settings.plan)}</span>
                                <span className={inventory.length >= getPlanLimit(settings.plan) * 0.9 ? 'text-red-500 font-black' : 'text-[#32D74B] font-black'}>
                                    {Math.round((inventory.length / getPlanLimit(settings.plan)) * 100)}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full transition-all duration-1000 ${inventory.length >= getPlanLimit(settings.plan) * 0.9 ? 'bg-red-500' : inventory.length >= getPlanLimit(settings.plan) * 0.7 ? 'bg-orange-500' : 'bg-[#32D74B]'}`}
                                    style={{ width: `${(inventory.length / getPlanLimit(settings.plan)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {items.map((item: any) => (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="bg-[#121212] p-4 rounded-[28px] border border-white/5 flex items-center gap-4 active:scale-[0.98] transition-all relative overflow-hidden group shadow-xl"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#14c00f]/5 transition-colors"></div>

                            {/* Product Image Placeholder */}
                            <div className="w-16 h-16 rounded-2xl bg-black flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-[#14c00f]/30 transition-colors relative z-10">
                                <ProductImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                            </div>

                            <div className="flex-grow min-w-0 relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.stock > 10 ? 'bg-[#14c00f]' : item.stock > 0 ? 'bg-orange-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></span>
                                    <h3 className="font-bold text-white truncate text-base tracking-tight">{item.name}</h3>
                                </div>
                                {item.sku && <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest truncate">{item.sku}</p>}
                                <p className="text-xl font-black text-white mt-1.5Tracking-tight">${item.price?.toFixed(0) || '0'}</p>
                            </div>

                            {/* Stock Controls */}
                            <div className="flex flex-col items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 relative z-10" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => incrementStock(item.id)}
                                    className="w-10 h-10 rounded-xl bg-[#14c00f] text-black flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-[#14c00f]/10"
                                >
                                    <Plus size={20} strokeWidth={3} />
                                </button>
                                <span className={`w-8 text-center font-black text-lg ${item.stock < 5 ? 'text-red-500' : 'text-white'}`}>{item.stock}</span>
                                <button
                                    onClick={() => decrementStock(item.id)}
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white active:scale-95 transition-transform border border-white/5"
                                >
                                    <Minus size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <div className="text-center py-10 text-white/40">
                            No se encontraron productos.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
