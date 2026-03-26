import React, { useState } from 'react';
import { Heart, ShoppingCart, Share2, ChevronDown, ChevronUp, Check, Tag, X } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { getCurrencySymbol, shareContent } from '../lib/utils';
import { Product } from '../types';

interface StoreReelCardProps {
    product: Product;
    index: number;
    total: number;
    primaryColor: string;
    secondaryColor: string;
    theme: 'light' | 'dark';
    cartCount: number;
    storeName: string;
    storeSlug?: string;
    currency?: string;
    onAddToCart: (product: Product) => void;
    isVisible: boolean;
}

export const StoreReelCard: React.FC<StoreReelCardProps> = ({
    product,
    index,
    total,
    primaryColor,
    secondaryColor,
    theme,
    cartCount,
    storeName,
    storeSlug,
    currency,
    onAddToCart,
    isVisible,
}) => {
    const [liked, setLiked] = useState(false);
    const [likeAnim, setLikeAnim] = useState(false);
    const [addedAnim, setAddedAnim] = useState(false);
    const [infoExpanded, setInfoExpanded] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [shareAnim, setShareAnim] = useState(false);
    const isSoldOut = product.stock <= 0;

    const handleLike = () => {
        setLiked(prev => !prev);
        if (!liked) {
            setLikeAnim(true);
            setTimeout(() => setLikeAnim(false), 700);
        }
    };

    const handleAddToCart = () => {
        if (isSoldOut) return;
        onAddToCart(product);
        setAddedAnim(true);
        setTimeout(() => setAddedAnim(false), 1200);
    };

    const handleShare = async () => {
        const url = storeSlug
            ? `${window.location.origin}/${storeSlug}/p/${product.id}`
            : window.location.href;
            
        const result = await shareContent({
            title: product.name,
            text: `${product.name} — ${getCurrencySymbol(currency)} ${product.price.toFixed(2)} en ${storeName}`,
            url,
        });

        if (result === 'copied') {
            setShareAnim(true);
            setTimeout(() => setShareAnim(false), 2000);
        }
    };

    // Gradient overlay — always dark at bottom for text legibility regardless of theme
    const overlayGradient = `linear-gradient(
        to bottom,
        rgba(0,0,0,0.0) 0%,
        rgba(0,0,0,0.15) 30%,
        rgba(0,0,0,0.55) 60%,
        rgba(0,0,0,0.88) 88%,
        rgba(0,0,0,0.96) 100%
    )`;

    // Subtle brand color bloom at the very bottom corners
    const brandBloom = (
        <>
            <div
                className="absolute bottom-0 left-0 w-64 h-64 blur-[80px] opacity-25 pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />
            <div
                className="absolute bottom-0 right-0 w-64 h-64 blur-[80px] opacity-15 pointer-events-none"
                style={{ backgroundColor: secondaryColor }}
            />
        </>
    );

    return (
        <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black"
            style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        >
            {/* ── AMBIENT BLURRED BACKGROUND (Desktop) ── */}
            <div className="absolute inset-0 hidden md:block">
                {product.imageUrl && (
                    <ProductImage
                        src={product.imageUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-40 blur-[80px] scale-110"
                    />
                )}
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* ── CENTERED REEL CONTAINER ── */}
            {/* On mobile: full width & height, no borders. 
                On desktop: wider horizontal container, rounded corners, subtle shadow */}
            <div className="relative w-full h-full md:max-w-4xl md:w-[90%] md:h-[min(850px,90vh)] md:rounded-[2rem] md:my-auto xl:shadow-2xl overflow-hidden md:border md:border-white/10 flex flex-col md:flex-row bg-black">
                
                {/* ── LEFT SIDE (IMAGE/VIDEO) ───────────────── */}
                <div className="relative flex-1 h-full w-full bg-black flex items-center justify-center">
                    {product.imageUrl ? (
                        <>
                            <ProductImage
                                src={product.imageUrl}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-60 blur-xl scale-110"
                                style={{ transition: 'filter 0.4s ease' }}
                            />
                            <ProductImage
                                src={product.imageUrl}
                                alt={product.name}
                                className="relative w-full h-full object-contain z-10"
                                style={{ filter: isVisible ? 'none' : 'blur(2px)', transition: 'filter 0.4s ease' }}
                            />
                        </>
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)` }}
                        >
                            <Tag size={80} style={{ color: `${primaryColor}50` }} />
                        </div>
                    )}
                    
                    {/* Swipe-up hint on very first reel (Only Mobile) */}
                    {index === 0 && (
                        <div className="absolute md:hidden top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center animate-bounce pointer-events-none opacity-50 bg-black/40 backdrop-blur-md px-4 py-3 rounded-3xl">
                            <ChevronUp size={24} className="text-white" />
                            <span className="text-white text-[10px] font-black uppercase tracking-widest mt-1">Deslizar</span>
                        </div>
                    )}

                    {/* ── SOLD OUT OVERLAY ─────────────────────────── */}
                    {isSoldOut && (
                        <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                            <div
                                className="px-8 py-4 rounded-full border-2 font-black text-lg uppercase tracking-widest text-white"
                                style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}20` }}
                            >
                                Agotado
                            </div>
                        </div>
                    )}

                    {/* ── SLIDE INDEX DOTS ─────────────────────────── */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none md:hidden">
                        {total <= 15 && Array.from({ length: Math.min(total, 15) }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-full transition-all duration-300 shadow-sm"
                                style={{
                                    width: i === index ? '18px' : '5px',
                                    height: '5px',
                                    backgroundColor: i === index ? primaryColor : 'rgba(255,255,255,0.4)',
                                }}
                            />
                        ))}
                    </div>

                    {/* ── VERTICAL ACTION RAIL (Mobile & Desktop) ────────────────────────── */}
                    <div className="absolute right-3 md:right-4 bottom-[200px] md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-20 flex flex-col items-center gap-5">
                        {/* Like */}
                        <button
                            onClick={handleLike}
                            className="flex flex-col items-center gap-1 group"
                            aria-label="Me gusta"
                        >
                            <div
                                className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-200 shadow-lg ${likeAnim ? 'scale-[1.4]' : 'scale-100'} group-active:scale-90`}
                                style={{
                                    backgroundColor: liked ? `${primaryColor}30` : 'rgba(0,0,0,0.4)',
                                    border: `1px solid ${liked ? primaryColor : 'rgba(255,255,255,0.15)'}`,
                                }}
                            >
                                <Heart
                                    size={20}
                                    fill={liked ? primaryColor : 'none'}
                                    style={{ color: liked ? primaryColor : 'white' }}
                                    strokeWidth={2}
                                />
                            </div>
                            <span className="text-white text-[9px] md:text-[10px] font-bold drop-shadow-md">{liked ? '❤️' : 'Me gusta'}</span>
                        </button>

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isSoldOut}
                            className="flex flex-col items-center gap-1 group disabled:opacity-40"
                            aria-label="Añadir al carrito"
                        >
                            <div
                                className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 relative group-active:scale-90 shadow-lg ${addedAnim ? 'scale-[1.15]' : 'scale-100'}`}
                                style={{
                                    backgroundColor: addedAnim ? `${primaryColor}40` : 'rgba(0,0,0,0.4)',
                                    border: `1px solid ${addedAnim ? primaryColor : 'rgba(255,255,255,0.15)'}`,
                                }}
                            >
                                {addedAnim
                                    ? <Check size={20} className="text-white animate-in zoom-in duration-200" />
                                    : <ShoppingCart size={20} className="text-white" />
                                }
                                {cartCount > 0 && !addedAnim && (
                                    <span
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black shadow-md"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-white text-[9px] md:text-[10px] font-bold drop-shadow-md">
                                {addedAnim ? '¡Listo!' : 'Añadir'}
                            </span>
                        </button>

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="flex flex-col items-center gap-1 group"
                            aria-label="Compartir"
                        >
                            <div
                                className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-200 group-active:scale-90 shadow-lg relative"
                                style={{
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                }}
                            >
                                <Share2 size={20} className="text-white" />
                                {shareAnim && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded-lg animate-in zoom-in slide-in-from-bottom-2 duration-300 whitespace-nowrap shadow-xl">
                                        ¡COPIADO!
                                    </div>
                                )}
                            </div>
                            <span className="text-white text-[9px] md:text-[10px] font-bold drop-shadow-md">Compartir</span>
                        </button>
                    </div>
                </div>

                {/* ── INFO PANEL (Desktop Right Side / Mobile Bottom Clean UI) ── */}
                <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pt-20 pb-6 md:p-6 md:relative md:w-[360px] md:h-full md:flex md:flex-col md:justify-center md:flex-shrink-0">
                    {/* Mobile Gradient Background */}
                    <div 
                        className="absolute inset-0 z-0 md:hidden pointer-events-none" 
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)' }} 
                    />
                    
                    {/* Desktop Glass Background */}
                    <div 
                        className="hidden md:block absolute inset-0 z-0 backdrop-blur-3xl border-l border-white/10" 
                        style={{ backgroundColor: theme === 'dark' ? 'rgba(10,10,10,0.65)' : 'rgba(20,20,20,0.6)' }} 
                    />

                    {/* Content Wrapper */}
                    <div className="relative z-10 flex-1 flex flex-col justify-end md:justify-center">
                        {/* Category badge & Desktop Stock */}
                        <div className="mb-2.5 flex items-center gap-2">
                            <span
                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm"
                                style={{
                                    backgroundColor: `${secondaryColor}25`,
                                    color: secondaryColor,
                                    border: `1px solid ${secondaryColor}40`,
                                }}
                            >
                                {product.category}
                            </span>
                            
                            {/* Desktop Stock Indicator */}
                            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/80">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSoldOut ? '#ef4444' : '#22c55e' }} />
                                {isSoldOut ? 'Agotado' : `${product.stock} ud. disponibles`}
                            </span>
                        </div>

                        {/* Product name */}
                        <h2 className="text-white text-2xl md:text-2xl font-black tracking-tight leading-snug drop-shadow-lg mb-2">
                            {product.name}
                        </h2>

                        {/* Description — Desktop (Visible) / Mobile (Trigger) */}
                        <div className="mb-4">
                            {/* Desktop Description */}
                            <div className="hidden md:block">
                                {product.description && (
                                    <>
                                        <p className={`text-white/80 text-sm leading-relaxed transition-all duration-300 font-medium ${infoExpanded ? '' : 'line-clamp-4'}`}>
                                            {product.description}
                                        </p>
                                        <button
                                            onClick={() => setInfoExpanded(p => !p)}
                                            className="flex items-center gap-1 text-[11px] font-bold mt-1.5 opacity-70 hover:opacity-100 transition-opacity"
                                            style={{ color: primaryColor }}
                                        >
                                            {infoExpanded ? <><ChevronUp size={13} /> Ocultar</> : <><ChevronDown size={13} /> Ver más detalles</>}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {/* Mobile Description Trigger */}
                            <div className="md:hidden">
                                {product.description && (
                                    <button
                                        onClick={() => setShowBottomSheet(true)}
                                        className="flex items-center gap-1.5 text-xs font-bold opacity-100 transition-opacity backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'white' }}
                                    >
                                        Ver descripción
                                    </button>
                                )}
                            </div>
                        </div>
                    </div> {/* End flex-1 container */}

                    {/* Price + Primary CTA row */}
                    <div className="relative z-10 flex items-center justify-between gap-4 mt-auto pt-3 md:pt-6 border-t border-white/10 md:border-none">
                        <div>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">Precio de venta</p>
                            <p
                                className="text-3xl font-black tracking-tighter drop-shadow-sm"
                                style={{ color: primaryColor }}
                            >
                                {getCurrencySymbol(currency)} {product.price.toFixed(2)}
                            </p>
                        </div>
                        
                        <button
                            onClick={handleAddToCart}
                            disabled={isSoldOut}
                            className="flex-1 max-w-[160px] md:max-w-[200px] h-12 md:h-14 rounded-[1.2rem] text-white font-black text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                            style={{
                                background: isSoldOut
                                    ? 'rgba(255,255,255,0.12)'
                                    : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                boxShadow: isSoldOut ? 'none' : `0 8px 25px -8px ${primaryColor}90`,
                            }}
                        >
                            {isSoldOut
                                ? 'Agotado'
                                : (
                                    <>
                                        {addedAnim ? <Check size={18} className="animate-in zoom-in" /> : <ShoppingCart size={18} />}
                                        {addedAnim ? 'Agregado' : 'Añadir'}
                                    </>
                                )
                            }
                        </button>
                    </div>
                </div>


            </div> {/* END CENTERED REEL CONTAINER */}

            {/* ── MOBILE BOTTOM SHEET (Description) ── */}
            {showBottomSheet && (
                <div className="absolute inset-0 z-50 md:hidden flex flex-col justify-end">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" 
                        onClick={() => setShowBottomSheet(false)}
                    />
                    
                    {/* Sheet Content */}
                    <div 
                        className="relative w-full bg-[#1c1c1e] rounded-t-3xl border-t border-white/10 flex flex-col max-h-[75vh] animate-in slide-in-from-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                    >
                        {/* Handle */}
                        <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setShowBottomSheet(false)}>
                            <div className="w-12 h-1 bg-white/30 rounded-full" />
                        </div>
                        
                        <div className="flex items-center justify-between px-5 pb-3 border-b border-white/5">
                            <h3 className="text-white font-black text-sm uppercase tracking-wide">Descripción</h3>
                            <button onClick={() => setShowBottomSheet(false)} className="p-1.5 rounded-full bg-white/10 text-white">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {/* Mobile Stock Indicator inside Description */}
                            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSoldOut ? '#ef4444' : '#22c55e' }} />
                                <span className="text-white/90 text-[13px] font-bold">
                                    {isSoldOut ? 'Agotado' : `${product.stock} unidades disponibles`}
                                </span>
                            </div>
                            
                            <p className="text-white/85 text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
