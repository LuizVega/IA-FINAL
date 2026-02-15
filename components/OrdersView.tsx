
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { CheckCircle2, XCircle, Clock, ShoppingBag, PackageMinus, RefreshCw, User, Receipt, DollarSign, Package } from 'lucide-react';
import { Button } from './ui/Button';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, refreshOrders } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh mechanism (Aggressive Polling)
  useEffect(() => {
      refreshOrders();
      const interval = setInterval(() => {
          handleRefresh();
      }, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'pending').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const historyOrders = orders.filter(o => o.status !== 'pending').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refreshOrders();
      setLastUpdated(new Date());
      setIsRefreshing(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar pb-32">
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
         </div>
      </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrders.map(order => (
                      <div key={order.id} className="bg-[#111] border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                          {/* Card Header */}
                          <div className="bg-amber-500/5 p-4 border-b border-amber-500/10 flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                   <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black">
                                       <User size={16} />
                                   </div>
                                   <span className="font-bold text-white">{order.customer_name || 'Cliente Nuevo'}</span>
                               </div>
                               <span className="text-[10px] bg-amber-500 text-black font-black px-2 py-0.5 rounded-full uppercase">Pendiente</span>
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
                              <Button 
                                className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded-2xl"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                icon={<CheckCircle2 size={18}/>}
                              >
                                  Confirmar Venta
                              </Button>
                              <Button 
                                variant="danger"
                                className="px-4 bg-red-900/10 border-red-900/20 text-red-500 rounded-2xl"
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                icon={<XCircle size={18}/>}
                              />
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* HISTORY SECTION */}
      <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Receipt size={14} /> Historial de Transacciones
          </h3>
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-[#111] text-[10px] uppercase font-bold text-gray-600">
                      <tr>
                          <th className="px-6 py-4">Ticket / Cliente</th>
                          <th className="px-6 py-4">Resumen Items</th>
                          <th className="px-6 py-4">Monto</th>
                          <th className="px-6 py-4">Estado</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                      {historyOrders.length === 0 ? (
                          <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-700 italic">No hay historial de ventas.</td></tr>
                      ) : (
                          historyOrders.map(order => (
                              <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="font-bold text-white">{order.customer_name}</div>
                                      <div className="text-[10px] text-gray-600 font-mono uppercase">{new Date(order.created_at).toLocaleDateString()}</div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-400">
                                      <div className="flex items-center gap-1">
                                          <Package size={12} /> {order.items.length} productos
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="font-bold text-green-500">${order.total_amount.toFixed(2)}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      {order.status === 'completed' ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-green-400 bg-green-900/10 px-2 py-1 rounded-full border border-green-500/20">
                                              <CheckCircle2 size={10} /> Éxito
                                          </span>
                                      ) : (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-400 bg-red-900/10 px-2 py-1 rounded-full border border-red-500/20">
                                              <XCircle size={10} /> Cancelado
                                          </span>
                                      )}
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
