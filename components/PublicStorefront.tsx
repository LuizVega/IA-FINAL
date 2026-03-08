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
        return (
            <div className={`min-h-screen ${activeSettings.theme === 'light' ? 'bg-gray-50' : 'bg-[#050505]'} flex flex-col items-center justify-center text-white`}>
                <div className="relative w-24 h-24 flex items-center justify-center mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin-slow" style={{ borderColor: activeSettings.primaryColor || '#22c55e', borderTopColor: 'transparent' }}></div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: `${activeSettings.primaryColor || '#22c55e'}20` }}>
                        <Store size={24} style={{ color: activeSettings.primaryColor || '#22c55e' }} className="animate-pulse" />
                    </div>
                </div>
                <p className="font-mono text-sm uppercase tracking-widest animate-pulse" style={{ color: activeSettings.theme === 'light' ? '#333' : '#888' }}>
                    {t('storefront.loadingCatalog')}
                </p>
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
                    <div className={`relative w-full h-48 md:h-72 overflow-hidden mb-8 md:mb-12 ${previewSettings ? 'rounded-b-[40px] md:rounded-[40px]' : 'rounded-b-[40px] md:rounded-none'}`}>
                        <div className={`absolute inset-0 ${activeSettings.theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-white' : 'bg-gradient-to-br from-gray-900 to-black'}`}></div>
                        <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full opacity-30 animate-pulse-slow" style={{ backgroundColor: primaryColor, transform: 'translate(20%, -20%)' }}></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 blur-[80px] rounded-full opacity-30 animate-pulse-slow" style={{ backgroundColor: secondaryColor, transform: 'translate(-20%, 20%)', animationDelay: '2s' }}></div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
                            <h1 className={`text-4xl md:text-6xl font-black tracking-tighter drop-shadow-sm mb-4 ${activeSettings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{activeSettings.companyName || 'Bienvenidos'}</h1>
                            {activeSettings.storeDescription && (
                                <p className={`max-w-2xl text-sm md:text-lg font-medium tracking-wide leading-relaxed line-clamp-3 ${activeSettings.theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>{activeSettings.storeDescription}</p>
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
                            <div key={product.id} className={`${cardBg} rounded-[28px] md:rounded-[36px] overflow-hidden border ${cardBorder} shadow-xl shadow-black/5 transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1.5 group flex flex-col relative`}>
                                {/* Inner glow on hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 rounded-[28px] md:rounded-[36px]" style={{ boxShadow: `inset 0 0 20px -5px ${primaryColor}40` }}></div>
                                <div
                                    className={`aspect-square ${activeSettings.theme === 'light' ? 'bg-gray-50' : 'bg-black/50'} relative cursor-pointer overflow-hidden`}
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                                            <span className="bg-black text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">{t('storefront.soldOut')}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 md:p-6 flex flex-col flex-1 cursor-pointer relative z-30" onClick={() => setSelectedProduct(product)}>
                                    <h3 className="text-sm md:text-base font-extrabold mb-1.5 line-clamp-2">{product.name}</h3>
                                    <p className={`text-[10px] md:text-xs ${textMuted} mb-5 font-bold uppercase tracking-widest`}>{product.category}</p>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mt-auto gap-3">
                                        <span className="font-black text-lg md:text-xl tracking-tight">${product.price.toFixed(2)}</span>
                                        <button
                                            id={idx === 0 ? "tour-add-to-cart" : undefined}
                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                            disabled={product.stock <= 0}
                                            className="text-white p-3 md:px-5 md:py-2.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-2 font-bold text-sm w-full md:w-auto overflow-hidden relative"
                                            style={{ backgroundColor: primaryColor, boxShadow: `0 8px 20px -8px ${primaryColor}` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                                            <ShoppingCart size={18} className="relative z-10" /> <span className="hidden md:inline relative z-10">Añadir</span>
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

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedProduct(null)}></div>
                    <div className={`relative w-full max-w-md ${activeSettings.theme === 'light' ? 'bg-white' : 'bg-[#151515]'} rounded-t-[40px] md:rounded-[40px] overflow-hidden shadow-2xl border-t md:border ${activeSettings.theme === 'light' ? 'border-gray-200' : 'border-white/10'} animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-500 max-h-[90vh] flex flex-col`}>
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className={`absolute top-5 right-5 z-20 w-10 h-10 ${activeSettings.theme === 'light' ? 'bg-white/80' : 'bg-black/40'} backdrop-blur-xl rounded-full flex items-center justify-center ${activeSettings.theme === 'light' ? 'text-gray-900 border-gray-200' : 'text-white border-white/20'} border hover:scale-110 transition-transform`}
                        >
                            <X size={20} />
                        </button>
                        <div className={`aspect-square ${activeSettings.theme === 'light' ? 'bg-gray-50' : 'bg-black/50'} relative shrink-0`}>
                            <ProductImage src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${activeSettings.theme === 'light' ? 'from-white/80' : 'from-[#151515]/80'} via-transparent to-transparent opacity-80`}></div>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-3xl font-black tracking-tight">{selectedProduct.name}</h2>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border mb-8 inline-block`} style={{ color: primaryColor, borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}10` }}>
                                {selectedProduct.category}
                            </span>

                            <div className="mb-10">
                                <h4 className={`text-xs font-bold ${textMuted} mb-3 flex items-center gap-2 uppercase tracking-widest`}>
                                    <Info size={16} /> Detalles del Producto
                                </h4>
                                <div className={`text-sm leading-relaxed pr-2 font-medium ${activeSettings.theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                    {selectedProduct.description || (
                                        <span className="italic opacity-50">Sin descripción adicional.</span>
                                    )}
                                </div>
                            </div>

                            <div className={`flex items-center justify-between mt-auto pt-8 border-t ${activeSettings.theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                                <div className="text-4xl font-black tracking-tighter">
                                    ${selectedProduct.price.toFixed(2)}
                                </div>
                                <Button
                                    onClick={() => {
                                        addToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    disabled={selectedProduct.stock <= 0}
                                    className="text-white font-extrabold rounded-3xl px-8 py-4 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl"
                                    style={{ backgroundColor: primaryColor, boxShadow: `0 12px 30px -10px ${primaryColor}` }}
                                >
                                    {selectedProduct.stock <= 0 ? t('storefront.soldOut') : 'Añadir al Carrito'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer with Store Links & Descriptions */}
            <footer className="mt-12 mx-4 md:mx-6 pb-6 border-t border-white/10 text-center max-w-7xl md:mx-auto">
                <div className="pt-8 flex flex-col items-center">
                    {activeSettings.storeLogo ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-black border border-white/10 mb-4 shadow-md">
                            <img src={activeSettings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <AppLogo className="w-10 h-10 mb-4 opacity-50" />
                    )}
                    <h3 className="text-lg font-bold mb-2">{activeSettings.companyName || t('storefront.onlineCatalog')}</h3>

                    {activeSettings.storeDescription && (
                        <p className={`text-sm ${textMuted} max-w-md mx-auto mb-6 line-clamp-3 leading-relaxed`}>
                            {activeSettings.storeDescription}
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-4 mb-8">
                        {activeSettings.instagramUrl && (
                            <a href={`https://${activeSettings.instagramUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full transition-colors ${activeSettings.theme === 'light' ? 'bg-gray-100 hover:bg-pink-50 text-gray-500 hover:text-pink-500' : 'bg-white/5 hover:bg-pink-500/20 text-gray-400 hover:text-pink-500'}`}>
                                <Instagram size={18} />
                            </a>
                        )}
                        {activeSettings.facebookUrl && (
                            <a href={`https://${activeSettings.facebookUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full transition-colors ${activeSettings.theme === 'light' ? 'bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-500' : 'bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-500'}`}>
                                <Facebook size={18} />
                            </a>
                        )}
                        {activeSettings.websiteUrl && (
                            <a href={`https://${activeSettings.websiteUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full transition-colors ${activeSettings.theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900' : 'bg-white/5 hover:bg-white/20 text-gray-400 hover:text-white'}`}>
                                <Globe size={18} />
                            </a>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};
