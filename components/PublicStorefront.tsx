import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, MessageCircle, X, Search, Filter, Loader2, Store, AlertTriangle, CloudOff, Instagram, Facebook, Globe, Info, ArrowLeft } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { Button } from './ui/Button';
import { AppLogo } from './AppLogo';
import { useTranslation } from '../hooks/useTranslation';
import { CartDrawer } from './CartDrawer';
// Instead, we will import AppSettings properly from where it is defined, which is inside `types.ts`.
import { AppSettings } from '../types';

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
        removeFromCart,
        updateCartQuantity,
        isCartOpen,
        setIsCartOpen,
        settings,
        createOrder,
        clearCart,
        isLoading,
        isDemoMode,
        setAuthModalOpen,
        confirmInStallPurchase
    } = useStore();

    // If previewSettings are provided, merge them over the global settings
    const activeSettings = previewSettings ? { ...settings, ...previewSettings } : settings;

    const [localSearch, setLocalSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [customerName, setCustomerName] = useState('');
    const [isOrdering, setIsOrdering] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // 1. Identify Internal Categories (to exclude them)
    const internalCategoryNames = categories.filter(c => c.isInternal).map(c => c.name);

    // 2. Filter Categories for the navigation bar (Hide internal ones)
    const publicCategories = categories.filter(c => !c.isInternal);

    // 3. Filter products logic
    const filteredProducts = inventory.filter(p => {
        if (p.name === '__STORE_CONFIG__') return false;
        if (internalCategoryNames.includes(p.category)) return false;

        const matchSearch = p.name.toLowerCase().includes(localSearch.toLowerCase());
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        return matchSearch && matchCat;
    });

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleSuccess = () => {
        // Points awarded via confirmInStallPurchase
        console.log("Purchase success in storefront");
        confirmInStallPurchase();
    };

    if (isLoading && !previewSettings) {
        const loadPrimary = activeSettings.primaryColor || '#22c55e';
        const loadBg = activeSettings.theme === 'light' ? '#FAFAFA' : '#050505';
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: loadBg }}>
                {/* Ambient glow */}
                <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ backgroundColor: loadPrimary }}></div>

                {/* Animated logo ring */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 rounded-full border-[3px] border-dashed opacity-20" style={{ borderColor: loadPrimary }}></div>
                    <div className="absolute inset-0 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: loadPrimary, borderTopColor: 'transparent', animationDuration: '1s' }}></div>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${loadPrimary}15` }}>
                        {activeSettings.storeLogo ? (
                            <img src={activeSettings.storeLogo} alt="" className="w-12 h-12 object-cover rounded-xl" />
                        ) : (
                            <Store size={28} style={{ color: loadPrimary }} />
                        )}
                    </div>
                </div>

                {/* Store name */}
                <p className="font-black text-xl tracking-tight mb-1" style={{ color: activeSettings.theme === 'light' ? '#111' : '#fff' }}>
                    {activeSettings.companyName || 'Cargando tienda...'}
                </p>
                <p className="text-xs font-medium tracking-widest uppercase opacity-40 animate-pulse" style={{ color: activeSettings.theme === 'light' ? '#555' : '#aaa' }}>
                    Preparando tu catálogo
                </p>

                {/* Loading dots */}
                <div className="flex gap-1.5 mt-6">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: loadPrimary, animationDelay: `${i * 0.15}s` }}></div>
                    ))}
                </div>
            </div>
        );
    }

    const themeBg = activeSettings.theme === 'light' ? 'bg-[#FAFAFA]' : 'bg-[#050505]';
    const themeText = activeSettings.theme === 'light' ? 'text-slate-900' : 'text-gray-100';
    const headerBg = activeSettings.theme === 'light' ? 'bg-white/60' : 'bg-[#0A0A0A]/60';
    const cardBg = activeSettings.theme === 'light' ? 'bg-white/70 backdrop-blur-2xl' : 'bg-white/[0.02] backdrop-blur-2xl';
    const cardBorder = activeSettings.theme === 'light' ? 'border-gray-200 hover:border-gray-300' : 'border-white/5 hover:border-white/10';
    const textMuted = activeSettings.theme === 'light' ? 'text-gray-500' : 'text-gray-400';
    const primaryColor = activeSettings.primaryColor || '#22c55e';
    const secondaryColor = activeSettings.secondaryColor || '#6366f1';

    return (
        <div className={`min-h-screen ${themeBg} ${themeText} font-sans pb-24 transition-colors duration-500 max-w-[100vw] overflow-x-hidden relative ${previewSettings ? 'rounded-2xl overflow-y-auto no-scrollbar' : ''}`}>
            {/* Global Ambient Background Blobs */}
            <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }}></div>
            <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-10 pointer-events-none" style={{ backgroundColor: secondaryColor }}></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] rounded-full blur-[150px] opacity-15 pointer-events-none" style={{ backgroundColor: primaryColor }}></div>
            {/* Dynamic Store Header */}
            <header className={`sticky top-0 z-30 ${headerBg} backdrop-blur-2xl border-b ${activeSettings.theme === 'light' ? 'border-gray-200/50' : 'border-white/5'} px-5 py-3.5 flex justify-between items-center transition-colors duration-500`}>
                <div className="flex items-center gap-3 overflow-hidden mr-2">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className={`p-2 rounded-full transition-all flex items-center justify-center shrink-0 ${activeSettings.theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    {activeSettings.storeLogo ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-md border border-gray-100 flex-shrink-0 relative group">
                            <img src={activeSettings.storeLogo} alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md border border-gray-100 flex-shrink-0" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                            <Store size={20} />
                        </div>
                    )}
                    <span className="font-black tracking-tight text-lg truncate">{activeSettings.companyName || t('storefront.onlineCatalog')}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        id="tour-open-cart"
                        onClick={() => setIsCartOpen(true)}
                        className={`relative p-2.5 rounded-full transition-all hover:scale-105 ${activeSettings.theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/5 hover:bg-white/10'}`}
                        style={{ color: primaryColor }}
                    >
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border border-[#050505]" style={{ backgroundColor: primaryColor }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Content */}
            {inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
                    <div className={`${cardBg} p-8 rounded-[40px] mb-6 border ${activeSettings.theme === 'light' ? 'border-gray-200 shadow-xl' : 'border-white/5'}`}>
                        <Store size={48} className="opacity-50" style={{ color: primaryColor }} />
                    </div>
                    <h2 className="text-3xl font-black mb-3">{t('storefront.catalogNotAvailable')}</h2>
                    <p className={`${textMuted} max-w-sm mb-8 text-lg`}>
                        {t('storefront.catalogEmpty')}
                    </p>
                </div>
            ) : (
                <>
                    {/* Hero Store Cover Banner */}
                    <div className={`relative w-full overflow-hidden mb-8 md:mb-12 ${previewSettings ? 'rounded-b-[40px] md:rounded-[40px]' : 'rounded-b-[40px] md:rounded-none'} ${activeSettings.storeDescription ? 'h-64 md:h-80' : 'h-48 md:h-64'}`}>
                        <div className={`absolute inset-0 ${activeSettings.theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-white' : 'bg-gradient-to-br from-gray-900 to-black'}`}></div>
                        <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full opacity-30 animate-pulse-slow" style={{ backgroundColor: primaryColor, transform: 'translate(20%, -20%)' }}></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 blur-[80px] rounded-full opacity-30 animate-pulse-slow" style={{ backgroundColor: secondaryColor, transform: 'translate(-20%, 20%)', animationDelay: '2s' }}></div>
                        {/* Subtle mesh pattern overlay */}
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, ${primaryColor} 1px, transparent 0)`, backgroundSize: '24px 24px' }}></div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center gap-3">
                            {/* Store logo in hero if available */}
                            {activeSettings.storeLogo && (
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 shadow-xl" style={{ borderColor: `${primaryColor}40` }}>
                                    <img src={activeSettings.storeLogo} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <h1 className={`text-4xl md:text-6xl font-black tracking-tighter drop-shadow-sm ${activeSettings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{activeSettings.companyName || 'Bienvenidos'}</h1>
                            {activeSettings.storeDescription && (
                                <div className="max-w-lg">
                                    {/* Branded pill divider */}
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <div className="h-px w-10 opacity-30" style={{ backgroundColor: primaryColor }}></div>
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                        <div className="h-px w-10 opacity-30" style={{ backgroundColor: primaryColor }}></div>
                                    </div>
                                    <p className={`text-sm md:text-base font-semibold tracking-wide leading-relaxed line-clamp-2 ${activeSettings.theme === 'light' ? 'text-gray-600' : 'text-white/80'}`}>{activeSettings.storeDescription}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="px-5 md:px-8 mb-10 max-w-7xl mx-auto">
                        <div className="relative group max-w-2xl mx-auto">
                            <input
                                type="text"
                                placeholder={t('storefront.searchProducts')}
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className={`w-full pl-14 pr-6 py-4 md:py-5 ${cardBg} border ${cardBorder} shadow-xl shadow-black/5 rounded-[28px] outline-none transition-all placeholder:font-medium text-sm md:text-base`}
                                style={{ '--focus-color': primaryColor } as React.CSSProperties}
                                onFocus={(e) => e.target.style.borderColor = primaryColor as string}
                                onBlur={(e) => e.target.style.borderColor = ''}
                            />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-40 transition-opacity group-focus-within:opacity-100" style={{ color: primaryColor }} size={22} />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="px-5 md:px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 max-w-7xl mx-auto">
                        {filteredProducts.map((product, idx) => (
                            <div
                                key={product.id}
                                className={`relative overflow-hidden rounded-[24px] md:rounded-[32px] group flex flex-col cursor-pointer transition-all duration-500 hover:-translate-y-2`}
                                style={{
                                    background: activeSettings.theme === 'light'
                                        ? 'rgba(255,255,255,0.85)'
                                        : `linear-gradient(145deg, ${primaryColor}08, ${secondaryColor}08)`,
                                    border: `1.5px solid ${primaryColor}20`,
                                    boxShadow: `0 4px 24px -4px ${primaryColor}15`,
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px -8px ${primaryColor}30, 0 4px 20px -4px ${secondaryColor}20`;
                                    (e.currentTarget as HTMLElement).style.borderColor = `${primaryColor}50`;
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px -4px ${primaryColor}15`;
                                    (e.currentTarget as HTMLElement).style.borderColor = `${primaryColor}20`;
                                }}
                                onClick={() => setSelectedProduct(product)}
                            >
                                {/* Top accent gradient bar */}
                                <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}></div>

                                {/* Image */}
                                <div className={`aspect-square ${activeSettings.theme === 'light' ? 'bg-gray-50' : 'bg-black/30'} relative overflow-hidden`}>
                                    <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                            <span className="text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg" style={{ backgroundColor: `${primaryColor}90` }}>{t('storefront.soldOut')}</span>
                                        </div>
                                    )}
                                    {/* Category badge overlay */}
                                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider" style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor, border: `1px solid ${secondaryColor}30` }}>
                                        {product.category}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 md:p-5 flex flex-col flex-1">
                                    <h3 className="text-sm md:text-base font-extrabold mb-3 line-clamp-2 leading-tight">{product.name}</h3>
                                    <div className="flex items-center justify-between mt-auto gap-2">
                                        {/* Price with primary color */}
                                        <span className="font-black text-lg md:text-xl tracking-tight" style={{ color: primaryColor }}>
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <button
                                            id={idx === 0 ? "tour-add-to-cart" : undefined}
                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                            disabled={product.stock <= 0}
                                            className="text-white p-2.5 md:px-4 md:py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 font-bold text-sm"
                                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 4px 12px -4px ${primaryColor}60` }}
                                        >
                                            <ShoppingCart size={16} />
                                            <span className="hidden md:inline text-xs">Añadir</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onSuccess={handleSuccess}
            />

            {/* Product Details Modal - FULLY THEMED */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedProduct(null)}></div>
                    <div
                        className={`relative w-full max-w-md rounded-t-[36px] md:rounded-[36px] overflow-hidden shadow-2xl border-t md:border animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-500 flex flex-col`}
                        style={{
                            maxHeight: '92vh',
                            background: activeSettings.theme === 'light' ? '#ffffff' : '#111111',
                            borderColor: activeSettings.theme === 'light' ? '#e5e7eb' : `${primaryColor}20`,
                        }}
                    >
                        {/* Top gradient accent */}
                        <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})` }}></div>

                        {/* Close button */}
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center border hover:scale-110 transition-transform"
                            style={{
                                backgroundColor: activeSettings.theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.5)',
                                borderColor: activeSettings.theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.15)',
                                color: activeSettings.theme === 'light' ? '#111' : '#fff'
                            }}
                        >
                            <X size={18} />
                        </button>

                        {/* Product image - FIXED HEIGHT so content is always visible */}
                        <div
                            className="w-full shrink-0 relative overflow-hidden"
                            style={{
                                height: 'clamp(180px, 38vh, 280px)',
                                background: activeSettings.theme === 'light' ? '#f9fafb' : '#000'
                            }}
                        >
                            <ProductImage src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            {/* Gradient fade to modal bg */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: `linear-gradient(to bottom, transparent 40%, ${activeSettings.theme === 'light' ? '#ffffff' : '#111111'} 100%)`
                                }}
                            ></div>
                            {/* Dual-color ambient behind image */}
                            <div className="absolute -bottom-4 left-0 w-1/2 h-16 blur-2xl opacity-30" style={{ backgroundColor: primaryColor }}></div>
                            <div className="absolute -bottom-4 right-0 w-1/2 h-16 blur-2xl opacity-30" style={{ backgroundColor: secondaryColor }}></div>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
                            {/* Name + category */}
                            <div className="mb-3">
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2" style={{ color: activeSettings.theme === 'light' ? '#111' : '#fff' }}>
                                    {selectedProduct.name}
                                </h2>
                                <span
                                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block"
                                    style={{ color: secondaryColor, backgroundColor: `${secondaryColor}15`, border: `1px solid ${secondaryColor}30` }}
                                >
                                    {selectedProduct.category}
                                </span>
                            </div>

                            {/* Description */}
                            <div
                                className="rounded-2xl p-4 mb-5"
                                style={{ backgroundColor: `${primaryColor}08`, borderLeft: `3px solid ${primaryColor}` }}
                            >
                                <p
                                    className="text-sm leading-relaxed font-medium"
                                    style={{ color: activeSettings.theme === 'light' ? '#374151' : '#d1d5db' }}
                                >
                                    {selectedProduct.description || <span className="italic opacity-50">Sin descripción adicional.</span>}
                                </p>
                            </div>

                            {/* Price + Add to Cart */}
                            <div
                                className="flex items-center justify-between gap-4 pt-4"
                                style={{ borderTop: `1px solid ${activeSettings.theme === 'light' ? '#f3f4f6' : 'rgba(255,255,255,0.07)'}` }}
                            >
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: activeSettings.theme === 'light' ? '#9ca3af' : '#6b7280' }}>Precio</p>
                                    <div className="text-3xl font-black tracking-tighter" style={{ color: primaryColor }}>
                                        ${selectedProduct.price.toFixed(2)}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        addToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    disabled={selectedProduct.stock <= 0}
                                    className="text-white font-extrabold rounded-2xl px-6 py-4 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl flex items-center gap-2"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 8px 24px -8px ${primaryColor}80` }}
                                >
                                    <ShoppingCart size={18} />
                                    {selectedProduct.stock <= 0 ? t('storefront.soldOut') : 'Añadir al Carrito'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer with Store Links & Descriptions */}
            <footer
                className="mt-12 mx-4 md:mx-6 pb-6 text-center max-w-7xl md:mx-auto pt-8"
                style={{ borderTop: `1px solid ${activeSettings.theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}` }}
            >
                <div className="flex flex-col items-center">
                    {/* Dual-color logo ring */}
                    <div
                        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden mb-4 shadow-lg"
                        style={{ border: `2px solid ${primaryColor}40` }}
                    >
                        {activeSettings.storeLogo ? (
                            <img src={activeSettings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)` }}>
                                <Store size={20} style={{ color: primaryColor }} />
                            </div>
                        )}
                    </div>
                    <h3
                        className="text-lg font-black mb-1 tracking-tight"
                        style={{ color: activeSettings.theme === 'light' ? '#111' : '#fff' }}
                    >
                        {activeSettings.companyName || t('storefront.onlineCatalog')}
                    </h3>

                    {activeSettings.storeDescription && (
                        <div className="max-w-sm mx-auto mb-6 px-4 mt-3">
                            <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium text-center"
                                style={{
                                    backgroundColor: `${primaryColor}10`,
                                    color: activeSettings.theme === 'light' ? '#374151' : '#d1d5db',
                                    borderLeft: `3px solid ${primaryColor}`
                                }}
                            >
                                {activeSettings.storeDescription}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-4 mb-8 mt-2">
                        {activeSettings.instagramUrl && (
                            <a href={`https://${activeSettings.instagramUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                                className={`p-2.5 rounded-full transition-colors ${activeSettings.theme === 'light' ? 'bg-gray-100 hover:bg-pink-50 text-gray-500 hover:text-pink-500' : 'bg-white/5 hover:bg-pink-500/20 text-gray-400 hover:text-pink-500'}`}>
                                <Instagram size={18} />
                            </a>
                        )}
                        {activeSettings.facebookUrl && (
                            <a href={`https://${activeSettings.facebookUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                                className={`p-2.5 rounded-full transition-colors ${activeSettings.theme === 'light' ? 'bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-500' : 'bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-500'}`}>
                                <Facebook size={18} />
                            </a>
                        )}
                        {activeSettings.websiteUrl && (
                            <a href={`https://${activeSettings.websiteUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                                className={`p-2.5 rounded-full transition-colors ${activeSettings.theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-500' : 'bg-white/5 hover:bg-white/20 text-gray-400 hover:text-white'}`}>
                                <Globe size={18} />
                            </a>
                        )}
                    </div>

                    {/* Dual brand color divider at bottom */}
                    <div className="h-0.5 w-20 rounded-full mx-auto" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}></div>
                </div>
            </footer>
        </div>
    );
};

