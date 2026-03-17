import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    ShoppingCart, MessageCircle, ArrowLeft, Share2, Heart,
    Volume2, VolumeX, ChevronDown, Star, Zap, Store
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, AppSettings } from '../types';
import { DEFAULT_PRODUCT_IMAGE } from '../constants';
import { ProductImage } from './ProductImage';

// ─── Minimal DB fetch (no full store load needed) ───────────────────────────
const fetchProductAndStore = async (slug: string, productId: string): Promise<{ product: Product | null; store: Partial<AppSettings> | null }> => {
    if (!isSupabaseConfigured) return { product: null, store: null };
    try {
        // Get owner from slug
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, company_name, whatsapp_number')
            .eq('store_slug', slug)
            .single();

        if (!profile) return { product: null, store: null };

        // Fetch config product for branding
        const { data: configProduct } = await supabase
            .from('products')
            .select('description')
            .eq('user_id', profile.id)
            .eq('name', '__STORE_CONFIG__')
            .single();

        let branding: Partial<AppSettings> = {
            companyName: profile.company_name,
            whatsappNumber: profile.whatsapp_number,
        };
        if (configProduct?.description) {
            try {
                const cfg = JSON.parse(configProduct.description);
                branding = { ...branding, ...cfg };
            } catch (_) { }
        }

        // Fetch target product
        const { data: prod } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', profile.id)
            .eq('id', productId)
            .single();

        if (!prod) return { product: null, store: branding };

        const product: Product = {
            ...prod,
            imageUrl: prod.image_url || DEFAULT_PRODUCT_IMAGE,
            videoUrl: prod.video_url || undefined,
            entryDate: prod.entry_date,
            supplierWarranty: prod.supplier_warranty,
            folderId: prod.folder_id,
            createdAt: prod.created_at,
        };

        return { product, store: branding };
    } catch (e) {
        return { product: null, store: null };
    }
};

// ─── Social proof mock data (makes it feel alive) ───────────────────────────
const SOCIAL_PROOFS = [
    'Alguien de Lima acaba de ver esto',
    '3 personas lo están viendo ahora',
    'Último pedido hace 12 min',
    '5 personas lo compraron hoy',
    'Trending en tu ciudad 🔥',
];

