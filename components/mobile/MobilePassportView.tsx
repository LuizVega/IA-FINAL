import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { CheckCircle, XCircle, Users, ShoppingBag, MessageCircle, Calendar, ChevronRight, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const MobilePassportView: React.FC = () => {
    const { t } = useTranslation();
    const {
        orders = [],
        updateOrderStatus,
        settings,
        setQRModalOpen
    } = useStore() as any;

    const [activeSection, setActiveSection] = useState<'orders' | 'leads'>('orders');
    const [orderTab, setOrderTab] = useState<'pending' | 'completed' | 'cancelled'>('pending');

    // Leads logic (Customer Hunter)
    const leads = useMemo(() => {
        const uniqueLeads = new Map();
        orders.forEach((order: any) => {
            if (order.customer_phone && !uniqueLeads.has(order.customer_phone)) {
                uniqueLeads.set(order.customer_phone, {
                    phone: order.customer_phone,
                    name: order.customer_name || 'Cliente',
                    lastVisit: order.created_at,
                    totalOrders: 1,
                    totalSpent: order.total_amount
                });
            } else if (order.customer_phone) {
                const lead = uniqueLeads.get(order.customer_phone);
                lead.totalOrders += 1;
                lead.totalSpent += order.total_amount;
                if (new Date(order.created_at) > new Date(lead.lastVisit)) {
                    lead.lastVisit = order.created_at;
                }
            }
        });
        return Array.from(uniqueLeads.values()).sort((a, b) =>
            new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
        );
    }, [orders]);

    const filteredOrders = (orders as any[]).filter(order => order.status === orderTab || (orderTab === 'cancelled' && order.status === 'rejected'));

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-[#ff9500]/15 text-[#ff9500]';
            case 'completed': return 'bg-[#14c00f]/15 text-[#14c00f]';
            case 'cancelled':
            case 'rejected': return 'bg-[#ff3b30]/15 text-[#ff3b30]';
            default: return 'bg-slate-500/15 text-slate-500';
        }
    };

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 pt-10 pb-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-black tracking-tight italic">Pasaporte</h1>
                    <button
                        onClick={() => setQRModalOpen(true)}
                        className="bg-white text-black p-3 rounded-2xl shadow-lg active:scale-95 transition-transform"
                    >
                        <Zap size={24} fill="currentColor" />
                    </button>
                </div>

                {/* Main Sections Toggle */}
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 mb-2">
                    <button
                        onClick={() => setActiveSection('orders')}
                        className={`flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeSection === 'orders' ? 'bg-white text-black shadow-xl' : 'text-white/40'}`}
                    >
                        <ShoppingBag size={18} />
                        VENTAS
                    </button>
                    <button
                        onClick={() => setActiveSection('leads')}
                        className={`flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeSection === 'leads' ? 'bg-white text-black shadow-xl' : 'text-white/40'}`}
                    >
                        <Users size={18} />
                        LEADS
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
                {activeSection === 'orders' ? (
                    <div className="space-y-6">
                        {/* Order Tabs */}
                        <div className="flex gap-2 mb-4">
                            {['pending', 'completed', 'cancelled'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setOrderTab(tab as any)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${orderTab === tab ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10'}`}
                                >
                                    {tab === 'pending' ? 'Pendientes' : tab === 'completed' ? 'Éxito' : 'Cancel'}
                                </button>
                            ))}
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-20 text-white/20 font-bold uppercase tracking-widest">Sin Pedidos</div>
                        ) : (
                            filteredOrders.map(order => (
                                <div key={order.id} className="bg-[#121212] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl p-6 relative group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12 blur-2xl"></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            <h3 className="text-xl font-black text-white">{order.customer_name || 'Cliente'}</h3>
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                                ORD #{order.id.slice(0, 6)} • {format(new Date(order.created_at), 'HH:mm')}
                                            </p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-tighter ${getStatusStyle(order.status)}`}>
                                            {order.status.toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-2 mb-6 border-t border-white/5 pt-4 relative z-10">
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm font-medium">
                                                <span className="text-white/60">
                                                    <span className="text-[#32D74B] font-bold mr-2">{item.quantity}x</span>
                                                    {item.name}
                                                </span>
                                                <span className="text-white font-bold">${(item.price * item.quantity).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center mb-6 relative z-10">
                                        <span className="text-white/40 text-xs font-bold uppercase">Total</span>
                                        <span className="text-2xl font-black text-white">${order.total_amount.toFixed(0)}</span>
                                    </div>

                                    {order.status === 'pending' && (
                                        <div className="flex gap-3 relative z-10">
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                                className="flex-1 bg-[#32D74B] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                            >
                                                <CheckCircle size={20} />
                                                ENTREGAR
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-red-500 active:scale-95 transition-all"
                                            >
                                                <XCircle size={24} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {leads.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-[40px]">
                                <Users size={48} className="mx-auto text-white/10 mb-4" />
                                <h3 className="text-white font-bold mb-2">Captura tu primer Lead</h3>
                                <p className="text-white/30 text-xs px-10 text-center">Muestra tu QR para que los clientes entren en tu radar.</p>
                            </div>
                        ) : (
                            leads.map((lead: any) => (
                                <div key={lead.phone} className="bg-[#121212] p-5 rounded-[28px] border border-white/5 flex items-center gap-4 shadow-xl">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                        <Users size={24} className="text-[#32D74B]" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-white truncate text-base mb-0.5">{lead.name}</h3>
                                        <p className="text-xs font-medium text-[#32D74B] mb-1">{lead.phone}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-wider">
                                            <Calendar size={10} />
                                            {format(new Date(lead.lastVisit), "d MMM", { locale: es })}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <button
                                            onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
                                            className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center active:scale-90 transition-all border border-[#25D366]/10"
                                        >
                                            <MessageCircle size={20} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
