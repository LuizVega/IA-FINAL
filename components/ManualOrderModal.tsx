import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { X, Search, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ManualOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ManualOrderModal: React.FC<ManualOrderModalProps> = ({ isOpen, onClose }) => {
    const { inventory, createOrder, settings } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedItems, setSelectedItems] = useState<{ product: Product, quantity: number }[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const filteredInventory = inventory.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addItem = (product: Product) => {
        const existing = selectedItems.find(item => item.product.id === product.id);
        if (existing) {
            updateQuantity(product.id, 1);
        } else {
            setSelectedItems([...selectedItems, { product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: string, delta: number) => {
        setSelectedItems(selectedItems.map(item => {
            if (item.product.id === productId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const removeItem = (productId: string) => {
        setSelectedItems(selectedItems.filter(item => item.product.id !== productId));
    };

    const total = selectedItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            alert("Selecciona al menos un producto.");
            return;
        }

        setLoading(true);
        try {
            // We need to temporarily set the cart in the store to use createOrder
            // Or modify createOrder to accept items.
            // Let's use a simpler approach: createOrder uses what's in the cart.
            // So we need to:
            // 1. Save current cart
            // 2. Clear cart
            // 3. Add these items to cart
            // 4. Create order
            // 5. Restore cart (optional, usually manual order is a separate flow)

            // Actually, let's just use the current store's cart mechanism but via UI.
            // But this is a "Seller" making an order for a customer.

            // For now, let's implement a "createManualOrder" in store or just use createOrder with a trick.
            // Wait, createOrder in store.ts uses `get().cart`.

            // I'll update store.ts to add a `createManualOrder` action for better separation.

            // For this modal, I'll assume I'll add `createManualOrder` to store.

            // @ts-ignore
            await useStore.getState().createManualOrder({
                customer_name: customerName,
                customer_phone: customerPhone,
                items: selectedItems.map(i => ({
                    product_id: i.product.id,
                    name: i.product.name,
                    quantity: i.quantity,
                    price: i.product.price
                })),
                total_amount: total
            });

            alert("Pedido manual creado con éxito.");
            onClose();
            setSelectedItems([]);
            setCustomerName('');
            setCustomerPhone('');
        } catch (error) {
            alert("Error al crear pedido: " + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-3xl shadow-2xl flex flex-col md:flex-row h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Left Side: Product Selection */}
                <div className="flex-[1.5] border-r border-white/5 flex flex-col p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShoppingBag className="text-green-500" size={20} /> Seleccionar Productos
                        </h3>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-green-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {filteredInventory.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addItem(product)}
                                className="w-full flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-transparent hover:border-white/10 transition-all text-left group"
                            >
                                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white line-clamp-1">{product.name}</p>
                                    <p className="text-[10px] text-gray-500 font-mono">{product.sku}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-500">${product.price.toFixed(2)}</p>
                                    <p className="text-[10px] text-gray-600">Stock: {product.stock}</p>
                                </div>
                                <div className="bg-green-500/10 text-green-500 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus size={16} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Order Summary */}
                <div className="flex-1 bg-black/20 flex flex-col p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Resumen del Pedido</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Cliente (Opcional)</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-green-500 outline-none transition-all"
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">WhatsApp (Opcional)</label>
                            <input
                                type="text"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-green-500 outline-none transition-all"
                                placeholder="Ej: +51 987..."
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
                        {selectedItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                <ShoppingBag size={48} className="mb-2" />
                                <p className="text-sm">Agrega productos para comenzar</p>
                            </div>
                        ) : (
                            selectedItems.map(item => (
                                <div key={item.product.id} className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white leading-tight">{item.product.name}</p>
                                        <p className="text-xs text-green-500 font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-black/50 rounded-xl border border-white/10">
                                            <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 hover:text-green-500 transition-colors">
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 hover:text-green-500 transition-colors">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button onClick={() => removeItem(item.product.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-end">
                            <span className="text-gray-500 text-sm font-bold uppercase">Total</span>
                            <span className="text-3xl font-black text-green-500">${total.toFixed(2)}</span>
                        </div>
                        <Button
                            className="w-full py-4 text-lg bg-green-600 hover:bg-green-500 text-black font-bold shadow-lg"
                            onClick={handleSubmit}
                            isLoading={loading}
                            disabled={selectedItems.length === 0}
                        >
                            Crear Pedido
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
