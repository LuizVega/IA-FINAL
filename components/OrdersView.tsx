
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { CheckCircle2, XCircle, Clock, ShoppingBag, PackageMinus, PackageCheck, AlertTriangle, ArrowRight, RefreshCw, Wifi } from 'lucide-react';
import { Button } from './ui/Button';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, refreshOrders } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh mechanism
  useEffect(() => {
      // Fetch immediately on mount
      refreshOrders();
      
      // Poll every 5 seconds (Aggressive polling to ensure orders appear)
      const interval = setInterval(() => {
          handleRefresh();
      }, 5000);

      return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'pending').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const completedOrders = orders.filter(o => o.status === 'completed');

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refreshOrders();
      setLastUpdated(new Date());
      setIsRefreshing(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-green-500" /> Pedidos
            </h2>
            <p className="text-gray-500 text-sm">Gestiona las ventas entrantes desde tu catálogo público.</p>
         </div>
         <div className="flex items-center gap-3">
             <div className="text-[10px] text-gray-600 flex items-center gap-1.5 bg-[#111] px-3 py-1.5 rounded-full border border-white/5">
                 <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                 <span>Actualizado: {lastUpdated.toLocaleTimeString()}</span>
             </div>
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh} 
                className="text-gray-400 hover:text-white"
                icon={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
             >
                 Refrescar
             </Button>
         </div>
      </div>

      {pendingOrders.length > 0 && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-amber-500" /> Pendientes de Confirmación
                  <span className="bg-amber-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">{pendingOrders.length}</span>
              </h3>
              <div className="grid gap-4">
                  {pendingOrders.map(order => (
                      <div key={order.id} className="bg-[#111] border border-amber-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                          
                          <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded border border-amber-500/30 animate-pulse">NUEVO PEDIDO</span>
                                      <span className="text-gray-400 text-xs flex items-center gap-1">
                                          <Clock size={10} />
                                          hace {formatDistanceToNow(parseISO(order.created_at), { locale: es })}
                                      </span>
                                  </div>
                                  <h4 className="text-xl font-bold text-white mb-1">{order.customer_name || 'Cliente Web'}</h4>
                                  <div className="text-gray-400 text-sm mb-4 space-y-1 bg-black/30 p-3 rounded-xl border border-white/5">
                                      {order.items.map((item, idx) => (
                                          <div key={idx} className="flex gap-2 justify-between">
                                              <div className="flex gap-2">
                                                  <span className="text-white font-bold">{item.quantity}x</span> 
                                                  <span>{item.name}</span>
                                              </div>
                                              <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                                          </div>
                                      ))}
                                  </div>
                                  <div className="font-bold text-green-400 text-lg flex items-center gap-2">
                                      Total: ${order.total_amount.toFixed(2)}
                                  </div>
                              </div>

                              <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                                  <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 mb-2 text-xs text-gray-400 text-center flex flex-col gap-1">
                                      <span>¿Se concretó la venta?</span>
                                      <span className="text-amber-500 flex items-center justify-center gap-1 font-bold">
                                          <PackageMinus size={12}/> Confirmar para descontar stock
                                      </span>
                                  </div>
                                  <div className="flex gap-2">
                                      <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-500 text-black text-xs font-bold shadow-lg" 
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                        icon={<CheckCircle2 size={14}/>}
                                      >
                                          Confirmar
                                      </Button>
                                      <Button 
                                        className="flex-1 bg-red-900/20 text-red-400 hover:bg-red-900/30 border-none text-xs" 
                                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                        icon={<XCircle size={14}/>}
                                      >
                                          Rechazar
                                      </Button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div>
          <h3 className="text-lg font-bold text-white mb-4">Historial Reciente</h3>
          <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm text-left text-gray-400">
                  <thead className="bg-[#161616] text-xs uppercase font-bold text-gray-500">
                      <tr>
                          <th className="px-6 py-3">Cliente</th>
                          <th className="px-6 py-3">Items</th>
                          <th className="px-6 py-3">Total</th>
                          <th className="px-6 py-3">Estado</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                      {completedOrders.length === 0 && orders.filter(o => o.status === 'cancelled').length === 0 ? (
                          <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-600 flex flex-col items-center justify-center">
                              <ShoppingBag size={32} className="mb-2 opacity-20"/>
                              <p>No hay ventas registradas aún.</p>
                          </td></tr>
                      ) : (
                          orders.filter(o => o.status !== 'pending').map(order => (
                              <tr key={order.id} className="hover:bg-white/[0.02]">
                                  <td className="px-6 py-4 font-medium text-white">
                                      {order.customer_name}
                                      <div className="text-[10px] text-gray-600">{new Date(order.created_at).toLocaleDateString()}</div>
                                  </td>
                                  <td className="px-6 py-4">{order.items.length} productos</td>
                                  <td className="px-6 py-4 font-bold text-green-400">${order.total_amount.toFixed(2)}</td>
                                  <td className="px-6 py-4">
                                      {order.status === 'completed' ? (
                                          <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded text-xs border border-green-500/20 font-bold flex items-center gap-1 w-fit">
                                              <CheckCircle2 size={12}/> Completado
                                          </span>
                                      ) : (
                                          <span className="bg-red-900/20 text-red-400 px-2 py-1 rounded text-xs border border-red-500/20 font-bold flex items-center gap-1 w-fit">
                                              <XCircle size={12}/> Cancelado
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
