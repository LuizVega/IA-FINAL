import React, { useState } from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2, MessageCircle, CloudOff, Info, CheckCircle2, Store } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './ui/Button';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const {
        cart,
        removeFromCart,
        updateCartQuantity,
        settings,
        createOrder,
        clearCart,
        isDemoMode
    } = useStore();

    const [customerName, setCustomerName] = useState('');
    const [isOrdering, setIsOrdering] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleWhatsAppCheckout = async () => {
        const phone = settings.whatsappNumber;
        if (!phone || phone.length < 5) {
            alert(t('storefront.invalidPhone'));
            return;
        }

        setIsOrdering(true);
        try {
            // Build Order String
            let orderItemsStr = "";
            cart.forEach(item => {
                orderItemsStr += `▪️ ${item.quantity}x ${item.name} - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
            });

            const template = settings.whatsappTemplate || "Hola {{TIENDA}}, me interesa:\n\n{{PEDIDO}}\n\n💰 Total: S/ {{TOTAL}}\n👤 Cliente: {{CLIENTE}}";
            let message = template;
            message = message.replace('{{TIENDA}}', settings.companyName || 'La Tienda');
            message = message.replace('{{PEDIDO}}', orderItemsStr);
            message = message.replace('{{TOTAL}}', cartTotal.toFixed(2));
            message = message.replace('{{CLIENTE}}', customerName || 'Cliente Web');

            await createOrder({ name: customerName, phone: 'WhatsApp' });

            if (!isDemoMode) {
                const url = `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
                window.location.href = url;
            } else {
                handleLocalSuccess();
            }
        } catch (e) {
            console.error("WhatsApp checkout error:", e);
            alert("Error al procesar el pedido.");
        } finally {
            setIsOrdering(false);
        }
    };

    const handleInPersonCheckout = async () => {
        setIsOrdering(true);
        try {
            // Create a "Presencial" order
            await createOrder({ name: customerName, phone: 'Compra Presencial' });

            // In a real app, we'd call an API to award points. 
            // Here we'll handle success UI.
            handleLocalSuccess();
        } catch (e) {
            console.error("In-person checkout error:", e);
            alert("Error al registrar la compra.");
        } finally {
            setIsOrdering(false);
        }
    };

    const handleLocalSuccess = () => {
        setShowSuccess(true);
        clearCart();
        if (onSuccess) onSuccess();
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-[#0a0a0a] h-full shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300">

                {showSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle2 size={48} className="text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">¡COMPRA REGISTRADA!</h2>
                        <p className="text-gray-400">Has ganado <span className="text-green-400 font-bold">1 Morez</span> por esta compra.</p>
                        <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest">Cerrando ventana...</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111]">
                            <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                                <ShoppingCart size={22} className="text-green-500" /> TU PEDIDO
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-90">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-4">
                                        <ShoppingCart size={32} className="opacity-20" />
                                    </div>
                                    <p className="font-medium">Tu carrito está vacío</p>
                                    <button onClick={onClose} className="mt-4 text-green-500 font-bold text-sm">Explorar puestos</button>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-[#111] p-3 rounded-2xl border border-white/5 group transition-all hover:border-white/10">
                                        <div className="w-16 h-16 bg-black rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                                            <ProductImage src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                                            <p className="text-green-400 font-black text-xs mt-1">S/ {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-3 bg-black/40 rounded-xl p-1 border border-white/5">
                                                <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1.5 hover:text-white text-gray-500 transition-colors"><Minus size={14} /></button>
                                                <span className="text-xs font-black w-4 text-center text-white">{item.quantity}</span>
                                                <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1.5 hover:text-white text-gray-500 transition-colors"><Plus size={14} /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500/50 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 bg-[#111] border-t border-white/10 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tu Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Para el vendedor..."
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                                    <span className="text-gray-400 font-bold">Total a pagar</span>
                                    <span className="text-xl font-black text-white">S/ {cartTotal.toFixed(2)}</span>
                                </div>

                                <div className="grid grid-cols-1 gap-3 pt-2">
                                    {settings.whatsappEnabled ? (
                                        <button
                                            onClick={handleWhatsAppCheckout}
                                            disabled={isOrdering}
                                            className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-black text-lg rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            <MessageCircle size={20} /> Pedir por WhatsApp
                                        </button>
                                    ) : (
                                        <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-center">
                                            <p className="text-xs text-red-400 font-bold flex items-center justify-center gap-2">
                                                <CloudOff size={14} /> Pedidos por WhatsApp deshabilitados
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleInPersonCheckout}
                                        disabled={isOrdering}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] border border-white/10 transition-all disabled:opacity-50"
                                    >
                                        <Store size={20} className="text-green-500" /> Marcar compra presencial
                                    </button>

                                    <div className="flex items-center gap-2 justify-center text-[10px] text-gray-500 uppercase tracking-tighter">
                                        <Info size={10} /> Recibe 1 Morez por compra presencial
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
