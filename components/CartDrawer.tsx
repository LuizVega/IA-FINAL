import React, { useState } from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2, MessageCircle, CloudOff, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './ui/Button';
import { getCurrencySymbol, shareContent } from '../lib/utils';
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

    const [isOrdering, setIsOrdering] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const primaryColor = settings.primaryColor || '#32D74B';
    const isLight = settings.theme === 'light';
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Theme-aware colors
    const bgMain = isLight ? '#ffffff' : '#0a0a0a';
    const bgCard = isLight ? '#f5f5f7' : '#111111';
    const bgInput = isLight ? '#f0f0f2' : '#000000';
    const textPrimary = isLight ? '#111111' : '#ffffff';
    const textMuted = isLight ? '#6b7280' : '#9ca3af';
    const borderColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';

    const handleWhatsAppCheckout = async () => {
        const phone = settings.whatsappNumber;
        if (!phone || phone.length < 5) {
            alert(t('storefront.invalidPhone'));
            return;
        }

        setIsOrdering(true);
        try {
            let orderItemsStr = "";
            cart.forEach(item => {
                orderItemsStr += `▪️ ${item.quantity}x ${item.name} - ${getCurrencySymbol(settings.currency)} ${(item.price * item.quantity).toFixed(2)}\n`;
            });

            const template = settings.whatsappTemplate || `Hola {{TIENDA}}, me interesa:\n\n{{PEDIDO}}\n\n💰 Total: ${getCurrencySymbol(settings.currency)} {{TOTAL}}\n👤 Cliente: {{CLIENTE}}`;
            let message = template;
            message = message.replace('{{TIENDA}}', settings.companyName || 'La Tienda');
            message = message.replace('{{PEDIDO}}', orderItemsStr);
            message = message.replace('{{TOTAL}}', cartTotal.toFixed(2));
            message = message.replace('{{CLIENTE}}', 'Cliente Web');

            const orderId = await createOrder({ name: 'Cliente Web', phone: 'WhatsApp' });

            if (orderId) {
                message += `\n\n✅ Confirmar venta y descontar stock: ${window.location.origin}/c/${orderId}`;
            }

            if (!isDemoMode) {
                let formattedPhone = phone.replace(/\\D/g, '');
                if (formattedPhone.length === 9 && formattedPhone.startsWith('9')) {
                    formattedPhone = '51' + formattedPhone;
                }
                const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
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
            <div
                className="relative w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
                style={{ backgroundColor: bgMain, borderLeft: `1px solid ${borderColor}` }}
            >
                {showSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: bgMain }}>
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-bounce"
                            style={{ backgroundColor: `${primaryColor}20` }}
                        >
                            <CheckCircle2 size={48} style={{ color: primaryColor }} />
                        </div>
                        <h2 className="text-2xl font-black mb-2" style={{ color: textPrimary }}>¡COMPRA REGISTRADA!</h2>
                        <p style={{ color: textMuted }}>Has ganado <span className="font-bold" style={{ color: primaryColor }}>1 Morez</span> por esta compra.</p>
                        <p className="text-[10px] mt-4 uppercase tracking-widest" style={{ color: textMuted }}>Cerrando ventana...</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div
                            className="p-6 flex justify-between items-center shrink-0"
                            style={{ borderBottom: `1px solid ${borderColor}`, backgroundColor: bgCard }}
                        >
                            <h2 className="text-xl font-black flex items-center gap-2 tracking-tight" style={{ color: textPrimary }}>
                                <ShoppingCart size={22} style={{ color: primaryColor }} /> TU PEDIDO
                            </h2>
                            <button onClick={onClose} className="p-2 rounded-full transition-all active:scale-90" style={{ color: textMuted }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-20" style={{ color: textMuted }}>
                                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ backgroundColor: `${primaryColor}10` }}>
                                        <ShoppingCart size={32} style={{ color: `${primaryColor}60` }} />
                                    </div>
                                    <p className="font-medium">Tu carrito está vacío</p>
                                    <button
                                        onClick={onClose}
                                        className="mt-4 font-bold text-sm"
                                        style={{ color: primaryColor }}
                                    >
                                        Explorar productos
                                    </button>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 items-center p-3 rounded-2xl"
                                        style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}
                                    >
                                        <div
                                            className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                                            style={{ border: `1px solid ${borderColor}` }}
                                        >
                                            <ProductImage src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate" style={{ color: textPrimary }}>{item.name}</h4>
                                            <p className="font-black text-xs mt-0.5" style={{ color: primaryColor }}>
                                                {getCurrencySymbol(settings.currency)} {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div
                                                className="flex items-center gap-2 rounded-xl p-1"
                                                style={{ backgroundColor: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.05)', border: `1px solid ${borderColor}` }}
                                            >
                                                <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 transition-colors" style={{ color: textMuted }}><Minus size={13} /></button>
                                                <span className="text-xs font-black w-4 text-center" style={{ color: textPrimary }}>{item.quantity}</span>
                                                <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 transition-colors" style={{ color: primaryColor }}><Plus size={13} /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div
                                className="p-5 space-y-4 shrink-0"
                                style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: bgCard }}
                            >


                                <div
                                    className="flex justify-between items-center p-4 rounded-2xl"
                                    style={{ backgroundColor: isLight ? '#ebebed' : 'rgba(0,0,0,0.3)', border: `1px solid ${borderColor}` }}
                                >
                                    <span className="font-bold" style={{ color: textMuted }}>Total a pagar</span>
                                    <span className="text-xl font-black" style={{ color: textPrimary }}>{getCurrencySymbol(settings.currency)} {cartTotal.toFixed(2)}</span>
                                </div>

                                {settings.whatsappEnabled ? (
                                    <button
                                        onClick={handleWhatsAppCheckout}
                                        disabled={isOrdering}
                                        className="w-full py-4 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                                        style={{
                                            background: `linear-gradient(135deg, ${primaryColor}, ${settings.secondaryColor || primaryColor})`,
                                            boxShadow: `0 8px 24px -8px ${primaryColor}80`
                                        }}
                                    >
                                        <MessageCircle size={20} /> Pedir por WhatsApp
                                    </button>
                                ) : (
                                    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                                        <p className="text-xs text-red-400 font-bold flex items-center justify-center gap-2">
                                            <CloudOff size={14} /> Pedidos por WhatsApp deshabilitados
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
