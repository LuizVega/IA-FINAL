import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { AlertCircle, Package, TrendingUp, ChevronRight, Check, ShoppingBag, ExternalLink, Share2, QrCode, X, Zap } from 'lucide-react';
import { ProductImage } from '../ProductImage';
import { DEFAULT_PRODUCT_IMAGE, getPlanLimit, getPlanName } from '../../constants';
import { WhatsAppHelpButton } from '../WhatsAppHelpButton';
import { SmartSyncUpload } from '../SmartSyncUpload';

export const MobileStatsView: React.FC = () => {
    const { t } = useTranslation();
    const {
        inventory,
        orders = [],
        setCurrentView,
        setFilters,
        setSelectedProduct,
        setIsDetailsOpen,
        settings,
        isDemoMode,
        setQRModalOpen,
        isPromoBannerDismissed,
        setPromoBannerDismissed,
        claimOffer,
        updateSettings,
        session
    } = useStore() as any;

    // Calc plan limits
    const PLAN_LIMIT = getPlanLimit(settings.plan);
    const usagePercentage = Math.min((inventory.length / PLAN_LIMIT) * 100, 100);

    // Calc simple metrics based on completed orders mapped from global config
    const completedSales = (orders as any[]).filter((order: any) => order.status === 'completed');
    const pendingOrders = (orders as any[]).filter((order: any) => order.status === 'pending');
    const totalRevenue = completedSales.reduce((sum: number, sale: any) => sum + (sale.totalTotal || sale.total_amount || 0), 0);
    const totalOrders = completedSales.length;

    const handleViewAllAttention = () => {
        // Filter inventory for items needing attention (stock <= 5)
        setFilters({
            categories: [],
            minPrice: '',
            maxPrice: '',
            tags: [],
            stockBelow: 5
        });
        setCurrentView('all-items' as any); // Navigate to inventory view to show filtered items
    };

    const handleAttentionItemClick = (item: any) => {
        setFilters({
            categories: [],
            minPrice: '',
            maxPrice: '',
            tags: [],
            stockBelow: undefined
        });
        setSelectedProduct(item);
        setIsDetailsOpen(true);
        setCurrentView('all-items' as any);
    };

    // Filter products requiring attention (low stock)
    const attentionNeeded = (inventory as any[]).filter((i: any) => i.stock > 0 && i.stock <= 5).slice(0, 3);
    const noStock = (inventory as any[]).filter((i: any) => i.stock === 0).slice(0, 2);
    const combinedAttention = [...noStock, ...attentionNeeded].slice(0, 3);

    return (
        <div className="p-4 pb-24 bg-black text-white min-h-screen font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 pt-4">
                <div className="flex flex-col">
                    <span className="text-gray-400 text-sm font-medium">{t('dashboard.overview')}</span>
                    <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.analytics')}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/${settings.storeSlug || session?.user.id}`;
                            window.open(url, '_blank');
                        }}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                        title="Ver Tienda"
                    >
                        <ExternalLink size={20} />
                    </button>
                    <button
                        onClick={() => setQRModalOpen(true)}
                        className="w-10 h-10 rounded-full bg-white text-black border border-white/10 flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-white/10"
                        title="Ver QR"
                    >
                        <QrCode size={20} />
                    </button>
                    <button
                        onClick={() => setQRModalOpen(true)}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                        title="Compartir"
                    >
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentView('profile' as any)}
                        className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-[#2C2C2E] flex flex-shrink-0 items-center justify-center overflow-hidden active:scale-95 transition-transform"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Promo Banner: 3 Months Free */}
            {!settings.hasClaimedOffer && !isPromoBannerDismissed && session && (
                <div className="relative mb-6 rounded-3xl overflow-hidden border border-green-500/30 shadow-lg shadow-green-500/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-black"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 blur-2xl rounded-full"></div>
                    <div className="relative p-5">
                        <button
                            onClick={() => setPromoBannerDismissed(true)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors z-10"
                        >
                            <X size={16} />
                        </button>
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={16} className="text-green-400 fill-green-400" />
                            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Oferta de Lanzamiento</span>
                        </div>
                        <h3 className="text-xl font-black text-white mb-1">¡3 Meses Gratis!</h3>
                        <p className="text-white/40 text-sm mb-4 leading-snug">
                            Activa tu plan Growth por los primeros 3 meses sin costo. Gestión ilimitada, CRM y más.
                        </p>
                        <button
                            onClick={async () => {
                                await claimOffer();
                                setPromoBannerDismissed(true);
                            }}
                            className="w-full py-3 bg-green-500 text-black font-black rounded-2xl shadow-lg shadow-green-500/20 text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Zap size={16} fill="black" />  ¡Activar Oferta!
                        </button>
                    </div>
                </div>
            )}

            <main className="space-y-6">
                {/* NEW: Smart Sync Upload for Mobile */}
                <div className="mb-8">
                    <SmartSyncUpload />
                </div>

                {/* Attention Needed */}
                <section>
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-xl font-bold tracking-tight text-white">{t('dashboard.attentionNeeded') || 'Attention Needed'}</h2>
                        <button onClick={handleViewAllAttention} className="text-[#32D74B] text-sm font-bold active:opacity-60 transition-opacity">
                            View All
                        </button>
                    </div>
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl overflow-hidden shadow-2xl divide-y divide-[#2C2C2E]">
                        {combinedAttention.length > 0 ? combinedAttention.map((item: any) => (
                            <div
                                key={item.id}
                                onClick={() => handleAttentionItemClick(item)}
                                className="flex items-center p-4 hover:bg-white/5 transition-colors active:bg-white/10 group cursor-pointer"
                            >
                                {/* Product Image Placeholder - Squared */}
                                <div className="w-14 h-14 bg-black rounded-2xl border border-white/10 flex items-center justify-center mr-4 overflow-hidden flex-shrink-0 group-hover:border-[#32D74B]/30 transition-colors">
                                    <ProductImage
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate text-base mb-1">{item.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded-md ${item.stock === 0 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            <AlertCircle size={12} />
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {item.stock === 0 ? (t('dashboard.outOfStock') || 'Out of stock') : `${t('dashboard.lowStock') || 'Low stock'} • ${item.stock} ${t('dashboard.left') || 'left'}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-lg font-bold text-white">${item.price?.toFixed(0) || '0'}</p>
                                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${item.stock === 0 ? 'text-red-500 bg-red-500/10' : 'text-orange-500 bg-orange-500/10'}`}>
                                        Urgent
                                    </span>
                                </div>
                                <ChevronRight size={16} className="text-gray-700 ml-3" />
                            </div>
                        )) : (
                            <div className="flex items-center p-8 justify-center text-gray-500 flex-col gap-2">
                                <div className="w-16 h-16 bg-[#32D74B]/5 rounded-full flex items-center justify-center">
                                    <Check size={32} className="text-[#32D74B]/20" />
                                </div>
                                <span className="text-sm font-medium">{t('dashboard.everythingInOrder') || 'Todo está en orden'}</span>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};