export const ProductLanding: React.FC = () => {
    const { slug, productId } = useParams<{ slug: string; productId: string }>();

    const [product, setProduct] = useState<Product | null>(null);
    const [store, setStore] = useState<Partial<AppSettings> | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeAnim, setLikeAnim] = useState(false);
    const [descOpen, setDescOpen] = useState(false);
    const [socialProof, setSocialProof] = useState(SOCIAL_PROOFS[0]);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        if (!slug || !productId) return;
        fetchProductAndStore(slug, productId).then(({ product, store }) => {
            setProduct(product);
            setStore(store);
            setLoading(false);
        });
    }, [slug, productId]);

    // Rotate social proof every 5s for FOMO
    useEffect(() => {
        const interval = setInterval(() => {
            setSocialProof(SOCIAL_PROOFS[Math.floor(Math.random() * SOCIAL_PROOFS.length)]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);


    const primaryColor = store?.primaryColor || '#22c55e';
    const secondaryColor = store?.secondaryColor || '#6366f1';
    const isSoldOut = (product?.stock ?? 0) <= 0;

    const handleWhatsApp = () => {
        const phone = store?.whatsappNumber;
        if (!phone || !product) return;
        const lines = Array.from({ length: qty }, (_, i) => `${i + 1}. ${product.name}`).join('\n');
        const msg = `Hola! 👋 Vi este producto y quiero comprarlo:\n\n${lines}\n\nTotal: S/ ${(product.price * qty).toFixed(2)}\n\n¿Está disponible?`;
        
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 9 && formattedPhone.startsWith('9')) {
            formattedPhone = '51' + formattedPhone;
        }
        window.location.href = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: product?.name, url: window.location.href });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copiado ✓');
            }
        } catch (_) { }
    };

    const handleLike = () => {
        setLiked(p => !p);
        if (!liked) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 700); }
    };

    // ── LOADING ────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <div
                    className="w-16 h-16 rounded-2xl animate-pulse"
                    style={{ backgroundColor: `${primaryColor}20` }}
                />
                <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    // ── NOT FOUND ──────────────────────────────────────────────────────────
    if (!product) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white text-center px-8 gap-4">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-2">
                    <Store size={32} className="opacity-40" />
                </div>
                <p className="text-2xl font-black">Producto no encontrado</p>
                <p className="text-white/40 text-sm">Puede que ya no esté disponible</p>
                {slug && (
                    <a
                        href={`/${slug}`}
                        className="mt-4 px-6 py-3 rounded-2xl font-black text-white text-sm"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Ver catálogo completo
                    </a>
                )}
            </div>
        );
    }

    const overlayGradient = `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.92) 75%, rgba(0,0,0,1) 100%)`;

    return (
        <div className="min-h-screen bg-black font-sans overflow-x-hidden" style={{ maxWidth: '480px', margin: '0 auto' }}>

            {/* ── HERO MEDIA ─────────────────────────────────────────────── */}
            <div className="relative" style={{ height: '100svh', maxHeight: '720px' }}>

                {/* Media */}
                <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0" style={{ background: overlayGradient }} />

                {/* Brand ambient blooms */}
                <div className="absolute bottom-0 left-0 w-80 h-80 blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
                <div className="absolute bottom-0 right-0 w-80 h-80 blur-[100px] opacity-10 pointer-events-none" style={{ backgroundColor: secondaryColor }} />

                {/* ── TOP ACTIONS ─── */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pt-12">
                    <a
                        href={`/${slug}`}
                        className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border border-white/15"
                        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    >
                        <ArrowLeft size={18} className="text-white" />
                    </a>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border border-white/15"
                            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                        >
                            <Share2 size={17} className="text-white" />
                        </button>
                        <button
                            onClick={handleLike}
                            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${likeAnim ? 'scale-125' : 'scale-100'}`}
                            style={{
                                backgroundColor: liked ? `${primaryColor}30` : 'rgba(0,0,0,0.4)',
                                borderColor: liked ? primaryColor : 'rgba(255,255,255,0.15)',
                            }}
                        >
                            <Heart size={17} fill={liked ? primaryColor : 'none'} style={{ color: liked ? primaryColor : 'white' }} />
                        </button>
                    </div>
                </div>

                {/* ── STOCK/SOCIAL PROOF CHIP ─── */}
                {product.stock > 0 && product.stock <= 10 && (
                    <div
                        className="absolute top-16 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-white text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: 'rgba(0,0,0,0.55)', border: `1px solid ${primaryColor}40` }}
                    >
                        <Zap size={11} style={{ color: primaryColor }} />
                        Solo quedan {product.stock} unidades
                    </div>
                )}

                {/* ── BOTTOM PRODUCT INFO (over image) ─── */}
                <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-6">
                    {/* Category */}
                    <span
                        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block mb-2"
                        style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor, border: `1px solid ${secondaryColor}30` }}
                    >
                        {product.category}
                    </span>

                    {/* Name */}
                    <h1 className="text-white text-3xl font-black tracking-tight leading-tight mb-1">
                        {product.name}
                    </h1>

                    {/* Social proof rotating */}
                    <p className="text-white/40 text-xs font-medium mb-4 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                        {socialProof}
                    </p>

                    {/* Price row */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Precio</p>
                            <p className="text-4xl font-black tracking-tighter" style={{ color: primaryColor }}>
                                S/ {(product.price * qty).toFixed(2)}
                            </p>
                        </div>

                        {/* Qty selector */}
                        <div
                            className="flex items-center gap-3 px-4 py-2 rounded-2xl border"
                            style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-white/60 hover:text-white font-black text-lg w-6 flex items-center justify-center">-</button>
                            <span className="text-white font-black w-5 text-center">{qty}</span>
                            <button
                                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                                className="font-black text-lg w-6 flex items-center justify-center"
                                style={{ color: primaryColor }}
                            >+</button>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleWhatsApp}
                        disabled={isSoldOut || !store?.whatsappNumber}
                        className="w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.97] disabled:opacity-40 shadow-2xl"
                        style={{
                            background: isSoldOut
                                ? 'rgba(255,255,255,0.1)'
                                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            boxShadow: isSoldOut ? 'none' : `0 12px 32px -8px ${primaryColor}60`,
                        }}
                    >
                        <MessageCircle size={22} />
                        {isSoldOut ? 'Agotado' : 'Pedir por WhatsApp'}
                    </button>
                </div>
            </div>

            {/* ── DETAILS SECTION ────────────────────────────────────────── */}
            <div className="bg-black px-5 py-6 space-y-6">

                {/* Description */}
                {product.description && (
                    <div>
                        <button
                            onClick={() => setDescOpen(p => !p)}
                            className="w-full flex items-center justify-between mb-3"
                        >
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Descripción</p>
                            <ChevronDown
                                size={14}
                                className="text-white/40 transition-transform"
                                style={{ transform: descOpen ? 'rotate(180deg)' : 'none' }}
                            />
                        </button>
                        <div
                            className="overflow-hidden transition-all duration-300"
                            style={{ maxHeight: descOpen ? '500px' : '60px' }}
                        >
                            <p className="text-white/70 text-sm leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="h-px" style={{ background: `linear-gradient(90deg, ${primaryColor}40, ${secondaryColor}40, transparent)` }} />

                {/* Store card */}
                <div
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                    {store?.storeLogo ? (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border" style={{ borderColor: `${primaryColor}30` }}>
                            <img src={store.storeLogo} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                            <Store size={20} style={{ color: primaryColor }} />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-black truncate">{store?.companyName || 'La Tienda'}</p>
                        {store?.storeDescription && (
                            <p className="text-white/40 text-xs line-clamp-1">{store.storeDescription}</p>
                        )}
                    </div>
                    <a
                        href={`/${slug}`}
                        className="shrink-0 px-4 py-2 rounded-xl text-white text-xs font-black"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`, border: `1px solid ${primaryColor}30` }}
                    >
                        Ver más
                    </a>
                </div>

                {/* Bottom fixed CTA repeat */}
                <button
                    onClick={handleWhatsApp}
                    disabled={isSoldOut || !store?.whatsappNumber}
                    className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 active:scale-[0.97] disabled:opacity-40"
                    style={{
                        background: isSoldOut ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        boxShadow: isSoldOut ? 'none' : `0 8px 24px -8px ${primaryColor}60`,
                    }}
                >
                    <MessageCircle size={20} />
                    {isSoldOut ? 'Agotado' : `Pedir ${qty > 1 ? `${qty}x ` : ''}por WhatsApp — S/ ${(product.price * qty).toFixed(2)}`}
                </button>

                {/* Powered by */}
                <p className="text-center text-white/15 text-[10px] font-bold uppercase tracking-widest pb-4">
                    Powered by MyMorez
                </p>
            </div>
        </div>
    );
};
