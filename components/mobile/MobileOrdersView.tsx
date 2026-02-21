import React, { useState } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { CheckCircle, XCircle, Store, ExternalLink } from 'lucide-react';

export const MobileOrdersView: React.FC = () => {
    const { t } = useTranslation();
    const {
        orders = [],
        updateOrderStatus,
        settings
    } = useStore() as any;

    const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'cancelled'>('pending');

    const statusOptions = [
        { id: 'pending' as const, label: t('dashboard.ordersPending') || 'Pendientes' },
        { id: 'completed' as const, label: t('dashboard.ordersCompleted') || 'Completados' },
        { id: 'cancelled' as const, label: t('dashboard.ordersCancelled') || 'Cancelados' }
    ];

    const filteredOrders = (orders as any[]).filter(order => order.status === activeTab || (activeTab === 'cancelled' && order.status === 'rejected'));

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-[#ff9500]/15 text-[#ff9500]';
            case 'completed': return 'bg-[#14c00f]/15 text-[#14c00f]';
            case 'cancelled':
            case 'rejected': return 'bg-[#ff3b30]/15 text-[#ff3b30]';
            default: return 'bg-slate-500/15 text-slate-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return t('dashboard.statusPending') || 'PENDIENTE';
            case 'completed': return t('dashboard.statusCompleted') || 'COMPLETADO';
            case 'cancelled':
            case 'rejected': return t('dashboard.statusCancelled') || 'CANCELADO';
            default: return t('common.unknown') || 'DESCONOCIDO';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f6f8f6] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans min-h-screen">
            {/* Header Section */}
            <header className="sticky top-0 z-20 bg-[#f6f8f6]/80 dark:bg-black/80 backdrop-blur-[20px] px-6 pt-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">{t('nav.orders') || 'Gestión de Pedidos'}</h1>
                    {settings?.storeSlug && (
                        <a
                            href={`/store/${settings.storeSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#14c00f] hover:bg-[#14c00f]/90 text-black font-semibold px-4 py-2.5 rounded-full flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-[#14c00f]/20 active:scale-95"
                        >
                            <Store size={18} />
                            <span className="text-sm">{t('nav.publicStore') || 'Ver Tienda'}</span>
                            <ExternalLink size={14} className="ml-1 opacity-70" />
                        </a>
                    )}
                </div>

                {/* Segmented Tabs */}
                <div className="flex p-1 bg-slate-200 dark:bg-zinc-800/50 rounded-xl">
                    {statusOptions.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.id
                                ? 'bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6 pb-32">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 dark:text-zinc-500">
                        {t('dashboard.noOrdersFound') || 'No hay pedidos.'}
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-[#1c1c1e] rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold">{order.customerName || t('common.customer')}</h3>
                                        <p className="text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-widest mt-0.5">ORD #{String(order.id || '').slice(0, 5).toUpperCase()}</p>
                                    </div>
                                    <span className="text-sm text-slate-400 dark:text-zinc-500">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide mb-4 ${getStatusStyle(order.status)}`}>
                                    {getStatusText(order.status)}
                                </div>

                                {/* Items List */}
                                <div className="space-y-3 py-4 border-t border-slate-100 dark:border-zinc-800">
                                    {order.items?.map((item: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center text-slate-900 dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[#14c00f] font-bold">{item.quantity || 1}x</span>
                                                <span className="text-sm font-medium">{item.productName || item.name || t('common.product')}</span>
                                            </div>
                                            <span className="text-sm font-semibold">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-zinc-800 mb-6 text-slate-900 dark:text-white">
                                    <span className="text-sm text-slate-500 dark:text-zinc-400">{t('dashboard.orderTotal') || 'Total del pedido'}</span>
                                    <span className="text-xl font-bold">${(order.totalAmount || 0).toFixed(2)}</span>
                                </div>

                                {/* Actions */}
                                {order.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => updateOrderStatus ? updateOrderStatus(order.id, 'completed') : null}
                                            className="flex-1 bg-[#14c00f] text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-[#14c00f]/20"
                                        >
                                            <CheckCircle size={20} />
                                            {t('dashboard.confirmSale') || 'Confirmar Venta'}
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatus ? updateOrderStatus(order.id, 'cancelled') : null}
                                            className="w-14 h-14 border border-[#ff3b30]/30 flex items-center justify-center rounded-lg text-[#ff3b30] hover:bg-[#ff3b30]/10 active:scale-[0.98] transition-colors"
                                        >
                                            <XCircle size={28} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};
