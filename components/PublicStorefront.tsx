import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import {
    ShoppingCart, X, Search, Store, ArrowLeft, Instagram, Facebook, Globe,
    Play, Volume2, VolumeX
} from 'lucide-react';
import { ProductImage } from './ProductImage';
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

    // ── LOADING ──────────────────────────────────────────────────────────────
    if (isLoading && !previewSettings) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: bg }}>
                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }} />
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                        {activeSettings.storeLogo
                            ? <img src={activeSettings.storeLogo} alt="" className="w-12 h-12 object-cover rounded-xl" />
                            : <Store size={28} style={{ color: primaryColor }} />}
                    </div>
                </div>
                <p className="font-black text-xl tracking-tight mb-1" style={{ color: textColor }}>
                    {activeSettings.companyName || 'Cargando tienda...'}
                </p>
                <p className="text-xs font-medium tracking-widest uppercase opacity-40 animate-pulse" style={{ color: textColor }}>
                    Preparando catálogo
                </p>
                <div className="flex gap-1.5 mt-6">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    // ── EMPTY ────────────────────────────────────────────────────────────────
    if (!isLoading && filteredProducts.length === 0 && !localSearch) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ backgroundColor: bg, color: textColor }}>
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}12` }}>
                    <Store size={40} style={{ color: primaryColor }} />
                </div>
                <h2 className="text-3xl font-black mb-3">{t('storefront.catalogNotAvailable')}</h2>
                <p className="opacity-50 max-w-xs text-base">{t('storefront.catalogEmpty')}</p>
            </div>
        );
    }

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


            {/* ── STORE DESCRIPTION HERO ─────────────────────────────────── */}
            {activeSettings.storeDescription && (
                <div className="mx-4 mb-4 px-5 py-4 rounded-3xl overflow-hidden relative"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}12 0%, ${secondaryColor}10 100%)`, border: `1px solid ${primaryColor}18` }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20" style={{ backgroundColor: primaryColor }} />
                    <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-40" style={{ color: primaryColor }}>Sobre la tienda</p>
                    <p className="text-sm leading-relaxed font-medium relative z-10" style={{ color: textColor }}>
                        {activeSettings.storeDescription}
                    </p>
                </div>
            )}

            {/* ── NO RESULTS ─────────────────────────────────────────────── */}
            {filteredProducts.length === 0 && localSearch && (
                <div className="flex flex-col items-center justify-center gap-3 py-20" style={{ color: textColor }}>
                    <Search size={40} style={{ color: `${primaryColor}60` }} />
                    <p className="font-bold text-lg">Sin resultados para "{localSearch}"</p>
                    <button onClick={() => setLocalSearch('')} className="text-sm font-bold" style={{ color: primaryColor }}>
                        Limpiar búsqueda
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                EDITORIAL MOODBOARD — the main browsing experience
            ══════════════════════════════════════════════════════════════ */}
            {filteredProducts.length > 0 && (
                <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 pb-24">

                    {/* ── DESKTOP GRID (md+): Apple-style wide grid ── */}
                    <div className="hidden md:grid md:grid-cols-3 xl:grid-cols-4 md:gap-4 xl:gap-5 md:pt-2">
                        {filteredProducts.map((product, idx) => (
                            <DesktopCard
                                key={product.id}
                                product={product}
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                isDark={isDark}
                                textColor={textColor}
                                cardBg={cardBg}
                                cardBorder={cardBorder}
                                onTap={() => openReels(idx)}
                                onAddToCart={() => addToCart(product)}
                            />
                        ))}
                    </div>

                    {/* ── MOBILE EDITORIAL (< md): hero + duo pattern ── */}
                    <div className="md:hidden space-y-3">
                        {filteredProducts.map((product, idx) => {
                            // Layout pattern: 0=hero, 1,2=duo, 3=hero, 4,5=duo, etc.
                            const position = idx % 3; // 0=hero, 1=duo-left, 2=duo-right (but we handle duos as pairs)
                            const isHero = idx % 3 === 0;

                            // Hero card (full-width, tall)
                            if (isHero) {
                                return (
                                    <HeroCard
                                        key={product.id}
                                        product={product}
                                        primaryColor={primaryColor}
                                        secondaryColor={secondaryColor}
                                        isDark={isDark}
                                        textColor={textColor}
                                        cardBg={cardBg}
                                        cardBorder={cardBorder}
                                        onTap={() => openReels(idx)}
                                        onAddToCart={() => addToCart(product)}
                                    />
                                );
                            }

                            // Duo cards — render as a pair when idx is duo-left (idx % 3 === 1)
                            if (idx % 3 === 1) {
                                const leftProduct = product;
                                const rightProduct = filteredProducts[idx + 1] || null;
                                return (
                                    <div key={`duo-${idx}`} className="flex gap-3">
                                        <DuoCard
                                            product={leftProduct}
                                            primaryColor={primaryColor}
                                            secondaryColor={secondaryColor}
                                            isDark={isDark}
                                            textColor={textColor}
                                            cardBg={cardBg}
                                            cardBorder={cardBorder}
                                            onTap={() => openReels(idx)}
                                            onAddToCart={() => addToCart(leftProduct)}
                                        />
                                        {rightProduct ? (
                                            <DuoCard
                                                product={rightProduct}
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                isDark={isDark}
                                                textColor={textColor}
                                                cardBg={cardBg}
                                                cardBorder={cardBorder}
                                                onTap={() => openReels(idx + 1)}
                                                onAddToCart={() => addToCart(rightProduct)}
                                            />
                                        ) : (
                                            <div className="flex-1" /> // empty spacer
                                        )}
                                    </div>
                                );
                            }

                            // Duo-right cards are rendered together with duo-left — skip
                            return null;
                        })}

                        {/* Footer */}
                        <div className="mt-6 flex flex-col items-center gap-3 py-6">
                            <div className="h-px w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }} />
                            <div className="flex items-center gap-3">
                                {activeSettings.instagramUrl && (
                                    <a href={`https://${activeSettings.instagramUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                                        className="p-2.5 rounded-full border" style={{ borderColor: cardBorder, backgroundColor: cardBg }}>
                                        <Instagram size={17} style={{ color: primaryColor }} />
                                    </a>
                                )}
                                {activeSettings.facebookUrl && (
                                    <a href={`https://${activeSettings.facebookUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                                        className="p-2.5 rounded-full border" style={{ borderColor: cardBorder, backgroundColor: cardBg }}>
                                        <Facebook size={17} style={{ color: primaryColor }} />
                                    </a>
                                )}
                                {activeSettings.websiteUrl && (
                                    <a href={`https://${activeSettings.websiteUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                                        className="p-2.5 rounded-full border" style={{ borderColor: cardBorder, backgroundColor: cardBg }}>
                                        <Globe size={17} style={{ color: primaryColor }} />
                                    </a>
                                )}
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-25" style={{ color: textColor }}>
                                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} en el catálogo
                            </p>
                        </div>
                    </div> {/* end md:hidden */}
                </div> /* end max-w-3xl wrapper */
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
// DESKTOP CARD — uniform compact card for 3-col desktop grid
// ─────────────────────────────────────────────────────────────────────────────
interface CardProps {
    product: Product;
    primaryColor: string;
    secondaryColor: string;
    isDark: boolean;
    textColor: string;
    cardBg: string;
    cardBorder: string;
    onTap: () => void;
    onAddToCart: () => void;
}

const DesktopCard: React.FC<CardProps> = ({
    product, primaryColor, secondaryColor, isDark, textColor, cardBg, cardBorder, onTap, onAddToCart
}) => {
    const hasVideo = !!product.videoUrl;
    return (
        <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ border: `1px solid ${cardBorder}`, backgroundColor: cardBg, boxShadow: `0 2px 16px -6px ${primaryColor}15` }}
            onClick={onTap}
        >
            {/* Image area */}
            <div className="relative" style={{ height: '200px' }}>
                {hasVideo ? (
                    <video src={product.videoUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                ) : (
                    <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.7) 100%)' }} />
                {hasVideo && <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                {/* Category badge */}
                <span className="absolute top-2.5 right-2.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md"
                    style={{ backgroundColor: `${secondaryColor}30`, color: secondaryColor, border: `1px solid ${secondaryColor}40` }}>
                    {product.category}
                </span>
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}80` }}>Agotado</span>
                    </div>
                )}
            </div>
            {/* Info */}
            <div className="p-3.5">
                <p className="font-black text-sm truncate leading-tight mb-0.5" style={{ color: textColor }}>{product.name}</p>
                {product.description && (
                    <p className="text-xs line-clamp-1 opacity-50 mb-2" style={{ color: textColor }}>{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-1.5">
                    <span className="font-black text-base" style={{ color: primaryColor }}>S/ {product.price.toFixed(2)}</span>
                    <button
                        onClick={e => { e.stopPropagation(); onAddToCart(); }}
                        disabled={product.stock <= 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-black active:scale-95 transition-all disabled:opacity-40"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 4px 12px -4px ${primaryColor}60` }}
                    >
                        <ShoppingCart size={12} />
                        {product.stock <= 0 ? 'Agotado' : 'Añadir'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO CARD — full-width, tall, cinematic (mobile editorial)
// ─────────────────────────────────────────────────────────────────────────────
const HeroCard: React.FC<CardProps> = ({
    product, primaryColor, secondaryColor, isDark, textColor, cardBg, cardBorder, onTap, onAddToCart
}) => {
    const hasVideo = !!product.videoUrl;
    const [muted, setMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Inline silent preview
    useEffect(() => {
        if (hasVideo && videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    }, [hasVideo]);

    return (
        <div
            className="relative w-full rounded-3xl overflow-hidden cursor-pointer active:scale-[0.985] transition-transform"
            style={{
                height: 'clamp(220px, 45vw, 310px)',
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: `0 4px 24px -8px ${primaryColor}20`
            }}
            onClick={onTap}
        >
            {/* Media */}
            {hasVideo ? (
                <video
                    ref={videoRef}
                    src={product.videoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop muted={muted} playsInline
                />
            ) : (
                <ProductImage src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.90) 100%)' }} />

            {/* Brand bloom */}
            <div className="absolute bottom-0 left-0 w-48 h-48 blur-[60px] opacity-30 pointer-events-none" style={{ backgroundColor: primaryColor }} />

            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md"
                    style={{ backgroundColor: `${secondaryColor}25`, color: secondaryColor, border: `1px solid ${secondaryColor}35` }}>
                    {product.category}
                </span>
                {hasVideo && (
                    <>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)' }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-white text-[9px] font-black uppercase tracking-widest">Video</span>
                        </div>
                        {/* mute toggle */}
                        <button
                            onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        >
                            {muted ? <VolumeX size={13} className="text-white" /> : <Volume2 size={13} className="text-white" />}
                        </button>
                    </>
                )}
                {product.stock <= 0 && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md text-white"
                        style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        Agotado
                    </span>
                )}
            </div>

            {/* Play hint */}
            {!hasVideo && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                    style={{ backgroundColor: `${primaryColor}30`, border: `1.5px solid ${primaryColor}50` }}>
                    <Play size={22} style={{ color: primaryColor }} fill={primaryColor} />
                </div>
            )}

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white text-xl font-black tracking-tight leading-tight mb-1">{product.name}</h3>
                {product.description && (
                    <p className="text-white/60 text-xs line-clamp-1 mb-3">{product.description}</p>
                )}
                <div className="flex items-center justify-between">
                    <p className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>
                        S/ {product.price.toFixed(2)}
                    </p>
                    <button
                        onClick={e => { e.stopPropagation(); onAddToCart(); }}
                        disabled={product.stock <= 0}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-black active:scale-95 transition-all disabled:opacity-40"
                        style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            boxShadow: `0 6px 20px -6px ${primaryColor}80`,
                        }}
                    >
                        <ShoppingCart size={15} />
                        {product.stock <= 0 ? 'Agotado' : 'Añadir'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DUO CARD — half-width, compact
// ─────────────────────────────────────────────────────────────────────────────
const DuoCard: React.FC<CardProps> = ({
    product, primaryColor, secondaryColor, isDark, textColor, cardBg, cardBorder, onTap, onAddToCart
}) => {
    const hasVideo = !!product.videoUrl;

    return (
        <div
            className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.96] transition-transform"
            style={{ border: `1px solid ${cardBorder}`, backgroundColor: cardBg, minWidth: 0 }}
            onClick={onTap}
        >
            {/* Image / Video thumbnail */}
            <div className="relative" style={{ height: 'clamp(140px, 28vw, 200px)' }}>
                {hasVideo ? (
                    <video
                        src={product.videoUrl}
                        className="w-full h-full object-cover"
                        muted playsInline preload="metadata"
                    />
                ) : (
                    <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 100%)' }} />
                {hasVideo && (
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}80` }}>Agotado</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-xs font-black truncate leading-tight mb-2" style={{ color: textColor }}>{product.name}</p>
                <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-sm" style={{ color: primaryColor }}>S/ {product.price.toFixed(2)}</span>
                    <button
                        onClick={e => { e.stopPropagation(); onAddToCart(); }}
                        disabled={product.stock <= 0}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 active:scale-90 transition-all disabled:opacity-40"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                        <ShoppingCart size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};
