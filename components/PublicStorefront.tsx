import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import {
    ShoppingCart, X, Search, Store, ArrowLeft, Instagram, Facebook, Globe,
    Play, Volume2, VolumeX, MessageCircle, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductImage } from './ProductImage';
import { getCurrencySymbol, shareContent } from '../lib/utils';
import { AppLogo } from './AppLogo';
import { useTranslation } from '../hooks/useTranslation';
import { CartDrawer } from './CartDrawer';
import { AppSettings, Product } from '../types';
import { StoreReelCard } from './StoreReelCard';

interface PublicStorefrontProps {
    previewSettings?: AppSettings;
    onBack?: () => void;
}

export const PublicStorefront: React.FC<PublicStorefrontProps> = ({ previewSettings, onBack }) => {
    const { t } = useTranslation();
    const {
        inventory,
        categories,
        cart,
        addToCart,
        isCartOpen,
        setIsCartOpen,
        settings,
        isLoading,
        confirmInStallPurchase,
    } = useStore();

    const activeSettings = previewSettings ? { ...settings, ...previewSettings } : settings;

    const [localSearch, setLocalSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [searchOpen, setSearchOpen] = useState(false);
    const [reelsIndex, setReelsIndex] = useState<number | null>(null); // null = closed
    const [activeReelIdx, setActiveReelIdx] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const feedRef = useRef<HTMLDivElement>(null);

    const primaryColor = activeSettings.primaryColor || '#22c55e';
    const secondaryColor = activeSettings.secondaryColor || '#6366f1';
    const isDark = activeSettings.theme === 'dark';
    const bg = isDark ? '#050505' : '#FAFAFA';
    const textColor = isDark ? '#f3f4f6' : '#111111';
    const cardBg = isDark ? '#111111' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const headerBg = isDark ? 'rgba(5,5,5,0.88)' : 'rgba(250,250,250,0.88)';
    const headerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';

    // Filtered products
    const internalCategoryNames = categories.filter(c => c.isInternal).map(c => c.name);
    const publicCategories = categories.filter(c => !c.isInternal);

    const filteredProducts = inventory.filter(p => {
        if (p.name === '__STORE_CONFIG__') return false;
        if (internalCategoryNames.includes(p.category)) return false;
        const matchSearch = p.name.toLowerCase().includes(localSearch.toLowerCase());
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        return matchSearch && matchCat;
    });

    const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
    const cartCountForProduct = useCallback((id: string) =>
        cart.filter(i => i.id === id).reduce((a, i) => a + i.quantity, 0), [cart]);
    const storeSlug = window.location.pathname.split('/').filter(Boolean)[0] || undefined;

    // Search overlay focus
    useEffect(() => {
        if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    }, [searchOpen]);

    // Track active reel in overlay
    useEffect(() => {
        const feed = feedRef.current;
        if (!feed || reelsIndex === null) return;
        const slides = feed.querySelectorAll<HTMLElement>('[data-reel-index]');
        if (!slides.length) return;
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const idx = parseInt((entry.target as HTMLElement).dataset.reelIndex || '0', 10);
                        setActiveReelIdx(idx);
                    }
                });
            },
            { root: feed, threshold: 0.65 }
        );
        slides.forEach(s => observer.observe(s));
        return () => observer.disconnect();
    }, [reelsIndex, filteredProducts]);

    // Lock body scroll when reels overlay is open
    useEffect(() => {
        document.body.style.overflow = reelsIndex !== null ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [reelsIndex]);

    // Open Reels at a specific product index and scroll to it
    const openReels = (idx: number) => {
        setReelsIndex(idx);
        setActiveReelIdx(idx);
        // After overlay renders, scroll to the right slide
        setTimeout(() => {
            const feed = feedRef.current;
            if (!feed) return;
            const slide = feed.querySelector<HTMLElement>(`[data-reel-index="${idx}"]`);
            if (slide) slide.scrollIntoView({ behavior: 'auto' });
        }, 30);
    };

    const closeReels = () => setReelsIndex(null);

    const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);

    useEffect(() => {
        // Enforce a minimum load time for empty state to prevent flashing
        // The time is increased to ensure the "Catálogo no disponible" message
        // only appears if we are absolutely certain there are no items.
        if (!isLoading) {
            const timer = setTimeout(() => setIsInitiallyLoading(false), 2000);
            return () => clearTimeout(timer);
        } else {
            setIsInitiallyLoading(true);
        }
    }, [isLoading]);

    // ── LOADING / EMPTY TRANSITIONS ─────────────────────────────────────────
    const showSkeletons = (isLoading || isInitiallyLoading) && filteredProducts.length === 0;
    const showEmpty = !isLoading && !isInitiallyLoading && filteredProducts.length === 0 && !localSearch;

    return (
        <div
            className={`flex flex-col font-sans ${previewSettings ? 'rounded-2xl overflow-hidden' : ''}`}
            style={{ backgroundColor: bg, color: textColor, minHeight: '100dvh' }}
        >
            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <header
                className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between gap-2 backdrop-blur-2xl"
                style={{ backgroundColor: headerBg, borderBottom: `1px solid ${headerBorder}` }}
            >
                <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-full shrink-0 transition" style={{ backgroundColor: 'rgba(128,128,128,0.08)', color: textColor }}>
                            <ArrowLeft size={17} />
                        </button>
                    )}
                    {activeSettings.storeLogo ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border" style={{ borderColor: `${primaryColor}40` }}>
                            <img src={activeSettings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                            <Store size={18} />
                        </div>
                    )}
                    <span className="font-black tracking-tight truncate text-[15px]" style={{ color: textColor }}>
                        {activeSettings.companyName || t('storefront.onlineCatalog')}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={async () => {
                            await shareContent({
                                title: activeSettings.companyName || 'Mi Tienda',
                                text: `¡Visita mi tienda en MyMorez! ${activeSettings.companyName || ''}`,
                                url: window.location.href,
                            });
                        }}
                        className="p-2 rounded-full transition"
                        style={{ backgroundColor: 'rgba(128,128,128,0.08)', color: textColor }}
                        title="Compartir tienda"
                    >
                        <Share2 size={19} />
                    </button>
                    <button
                        onClick={() => setSearchOpen(p => !p)}
                        className="p-2 rounded-full transition"
                        style={{ backgroundColor: 'rgba(128,128,128,0.08)', color: textColor }}
                    >
                        <Search size={19} />
                    </button>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 rounded-full transition"
                        style={{ backgroundColor: 'rgba(128,128,128,0.08)', color: primaryColor }}
                    >
                        <ShoppingCart size={21} />
                        {cartCount > 0 && (
                            <span
                                className="absolute -top-1 -right-1 w-5 h-5 text-white text-[10px] font-black rounded-full flex items-center justify-center"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* ── SEARCH OVERLAY ─────────────────────────────────────────── */}
            {searchOpen && (
                <div
                    className="sticky top-[60px] z-30 px-4 py-3 flex items-center gap-3 animate-in slide-in-from-top duration-200 backdrop-blur-xl"
                    style={{ backgroundColor: headerBg, borderBottom: `1px solid ${headerBorder}` }}
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={17} style={{ color: primaryColor }} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar productos..."
                            value={localSearch}
                            onChange={e => setLocalSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none"
                            style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
                                color: textColor,
                            }}
                            onFocus={e => e.target.style.borderColor = primaryColor}
                            onBlur={e => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}
                        />
                    </div>
                    <button onClick={() => { setSearchOpen(false); setLocalSearch(''); }} className="p-2 rounded-full" style={{ backgroundColor: 'rgba(128,128,128,0.08)', color: textColor }}>
                        <X size={17} />
                    </button>
                </div>
            )}


            {/* ── PREMIUM STORE HERO ─────────────────────────────────────── */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative px-6 pt-10 pb-16 flex flex-col items-center text-center overflow-hidden"
            >
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10 opacity-30 pointer-events-none">
                    <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full blur-[100px]" style={{ backgroundColor: `${primaryColor}40` }} />
                    <div className="absolute top-10 -right-20 w-80 h-80 rounded-full blur-[100px]" style={{ backgroundColor: `${secondaryColor}30` }} />
                </div>

                {/* Logo / Icon */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="relative mb-6"
                >
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] flex items-center justify-center relative z-10 shadow-2xl p-0.5"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                        <div className="w-full h-full rounded-[2.4rem] bg-[#111] flex items-center justify-center overflow-hidden">
                            {activeSettings.storeLogo ? (
                                <img src={activeSettings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Store size={48} style={{ color: primaryColor }} />
                            )}
                        </div>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 blur-3xl opacity-40 -z-10" style={{ backgroundColor: primaryColor }} />
                </motion.div>

                {/* Store Name & Description */}
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white"
                >
                    {activeSettings.companyName || t('storefront.onlineCatalog')}
                </motion.h1>

                {activeSettings.storeDescription && (
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-8"
                    >
                        {activeSettings.storeDescription}
                    </motion.p>
                )}

                {/* Social Links */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-4"
                >
                    <div className="flex items-center gap-2">
                        {activeSettings.instagramUrl && (
                            <SocialLink 
                                href={activeSettings.instagramUrl} 
                                icon={<Instagram size={20} />} 
                                borderColor={headerBorder}
                                textColor={textColor}
                            />
                        )}
                        {activeSettings.facebookUrl && (
                            <SocialLink 
                                href={activeSettings.facebookUrl} 
                                icon={<Facebook size={20} />} 
                                borderColor={headerBorder}
                                textColor={textColor}
                            />
                        )}
                        {activeSettings.websiteUrl && (
                            <SocialLink 
                                href={activeSettings.websiteUrl} 
                                icon={<Globe size={20} />} 
                                borderColor={headerBorder}
                                textColor={textColor}
                            />
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* ── NO RESULTS ─────────────────────────────────────────────── */}
            {filteredProducts.length === 0 && localSearch && !isLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-20" style={{ color: textColor }}>
                    <Search size={40} style={{ color: `${primaryColor}60` }} />
                    <p className="font-bold text-lg">Sin resultados para "{localSearch}"</p>
                    <button onClick={() => setLocalSearch('')} className="text-sm font-bold" style={{ color: primaryColor }}>
                        Limpiar búsqueda
                    </button>
                </div>
            )}

            {/* ── EMPTY CATALOG ──────────────────────────────────────────── */}
            {showEmpty && (
                <div className="flex flex-col items-center justify-center px-8 py-20 text-center animate-in fade-in zoom-in duration-500" style={{ color: textColor }}>
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}12` }}>
                        <Store size={40} style={{ color: primaryColor }} />
                    </div>
                    <h2 className="text-3xl font-black mb-3">{t('storefront.catalogNotAvailable') || 'Catálogo no disponible'}</h2>
                    <p className="opacity-50 max-w-xs text-base">{t('storefront.catalogEmpty') || 'Aún no hay productos en esta tienda.'}</p>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MASONRY MOODBOARD — Pinterest / TikTok immersive grid
            ══════════════════════════════════════════════════════════════ */}
            {(filteredProducts.length > 0 || showSkeletons) && (
                <div className="w-full max-w-[1600px] mx-auto px-3 lg:px-6 pb-24">
                    {/* Masonry Layout Container */}
                    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 lg:gap-4 space-y-3 lg:space-y-4">
                        {showSkeletons
                            ? [1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} index={i} />)
                            : filteredProducts.map((product, idx) => (
                                <ModernStoreCard
                                    key={product.id}
                                    product={product}
                                    primaryColor={primaryColor}
                                    secondaryColor={secondaryColor}
                                    isDark={isDark}
                                    currency={activeSettings.currency}
                                    onTap={() => openReels(idx)}
                                    onAddToCart={() => addToCart(product)}
                                />
                            ))
                        }
                    </div>

                    {/* Footer Stats */}
                    {!showSkeletons && filteredProducts.length > 0 && (
                        <div className="mt-10 flex flex-col items-center gap-3 py-6">
                            <div className="h-px w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }} />
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-25" style={{ color: textColor }}>
                                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} en el catálogo
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                REELS OVERLAY — opens when a product is tapped
            ══════════════════════════════════════════════════════════════ */}
            {reelsIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black animate-in fade-in duration-200"
                    style={{ touchAction: 'pan-y' }}
                >
                    {/* Close button — safe-area aware, no competing cart button */}
                    <button
                        onClick={closeReels}
                        className="absolute z-[60] w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/15"
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.60)',
                            top: 'max(3.25rem, calc(env(safe-area-inset-top, 0px) + 0.875rem))',
                            left: '1rem',
                        }}
                    >
                        <X size={19} className="text-white" />
                    </button>

                    {/* Snap-scroll reel feed */}
                    <div
                        ref={feedRef}
                        className="w-full h-full overflow-y-scroll no-scrollbar"
                        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
                    >
                        {filteredProducts.map((product, idx) => (
                            <div
                                key={product.id}
                                data-reel-index={idx}
                                style={{ height: '100%', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
                            >
                                <StoreReelCard
                                    product={product}
                                    index={idx}
                                    total={filteredProducts.length}
                                    primaryColor={primaryColor}
                                    secondaryColor={secondaryColor}
                                    theme={activeSettings.theme as 'light' | 'dark'}
                                    cartCount={cartCountForProduct(product.id)}
                                    storeName={activeSettings.companyName || 'La Tienda'}
                                    storeSlug={storeSlug}
                                    currency={activeSettings.currency}
                                    onAddToCart={addToCart}
                                    isVisible={activeReelIdx === idx}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── CART DRAWER ────────────────────────────────────────────── */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onSuccess={confirmInStallPurchase} />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON CARD — shimmer effect loading placeholder for masonry
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
    // Alternate heights for masonry feel
    const height = index % 3 === 0 ? 'h-[320px]' : index % 2 === 0 ? 'h-[280px]' : 'h-[240px]';
    return (
        <div className={`relative w-full rounded-[1.5rem] overflow-hidden bg-white/5 border border-white/5 animate-pulse break-inside-avoid ${height}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                <div className="flex justify-between items-center pt-2">
                    <div className="h-6 w-1/3 bg-white/10 rounded-full" />
                    <div className="h-8 w-8 rounded-full bg-white/10" />
                </div>
            </div>
        </div>
    );
};

const SocialLink: React.FC<{ href: string; icon: React.ReactNode; borderColor: string; textColor: string }> = ({ href, icon, borderColor, textColor }) => (
    <motion.a 
        href={`https://${href.replace(/^https?:\/\//, '')}`} 
        target="_blank" 
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors shrink-0"
        style={{ borderColor: borderColor, backgroundColor: 'rgba(255,255,255,0.05)', color: textColor }}
    >
        {icon}
    </motion.a>
);

// ─────────────────────────────────────────────────────────────────────────────
// MODERN STORE CARD — Pinterest x TikTok style immersive vertical card
// ─────────────────────────────────────────────────────────────────────────────
interface CardProps {
    product: Product;
    primaryColor: string;
    secondaryColor: string;
    isDark: boolean;
    currency?: string;
    onTap: () => void;
    onAddToCart: () => void;
}

const ModernStoreCard: React.FC<CardProps> = ({
    product, primaryColor, secondaryColor, isDark, currency, onTap, onAddToCart
}) => {
    const hasVideo = !!product.videoUrl;
    
    // Vary the aspect ratio slightly based on content length or randomly 
    // to enhance the masonry effect, but keep it constrained.
    // In actual implementation, maybe use string length to decide height.
    const isTall = product.name.length > 25 || (product.description && product.description.length > 40);
    const cardHeight = isTall ? 'min-h-[300px]' : 'min-h-[260px]';

    return (
        <div
            className={`relative w-full rounded-[1.5rem] overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform break-inside-avoid ${cardHeight}`}
            style={{ 
                backgroundColor: isDark ? '#111' : '#f4f4f5', 
                boxShadow: `0 4px 20px -10px ${primaryColor}40` 
            }}
            onClick={onTap}
        >
            {/* Background Image (Cover) */}
            <div className="absolute inset-0 bg-black">
                <ProductImage src={product.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-lg scale-110" />
                <ProductImage src={product.imageUrl} alt={product.name} className="relative w-full h-full object-contain z-10" />
                {/* TikTok style dark gradient overlaid on the bottom to make text legible */}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
            </div>

            {/* Top Badges Area */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm"
                    style={{ backgroundColor: `${secondaryColor}E6`, color: '#fff' }}>
                    {product.category}
                </span>

                {product.stock <= 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md text-white shadow-sm"
                        style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        Agotado
                    </span>
                )}
            </div>

            {/* Play Indicator for Videos */}
            {hasVideo && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Play size={20} className="text-white ml-1" />
                </div>
            )}

            {/* Bottom Content Area (TikTok inspired) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col justify-end">
                <div className="mb-2">
                    <h3 className="text-white text-[15px] font-bold leading-snug line-clamp-2 drop-shadow-md">
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="text-white/80 text-[11px] line-clamp-1 mt-1 drop-shadow-sm font-medium">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-lg text-white drop-shadow-md tracking-tight">
                        {getCurrencySymbol(currency)} {product.price.toFixed(2)}
                    </span>
                    <button
                        onClick={e => { e.stopPropagation(); onAddToCart(); }}
                        disabled={product.stock <= 0}
                        className="flex items-center justify-center w-10 h-10 rounded-full text-white active:scale-90 transition-all shadow-lg disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
