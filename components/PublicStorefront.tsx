import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, MessageCircle, X, Search, Filter, Loader2, Store, AlertTriangle, CloudOff, Instagram, Facebook, Globe, Info } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { Button } from './ui/Button';
import { AppLogo } from './AppLogo';
import { useTranslation } from '../hooks/useTranslation';
import { CustomerPassportModal } from './CustomerPassportModal';
import { CartDrawer } from './CartDrawer';

export const PublicStorefront: React.FC = () => {
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

    const [localSearch, setLocalSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [customerName, setCustomerName] = useState('');
    const [isOrdering, setIsOrdering] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isPassportOpen, setIsPassportOpen] = useState(false);

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                <Loader2 size={48} className="animate-spin text-green-500 mb-4" />
                <p className="text-gray-400 animate-pulse">{t('storefront.loadingCatalog')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 font-sans pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#111] md:bg-[#111]/90 md:backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    {settings.storeLogo ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
                            <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <AppLogo className="w-8 h-8" />
                    )}
                    <span className="font-bold text-white text-lg">{settings.companyName || t('storefront.onlineCatalog')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPassportOpen(true)}
                        className="bg-green-500/10 text-green-500 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-green-500/20 active:scale-95 transition-all"
                    >
                        Pasaporte
                    </button>
                    <button
                        id="tour-open-cart"
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 rounded-full transition-colors bg-white/5 hover:bg-white/10"
                        style={settings.primaryColor ? { color: settings.primaryColor } : { color: '#22c55e' }}
                    >
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Content */}
            {inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
                    <div className="bg-[#111] p-8 rounded-full mb-6 border border-white/5">
                        <Store size={48} className="text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('storefront.catalogNotAvailable')}</h2>
                    <p className="text-gray-500 max-w-sm mb-8">
                        {t('storefront.catalogEmpty')}
                    </p>

                    <div className="bg-amber-900/10 border border-amber-500/20 p-4 rounded-xl max-w-md mx-auto text-left">
                        <h4 className="text-amber-500 font-bold text-xs uppercase flex items-center gap-2 mb-2">
                            <AlertTriangle size={14} /> {t('storefront.ownerNote')}
                        </h4>
                        <p className="text-xs text-amber-200/80 leading-relaxed">
                            {t('storefront.ownerNote1')}<br />
                            {t('storefront.ownerNote2')}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Search & Filter */}
                    <div className="px-6 pt-6 pb-4 space-y-4 max-w-7xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('storefront.searchProducts')}
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white focus:border-green-500 outline-none"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
                        {filteredProducts.map((product, idx) => (
                            <div key={product.id} className="bg-[#111] rounded-2xl overflow-hidden border border-white/5 flex flex-col shadow-sm transition-all group hover:border-white/20">
                                <div
                                    className="aspect-square bg-black relative cursor-pointer"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{t('storefront.soldOut')}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex flex-col flex-1 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">{product.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3 flex-1">{product.category}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="font-bold text-white">${product.price.toFixed(2)}</span>
                                        <button
                                            id={idx === 0 ? "tour-add-to-cart" : undefined}
                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                            disabled={product.stock <= 0}
                                            className="text-black p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            style={{ backgroundColor: settings.primaryColor || '#16a34a' }}
                                        >
                                            <Plus size={16} />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
                    <div className="relative w-full max-w-sm bg-[#111] rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10"
                        >
                            <X size={16} />
                        </button>
                        <div className="aspect-square bg-black relative">
                            <ProductImage src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-bold text-white">{selectedProduct.name}</h2>
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-4 block">
                                {selectedProduct.category}
                            </span>

                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-1">
                                    <Info size={14} className="text-gray-500" /> Descripción
                                </h4>
                                <div className="text-gray-400 text-sm leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedProduct.description || (
                                        <span className="italic opacity-50">Sin descripción adicional.</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                                <div className="text-2xl font-black text-white">
                                    ${selectedProduct.price.toFixed(2)}
                                </div>
                                <Button
                                    onClick={() => {
                                        addToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    disabled={selectedProduct.stock <= 0}
                                    style={{ backgroundColor: settings.primaryColor || '#16a34a' }}
                                    className="text-black font-bold shadow-lg shadow-green-900/20 rounded-xl"
                                >
                                    {selectedProduct.stock <= 0 ? t('storefront.soldOut') : 'Añadir al Carrito'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer with Store Links & Descriptions */}
            <footer className="mt-16 mx-6 pb-6 border-t border-white/10 text-center max-w-7xl md:mx-auto">
                <div className="pt-8 flex flex-col items-center">
                    {settings.storeLogo ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/10 mb-4">
                            <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <AppLogo className="w-10 h-10 mb-4 opacity-50" />
                    )}
                    <h3 className="text-lg font-bold text-white mb-2">{settings.companyName || t('storefront.onlineCatalog')}</h3>

                    {settings.storeDescription && (
                        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6 line-clamp-3">
                            {settings.storeDescription}
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-4 mb-8">
                        {settings.instagramUrl && (
                            <a href={`https://${settings.instagramUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-pink-500/20 hover:text-pink-500 transition-colors text-gray-400">
                                <Instagram size={20} />
                            </a>
                        )}
                        {settings.facebookUrl && (
                            <a href={`https://${settings.facebookUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-blue-500/20 hover:text-blue-500 transition-colors text-gray-400">
                                <Facebook size={20} />
                            </a>
                        )}
                        {settings.websiteUrl && (
                            <a href={`https://${settings.websiteUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/20 hover:text-white transition-colors text-gray-400">
                                <Globe size={20} />
                            </a>
                        )}
                    </div>
                </div>
            </footer>
            {/* Customer Passport Modal */}
            <CustomerPassportModal
                isOpen={isPassportOpen}
                onClose={() => setIsPassportOpen(false)}
                shopName={settings.companyName || 'Esta Tienda'}
            />
        </div>
    );
};
