import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ProductImage } from '../ProductImage';
import { Search, Plus, Minus, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        updateProduct
    } = useStore() as any;

    const [activePill, setActivePill] = useState<'all' | 'recent' | 'low' | string>(filters.stockBelow !== undefined ? 'low' : 'all');

    useEffect(() => {
        if (filters.stockBelow !== undefined) {
            setActivePill('low');
        }
    }, [filters.stockBelow]);

    const items = useMemo(() => {
        let filtered = getFilteredInventory();

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

    useEffect(() => {
        return () => {
            resetFilters();
        };
    }, []);

    const handleAddItem = () => {
        setEditingProduct(null);
        setAddProductModalOpen(true);
    };

    const handlePanicStock = (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        if (confirm(`¿Marcar "${item.name}" como AGOTADO?`)) {
            updateProduct(item.id, { stock: 0 });
        }
    };

    const handleItemClick = (item: any) => {
        setSelectedProduct(item);
        setIsDetailsOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-[#000000] text-[#FFFFFF] font-sans overflow-hidden">
            {/* 1. FIXED SEARCH BAR - Always at the top */}
            <div className="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-2xl border-b border-white/5 pt-1.5 pb-2.5 px-5">
                <div className="max-w-md mx-auto relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/70 transition-colors pointer-events-none">
                        <Search size={14} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/10 border border-transparent focus:border-white/10 rounded-[10px] py-1.5 pl-9 pr-4 text-[15px] font-medium text-white focus:outline-none transition-all placeholder:text-white/30"
                        placeholder={t('dashboard.searchPlaceholder') || 'Buscar...'}
                    />
                </div>
            </div>

            {/* 2. SCROLLABLE AREA - Title, Filters, and List */}
            <div className="flex-grow overflow-y-auto px-5 no-scrollbar">
                <div className="max-w-md mx-auto pt-4">
                    {/* Title Area - Scrolls away */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-0.5">
                            <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                                {t('dashboard.inventory') || 'Inventario'}
                            </h1>
                            <p className="text-[10px] font-bold text-white/30 tracking-[0.06em] uppercase">
                                {items.length} {t('dashboard.items') || 'PRODUCTOS'}
                            </p>
                        </div>
                        <button
                            onClick={handleAddItem}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center text-white border border-white/10 shadow-lg"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Filter Pills - Smaller and scrolls away */}
                    <div className="flex gap-1.5 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                        <FilterPill
                            active={activePill === 'all'}
                            onClick={() => setActivePill('all')}
                            label="Todo"
                        />
                        <FilterPill
                            active={activePill === 'recent'}
                            onClick={() => setActivePill('recent')}
                            label={t('dashboard.recents') || 'Recientes'}
                        />
                        <FilterPill
                            active={activePill === 'low' || filters.stockBelow !== undefined}
                            onClick={() => {
                                setActivePill('low');
                                setFilters({ stockBelow: 5 });
                            }}
                            label={t('dashboard.lowStock') || 'Bajo Stock'}
                            variant="warning"
                        />
                        {folders.map((folder: any) => (
                            <FilterPill
                                key={folder.id}
                                active={activePill === folder.id}
                                onClick={() => {
                                    setActivePill(folder.id);
                                    resetFilters();
                                }}
                                label={folder.name}
                            />
                        ))}
                    </div>

                    {/* List Content */}
                    <div className="space-y-3 pb-24">
                        <AnimatePresence mode="popLayout">
                            {items.map((item: any, idx: number) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    layout
                                    onClick={() => handleItemClick(item)}
                                    className="bg-[#1C1C1E] p-3.5 rounded-[20px] border border-white/[0.03] flex items-center gap-3.5 active:scale-[0.97] transition-all relative overflow-hidden group shadow-sm"
                                >
                                    {/* Product Thumb */}
                                    <div className="w-14 h-14 rounded-[12px] bg-black/40 flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/5 relative shadow-inner">
                                        <ProductImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                                        <div>
                                            <h3 className="font-bold text-white text-[15px] leading-tight tracking-tight truncate group-hover:text-[#32D74B] transition-colors">{item.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.stock > 10 ? 'bg-[#32D74B]' : item.stock > 0 ? 'bg-orange-400' : 'bg-red-500'}`} />
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.stock} {t('dashboard.items') || 'STOCK'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-0.5">
                                            <span className="text-lg font-black text-white leading-none">${item.price?.toFixed(0) || '0'}</span>
                                        </div>
                                    </div>

                                    {/* Stock Unit Controls */}
                                    <div className="flex flex-col items-center gap-1.5 bg-white/[0.03] p-1 rounded-[12px] border border-white/[0.05]" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => incrementStock(item.id)}
                                            className="w-7 h-7 rounded-lg bg-[#32D74B] text-black flex items-center justify-center active:scale-90 transition-all shadow-lg"
                                        >
                                            <Plus size={14} strokeWidth={3} />
                                        </button>

                                        <button
                                            onClick={(e) => handlePanicStock(e, item)}
                                            className={`w-7 h-4 flex items-center justify-center rounded-md transition-colors ${item.stock === 0 ? 'text-red-500' : 'text-white/10'}`}
                                        >
                                            <Zap size={10} fill={item.stock === 0 ? "currentColor" : "none"} />
                                        </button>

                                        <button
                                            onClick={() => decrementStock(item.id)}
                                            className="w-7 h-7 rounded-lg bg-white/5 text-white flex items-center justify-center active:scale-90 transition-all border border-white/5"
                                        >
                                            <Minus size={14} strokeWidth={3} />
                                        </button>
                                    </div>

                                    <div className="absolute top-4 right-4 text-white/5 group-hover:text-white/20 transition-colors">
                                        <ChevronRight size={14} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {items.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                                <Search className="text-white/5 mx-auto mb-3" size={24} />
                                <p className="text-white/20 text-xs">{t('common.noResults') || 'Sin productos'}</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface FilterPillProps {
    active: boolean;
    onClick: () => void;
    label: string;
    variant?: 'default' | 'warning';
}

const FilterPill: React.FC<FilterPillProps> = ({ active, onClick, label, variant = 'default' }) => {
    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all duration-300 ${active
                ? variant === 'warning'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-[#32D74B] text-black shadow-md'
                : 'bg-white/5 text-white/40 active:bg-white/10'
                }`}
        >
            {label}
        </button>
    );
};
