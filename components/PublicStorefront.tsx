import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, MessageCircle, X, Search, Filter, Loader2, Store, AlertTriangle, CloudOff, Instagram, Facebook, Globe, Info } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { Button } from './ui/Button';
import { AppLogo } from './AppLogo';
import { useTranslation } from '../hooks/useTranslation';

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
        setAuthModalOpen
    } = useStore();

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

    const handleCheckout = async () => {
        const phone = settings.whatsappNumber;

        if (!phone || phone.length < 5) {
            alert(t('storefront.invalidPhone'));
            return;
        }

        setIsOrdering(true);

        // Build Order String
        let orderItemsStr = "";
        cart.forEach(item => {
            orderItemsStr += `▪️ ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });

        // Prepare Template Data
        const template = settings.whatsappTemplate || t('storefront.defaultTemplate');

        let message = template;
        message = message.replace('{{TIENDA}}', settings.companyName || t('storefront.onlineCatalog'));
        message = message.replace('{{PEDIDO}}', orderItemsStr);
        message = message.replace('{{TOTAL}}', `$${cartTotal.toFixed(2)}`);
        message = message.replace('{{CLIENTE}}', customerName || t('storefront.yourNameOption').replace(' (Opcional)', '').replace(' (Optional)', ''));

        // Attempt DB Save
        try {
            console.log("Attempting to create order in DB...");
            // This will now throw if it fails in store.ts
            await createOrder({ name: customerName, phone: 'WhatsApp' });
            console.log("Order DB creation success.");

            if (isDemoMode) {
                console.log("DEMO: Skipping WhatsApp redirect, showing Registration prompt.");
                setIsCartOpen(false);
                setIsOrdering(false);
                setAuthModalOpen(true);
                return;
            }

            // Redirect to WhatsApp - Use window.location.href to avoid popup blockers
            const url = `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
            window.location.href = url;

        } catch (e: any) {
            console.error("Critical: Order synchronization failed:", e);

            const errorDetail = e.message || t('storefront.unknownError');
            const confirmWA = confirm(`${t('storefront.syncError')} ${errorDetail}${t('storefront.syncErrorDesc')}`);

            if (confirmWA) {
                const url = `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
                clearCart();
                setIsCartOpen(false);
                window.location.href = url;
            }
        } finally {
            setIsOrdering(false);
        }
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

                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setActiveCategory('All')}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${activeCategory === 'All' ? 'bg-white text-black border-white' : 'bg-[#111] text-gray-400 border-white/10'}`}
                            >
                                {t('storefront.all')}
                            </button>
                            {publicCategories.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveCategory(c.name)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${activeCategory === c.name ? 'bg-white text-black border-white' : 'bg-[#111] text-gray-400 border-white/10'}`}
                                >
                                    {c.name}
                                </button>
                            ))}
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

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-[#111] h-full shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#161616]">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingCart size={20} className="text-green-500" /> {t('storefront.yourOrder')}
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                                    <p>{t('storefront.emptyCart')}</p>
                                    <Button variant="ghost" onClick={() => setIsCartOpen(false)} className="mt-4">{t('storefront.continueShopping')}</Button>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-[#0a0a0a] p-3 rounded-xl border border-white/5">
                                        <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                            <ProductImage src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm text-white line-clamp-1">{item.name}</h4>
                                            <p className="text-green-400 font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2 bg-[#222] rounded-lg p-1">
                                                <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:text-white text-gray-400"><Minus size={12} /></button>
                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:text-white text-gray-400"><Plus size={12} /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                                <Trash2 size={12} /> {t('storefront.remove')}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 bg-[#161616] border-t border-white/10 space-y-4">
                                <div className="space-y-2 mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t('storefront.yourNameOption')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('storefront.forSeller')}
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none"
                                    />
                                </div>

                                <div className="flex justify-between items-center text-lg font-bold text-white mb-2">
                                    <span>{t('storefront.totalToPay')}</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>

                                {settings.whatsappEnabled ? (
                                    <>
                                        <Button
                                            id="tour-checkout"
                                            onClick={handleCheckout}
                                            isLoading={isOrdering}
                                            className="w-full py-4 text-base font-bold bg-green-600 hover:bg-green-500 text-black shadow-lg shadow-green-900/20"
                                            icon={<MessageCircle size={20} />}
                                        >
                                            {t('storefront.orderWhatsapp')}
                                        </Button>
                                        <p className="text-[10px] text-gray-500 text-center">
                                            {t('storefront.whatsappNote')}
                                        </p>
                                    </>
                                ) : (
                                    <div className="bg-red-900/20 border border-red-500/20 p-4 rounded-xl text-center">
                                        <p className="text-sm font-bold text-red-400 mb-1 flex items-center justify-center gap-2">
                                            <CloudOff size={16} /> {t('storefront.ordersDisabled')}
                                        </p>
                                        <p className="text-xs text-red-200">
                                            {t('storefront.sellerNoWhatsapp')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

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
        </div>
    );
};
