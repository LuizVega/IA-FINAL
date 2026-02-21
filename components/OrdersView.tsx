import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { CheckCircle2, XCircle, Clock, ShoppingBag, RefreshCw, User, Receipt, Package, History } from 'lucide-react';
import { Button } from './ui/Button';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Order } from '../types';
import { ManualOrderModal } from './ManualOrderModal';
import { Plus } from 'lucide-react';

export const OrdersView: React.FC = () => {
    const { orders, updateOrderStatus, refreshOrders } = useStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    // Auto-refresh mechanism (Aggressive Polling)
    useEffect(() => {
        refreshOrders();
        const interval = setInterval(() => {
            handleRefresh();
        }, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const pendingOrders = orders.filter((o: Order) => o.status === 'pending').sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const historyOrders = orders.filter((o: Order) => o.status !== 'pending').sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshOrders();
        setLastUpdated(new Date());
        setIsRefreshing(false);
    };

    const handleUpdateStatus = async (orderId: string, status: 'completed' | 'cancelled') => {
        if (status === 'completed' && confirmingOrderId !== orderId) {
            setConfirmingOrderId(orderId);
            return;
        }

        setIsProcessing(orderId);
        try {
            await updateOrderStatus(orderId, status);
            setConfirmingOrderId(null);
        } catch (error) {
            alert("Error al actualizar el pedido. Por favor intente de nuevo.");
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto h-full overflow-y-auto pb-32">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-green-600/20 rounded-xl text-green-500">
                            <ShoppingBag size={28} />
                        </div>
                        Gestión de Pedidos
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Ventas generadas desde tu catálogo público.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                        Sincronizando... {lastUpdated.toLocaleTimeString()}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        className="text-gray-400 hover:text-white"
                        icon={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
                    >
                        Actualizar
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsManualModalOpen(true)}
                        className="bg-green-600 hover:bg-green-500 text-black font-bold"
                        icon={<Plus size={14} />}
                    >
                        Nuevo Pedido Manual
                    </Button>
                </div>
            </div>

            <ManualOrderModal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
            />

            {/* PENDING ORDERS SECTION */}
            <div className="space-y-6 mb-12">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock size={14} /> Pedidos por Confirmar
                </h3>

                {pendingOrders.length === 0 ? (
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mb-4 text-gray-700">
                            <Receipt size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">No hay pedidos nuevos por ahora.</p>
                        <p className="text-gray-700 text-xs mt-1">Comparte tu link de tienda para recibir ventas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingOrders.map((order: Order, idx: number) => (
                            <div key={order.id} id={idx === 0 ? "tour-order-card" : undefined} className={`bg-[#111] border rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${confirmingOrderId === order.id ? 'border-green-500 ring-4 ring-green-500/20 scale-[1.02]' : 'border-amber-500/20'}`}>
                                {/* Card Header */}
                                <div className={`p-4 border-b flex justify-between items-center ${confirmingOrderId === order.id ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/5 border-amber-500/10'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-black ${confirmingOrderId === order.id ? 'bg-green-500' : 'bg-amber-500'}`}>
                                            <User size={16} />
                                        </div>
                                        <span className="font-bold text-white">{order.customer_name || 'Cliente Nuevo'}</span>
                                    </div>
                                    <span className={`text-[10px] text-black font-extrabold px-2 py-0.5 rounded-full uppercase ${confirmingOrderId === order.id ? 'bg-green-500' : 'bg-amber-500'}`}>
                                        {confirmingOrderId === order.id ? '¿Confirmar?' : 'Pendiente'}
                                    </span>
                                </div>

                                {/* Items List - "The Ticket" */}
                                <div className="p-5 space-y-4">
                                    <div className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start gap-4 text-sm bg-black/20 p-2 rounded-xl border border-white/5">
                                                <div className="flex gap-2">
                                                    <span className="text-amber-500 font-bold w-6">{item.quantity}x</span>
                                                    <span className="text-gray-300 font-medium">{item.name}</span>
                                                </div>
                                                <span className="text-white font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-dashed border-white/10 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-gray-600 uppercase font-bold">Total a Cobrar</p>
                                            <p className="text-2xl font-black text-green-500">${order.total_amount.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-600 uppercase font-bold">Solicitado hace</p>
                                            <p className="text-xs text-gray-400 font-medium">{formatDistanceToNow(parseISO(order.created_at), { locale: es })}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="p-4 bg-black/40 flex gap-2 border-t border-white/5">
                                    {confirmingOrderId === order.id ? (
                                        <>
                                            <Button
                                                className="flex-[2] bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded-2xl animate-pulse"
                                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                isLoading={isProcessing === order.id}
                                                icon={<CheckCircle2 size={18} />}
                                            >
                                                Confirmar y Descontar Stock
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl"
                                                onClick={() => setConfirmingOrderId(null)}
                                                disabled={isProcessing === order.id}
                                            >
                                                Cerrar
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                className="flex-1 bg-green-600/10 hover:bg-green-600/20 text-green-500 font-bold py-3 rounded-2xl border border-green-500/20"
                                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                icon={<CheckCircle2 size={18} />}
                                            >
                                                Confirmar Venta
                                            </Button>
                                            <Button
                                                variant="danger"
                                                className="px-4 bg-red-900/10 border-red-900/20 text-red-500 rounded-2xl"
                                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                isLoading={isProcessing === order.id}
                                                icon={<XCircle size={18} />}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* HISTORY SECTION */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <History size={14} /> Historial de Ventas
                </h3>

                {historyOrders.length === 0 ? (
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center">
                        <p className="text-gray-700 text-sm">Aún no hay ventas en el historial.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {historyOrders.map((order: Order) => (
                            <div key={order.id} className="bg-[#111] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-[#141414] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {order.status === 'completed' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{order.customer_name}</p>
                                        <p className="text-[10px] text-gray-500">{format(parseISO(order.created_at), "d 'de' MMMM, HH:mm", { locale: es })}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-black">${order.total_amount.toFixed(2)}</p>
                                    <p className={`text-[10px] font-bold uppercase ${order.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                                        {order.status === 'completed' ? 'Completado' : 'Cancelado'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
