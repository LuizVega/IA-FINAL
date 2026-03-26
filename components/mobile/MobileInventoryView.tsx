import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ProductImage } from '../ProductImage';
import { Search, Plus, Minus, Zap, ChevronRight, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrencySymbol } from '../../lib/utils';

export const MobileInventoryView: React.FC<{
    onContextMenu?: (e: any, type: 'item' | 'folder', id: string) => void
}> = ({ onContextMenu }) => {
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
        updateProduct,
        settings
    } = useStore() as any;

    const longPressTimer = useRef<any>(null);
    const [pressingId, setPressingId] = useState<string | null>(null);

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

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent, item: any) => {
        setPressingId(item.id);
        longPressTimer.current = setTimeout(() => {
            if (onContextMenu) {
                // Approximate position for mobile
                const touch = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
                onContextMenu({ clientX: touch.clientX, clientY: touch.clientY } as any, 'item', item.id);
            }
            setPressingId(null);
        }, 600);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        setPressingId(null);
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

                    {/* Grid Content - 2 columns squared */}
                    <div className="grid grid-cols-2 gap-3 pb-24">
                        <AnimatePresence mode="popLayout">
                            {items.map((item: any, idx: number) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    layout
                                    onPointerDown={(e) => handleTouchStart(e, item)}
                                    onPointerUp={handleTouchEnd}
                                    onPointerLeave={handleTouchEnd}
                                    onClick={() => !pressingId && handleItemClick(item)}
                                    className={`
                                        relative aspect-square bg-[#1C1C1E] rounded-[24px] border border-white/[0.05] 
                                        overflow-hidden flex flex-col transition-all active:scale-[0.96] shadow-xl
                                        ${pressingId === item.id ? 'ring-4 ring-[#32D74B]/30 border-[#32D74B]/50' : ''}
                                        ${item.stock < 5 ? 'border-red-500/30' : ''}
                                    `}
                                >
                                    {/* background image */}
                                    <div className="absolute inset-0 z-0">
                                        <ProductImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-40" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/60 to-transparent" />
                                    </div>

                                    {/* stock badge */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border
                                            ${item.stock < 5 ? 'bg-red-500 text-white border-red-400' : 'bg-[#32D74B]/10 text-[#32D74B] border-[#32D74B]/20'}
                                        `}>
                                            {item.stock} {t('dashboard.items') || 'STOCK'}
                                        </span>
                                    </div>

                                    {/* More button to hint context menu */}
                                    <div className="absolute top-3 right-3 z-10 text-white/20">
                                        <MoreVertical size={14} />
                                    </div>

                                    {/* Pricing & Name at bottom */}
                                    <div className="mt-auto p-3.5 z-10 relative">
                                        <div className="text-[11px] font-bold text-[#32D74B] mb-0.5 bg-black/40 inline-block px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
                                            {getCurrencySymbol(settings?.currency)} {item.price?.toFixed(2)}
                                        </div>
                                        <h3 className="font-bold text-white text-[13px] leading-tight line-clamp-2 drop-shadow-md">
                                            {item.name}
                                        </h3>
                                    </div>

                                    {/* Minimal Stock controls (floating) */}
                                    <div className="absolute bottom-12 right-2 z-20 flex flex-col gap-1.5 opacity-0 active:opacity-100 transition-opacity">
                                         <button onClick={(e) => { e.stopPropagation(); incrementStock(item.id); }} className="w-8 h-8 bg-[#32D74B] text-black rounded-full flex items-center justify-center shadow-lg"><Plus size={14} strokeWidth={3} /></button>
                                         <button onClick={(e) => { e.stopPropagation(); decrementStock(item.id); }} className="w-8 h-8 bg-white/10 text-white rounded-full border border-white/10 flex items-center justify-center shadow-lg"><Minus size={14} strokeWidth={3} /></button>
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
