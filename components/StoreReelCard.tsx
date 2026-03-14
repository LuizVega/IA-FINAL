import React, { useState, useRef, useEffect } from 'react';
import { Heart, ShoppingCart, Share2, ChevronDown, ChevronUp, Check, Tag, Volume2, VolumeX } from 'lucide-react';
import { ProductImage } from './ProductImage';
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
    onAddToCart,
    isVisible,
}) => {
    const [liked, setLiked] = useState(false);
    const [likeAnim, setLikeAnim] = useState(false);
    const [addedAnim, setAddedAnim] = useState(false);
    const [infoExpanded, setInfoExpanded] = useState(false);
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
        // Generate a direct product landing URL
        const productUrl = storeSlug
            ? `${window.location.origin}/${storeSlug}/p/${product.id}`
            : window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: product.name,
                    text: `${product.name} — S/ ${product.price.toFixed(2)} en ${storeName}`,
                    url: productUrl,
                });
            } else {
                await navigator.clipboard.writeText(productUrl);
            }
        } catch (e) {
            // Dismissed by user
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
            className="relative w-full h-full flex flex-col overflow-hidden bg-black"
            style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        >
            {/* ── BACKGROUND: PHOTO ───────────────── */}
            <div className="absolute inset-0">
                {product.imageUrl ? (
                    <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        style={{ filter: isVisible ? 'none' : 'blur(2px)', transition: 'filter 0.4s ease' }}
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)` }}
                    >
                        <Tag size={80} style={{ color: `${primaryColor}50` }} />
                    </div>
                )}
                {/* Main gradient overlay */}
                <div className="absolute inset-0" style={{ background: overlayGradient }} />
                {brandBloom}
            </div>

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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
                {total <= 15 && Array.from({ length: Math.min(total, 15) }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-full transition-all duration-300"
                        style={{
                            width: i === index ? '18px' : '5px',
                            height: '5px',
                            backgroundColor: i === index ? primaryColor : 'rgba(255,255,255,0.35)',
                        }}
                    />
                ))}
            </div>

            {/* ── RIGHT ACTION RAIL ────────────────────────── */}
            <div className="absolute right-4 bottom-[200px] z-20 flex flex-col items-center gap-5">
                {/* Like */}
                <button
                    onClick={handleLike}
                    className="flex flex-col items-center gap-1 group"
                    aria-label="Me gusta"
                >
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 ${likeAnim ? 'scale-[1.4]' : 'scale-100'} group-active:scale-90`}
                        style={{
                            backgroundColor: liked ? `${primaryColor}30` : 'rgba(255,255,255,0.12)',
                            borderColor: liked ? primaryColor : 'rgba(255,255,255,0.18)',
                        }}
                    >
                        <Heart
                            size={22}
                            fill={liked ? primaryColor : 'none'}
                            style={{ color: liked ? primaryColor : 'white' }}
                            strokeWidth={2}
                        />
                    </div>
                    <span className="text-white text-[10px] font-bold drop-shadow-sm">{liked ? '❤️' : 'Me gusta'}</span>
                </button>

                {/* Add to Cart */}
                <button
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className="flex flex-col items-center gap-1 group disabled:opacity-40"
                    aria-label="Añadir al carrito"
                >
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 relative group-active:scale-90 ${addedAnim ? 'scale-[1.15]' : 'scale-100'}`}
                        style={{
                            backgroundColor: addedAnim ? `${primaryColor}40` : 'rgba(255,255,255,0.12)',
                            borderColor: addedAnim ? primaryColor : 'rgba(255,255,255,0.18)',
                        }}
                    >
                        {addedAnim
                            ? <Check size={22} className="text-white animate-in zoom-in duration-200" />
                            : <ShoppingCart size={22} className="text-white" />
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
                    <span className="text-white text-[10px] font-bold drop-shadow-sm">
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
                        className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 group-active:scale-90"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.12)',
                            borderColor: 'rgba(255,255,255,0.18)',
                        }}
                    >
                        <Share2 size={22} className="text-white" />
                    </div>
                    <span className="text-white text-[10px] font-bold drop-shadow-sm">Compartir</span>
                </button>
            </div>

            {/* ── BOTTOM INFO PANEL ────────────────────────── */}
            <div
                className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-3 transition-all duration-400"
            >
                {/* Category badge */}
                <div className="mb-2">
                    <span
                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block"
                        style={{
                            backgroundColor: `${secondaryColor}25`,
                            color: secondaryColor,
                            border: `1px solid ${secondaryColor}40`,
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        {product.category}
                    </span>
                </div>

                {/* Product name */}
                <h2 className="text-white text-2xl font-black tracking-tight leading-tight drop-shadow-lg mb-1">
                    {product.name}
                </h2>

                {/* Description — collapsible */}
                {product.description && (
                    <div className="mb-3">
                        <p
                            className={`text-white/75 text-sm leading-relaxed transition-all duration-300 ${infoExpanded ? '' : 'line-clamp-1'}`}
                        >
                            {product.description}
                        </p>
                        <button
                            onClick={() => setInfoExpanded(p => !p)}
                            className="flex items-center gap-1 text-[11px] font-bold mt-0.5 opacity-60 hover:opacity-100 transition-opacity"
                            style={{ color: primaryColor }}
                        >
                            {infoExpanded ? <><ChevronUp size={13} /> Menos</> : <><ChevronDown size={13} /> Ver más</>}
                        </button>
                    </div>
                )}

                {/* Price + CTA row */}
                <div className="flex items-center justify-between gap-3 mt-2">
                    <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Precio</p>
                        <p
                            className="text-3xl font-black tracking-tighter drop-shadow-lg"
                            style={{ color: primaryColor }}
                        >
                            S/ {product.price.toFixed(2)}
                        </p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isSoldOut}
                        className="flex-1 max-w-[190px] py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-2xl"
                        style={{
                            background: isSoldOut
                                ? 'rgba(255,255,255,0.12)'
                                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            boxShadow: isSoldOut ? 'none' : `0 8px 24px -8px ${primaryColor}80`,
                        }}
                    >
                        {isSoldOut
                            ? 'Agotado'
                            : <><ShoppingCart size={16} /> Añadir al carrito</>
                        }
                    </button>
                </div>
            </div>

            {/* Swipe-up hint on very first reel */}
            {index === 0 && (
                <div className="absolute bottom-[175px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-bounce pointer-events-none opacity-50">
                    <ChevronUp size={20} className="text-white" />
                    <span className="text-white text-[9px] font-bold uppercase tracking-widest mt-0.5">Deslizar</span>
                </div>
            )}
        </div>
    );
};
