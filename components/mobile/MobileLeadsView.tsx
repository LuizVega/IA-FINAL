import React, { useMemo } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Users, Search, MessageCircle, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const MobileLeadsView: React.FC = () => {
    const { t } = useTranslation();
    const { orders, inventory } = useStore() as any;

    // Derived leads from orders (since we don't have a separate leads table yet, 
    // we use orders with customer info as the primary source for now)
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

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-6">
                <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Cazador de Clientes</h1>
                    <p className="text-white/40 text-sm">Clientes que han interactuado con tu QR.</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-md mx-auto space-y-6">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
                            <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1 text-center">Total Capturados</div>
                            <div className="text-2xl font-black text-white text-center">{leads.length}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
                            <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1 text-center">Fidelizados</div>
                            <div className="text-2xl font-black text-[#32D74B] text-center">
                                {leads.filter(l => l.totalOrders > 1).length}
                            </div>
                        </div>
                    </div>

                    {/* Leads List */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] px-2 flex justify-between">
                            <span>Historial Reciente</span>
                            <span>{leads.length} LEADS</span>
                        </h2>

                        {leads.map((lead: any) => (
                            <div
                                key={lead.phone}
                                className="bg-[#121212] p-5 rounded-[28px] border border-white/5 flex items-center gap-4 active:scale-[0.98] transition-all relative overflow-hidden group shadow-xl"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#32D74B]/5 transition-colors"></div>

                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#32D74B]/30 transition-colors relative z-10 shrink-0">
                                    <Users size={24} className="text-white/40 group-hover:text-[#32D74B] transition-colors" />
                                </div>

                                <div className="flex-grow min-w-0 relative z-10">
                                    <h3 className="font-bold text-white truncate text-base tracking-tight mb-0.5">{lead.name}</h3>
                                    <p className="text-xs font-medium text-[#32D74B] mb-1">{lead.phone}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-wider">
                                        <Calendar size={10} />
                                        {format(new Date(lead.lastVisit), "d 'de' MMMM", { locale: es })}
                                    </div>
                                </div>

                                <div className="relative z-10 flex flex-col items-end gap-1">
                                    <button
                                        onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
                                        className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center active:scale-90 transition-all border border-[#25D366]/10"
                                    >
                                        <MessageCircle size={20} fill="currentColor" />
                                    </button>
                                    <div className="bg-white/5 px-2 py-0.5 rounded-full text-[9px] font-black text-white/40 border border-white/5">
                                        {lead.totalOrders} PEDIDOS
                                    </div>
                                </div>
                            </div>
                        ))}

                        {leads.length === 0 && (
                            <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-[40px]">
                                <Users size={48} className="mx-auto text-white/10 mb-4" />
                                <h3 className="text-white font-bold mb-2">Sin clientes aún</h3>
                                <p className="text-white/30 text-xs px-10">Cuando tus clientes escaneen tu QR y hagan pedidos, aparecerán aquí para que puedas recontactarlos.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
