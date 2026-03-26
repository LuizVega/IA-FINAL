import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store';
import { CheckCircle2, Loader2, ShoppingBag, User, DollarSign } from 'lucide-react';
import { Button } from './ui/Button';
import { getCurrencySymbol } from '../lib/utils';
import { supabase } from '../lib/supabase';

export const QuickConfirmView: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { confirmOrderExternal } = useStore();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pinEntry, setPinEntry] = useState('');
    const [isPinRequired, setIsPinRequired] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();
                
                if (error) throw error;
                setOrder(data);

                // Check if the profile has a pin set
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('seller_pin')
                    .eq('id', data.user_id)
                    .single();
                
                if (profile?.seller_pin && profile.seller_pin.trim() !== "") {
                    setIsPinRequired(true);
                }

                // Fetch currency from config product
                const { data: configProduct } = await supabase
                    .from('products')
                    .select('description')
                    .eq('user_id', data.user_id)
                    .eq('name', '__STORE_CONFIG__')
                    .single();
                
                if (configProduct?.description) {
                    try {
                        const cfg = JSON.parse(configProduct.description);
                        if (cfg.currency) {
                            setOrder((prev: any) => ({ ...prev, currency: cfg.currency }));
                        }
                    } catch (_) {}
                }
            } catch (err: any) {
                setError("Pedido no encontrado o enlace inválido.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleConfirm = async () => {
        if (!orderId) return;
        setConfirming(true);
        setError(null);
        try {
            await confirmOrderExternal(orderId, pinEntry);
            setSuccess(true);
        } catch (err: any) {
            if (err.message?.includes("PIN") || err.status === 401) {
                setError("El PIN ingresado es incorrecto.");
            } else {
                setError(err.message || "Error al confirmar la venta.");
            }
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="animate-spin text-green-500 mb-4" size={40} />
                <p className="text-gray-400">Cargando detalles del pedido...</p>
            </div>
        );
    }

    if (error && !success) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                    <ShoppingBag size={40} />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">¡Ups!</h1>
                <p className="text-gray-500 mb-8 max-w-xs">{error}</p>
                <Button onClick={() => window.location.href = '/'} className="bg-white text-black font-bold px-8 rounded-2xl">
                    Ir al Inicio
                </Button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-8 animate-in zoom-in duration-300">
                    <CheckCircle2 size={50} />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Venta Confirmada</h1>
                <p className="text-gray-400 mb-10">El stock ha sido actualizado correctamente y el pedido marcado como completado.</p>
                <div className="w-full max-w-xs p-6 bg-white/5 border border-white/10 rounded-3xl mb-10">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Registrado</p>
                    <p className="text-4xl font-black text-white">{getCurrencySymbol(order?.currency)} {order?.total_amount.toFixed(2)}</p>
                </div>
                <p className="text-gray-600 text-xs italic">Ya puedes cerrar esta pestaña.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center p-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-6">
                    <ShoppingBag size={32} />
                </div>
                
                <h1 className="text-2xl font-black mb-1 text-center">Confirmar Venta</h1>
                <p className="text-gray-500 text-sm mb-8 text-center">Verifica los datos antes de descontar stock.</p>

                <div className="w-full space-y-4 mb-8">
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400"><User size={20} /></div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Cliente</p>
                            <p className="font-bold">{order.customer_name || 'Desconocido'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400"><DollarSign size={20} /></div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Monto Total</p>
                            <p className="font-bold">{getCurrencySymbol(order?.currency)} {order.total_amount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-3 mb-4">
                    <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest px-2">Productos ({order.items?.length || 0})</h3>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {order.items?.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-white/5">
                                <span className="text-gray-400"><span className="text-green-500 font-black mr-2">{item.quantity}x</span> {item.name}</span>
                                <span className="font-bold">{getCurrencySymbol(order?.currency)} {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {isPinRequired && (
                    <div className="w-full mt-2 mb-4 animate-in slide-in-from-bottom-2 duration-300">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest px-2 mb-2">Ingresa tu PIN de Vendedor</p>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="----"
                            value={pinEntry}
                            onChange={(e) => {
                                setPinEntry(e.target.value.replace(/\D/g, ''));
                                if (error) setError(null);
                            }}
                            className={`w-full bg-black/40 border ${error?.includes('PIN') ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-4 text-2xl text-white font-mono tracking-[0.8em] text-center focus:outline-none focus:border-green-500/50 transition-all`}
                        />
                        {error && error.includes('PIN') && (
                            <p className="text-[10px] text-red-500 mt-2 px-2 text-center font-bold uppercase tracking-wider">{error}</p>
                        )}
                    </div>
                )}

                <Button 
                    onClick={handleConfirm}
                    disabled={confirming || (isPinRequired && !pinEntry)}
                    className="w-full py-6 rounded-2xl bg-green-600 hover:bg-green-500 text-black font-black text-lg shadow-xl shadow-green-600/20 active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:grayscale"
                >
                    {confirming ? <Loader2 className="animate-spin" /> : "REGISTRAR VENTA"}
                </Button>
                
                {(!error || !error.includes('PIN')) && error && (
                    <p className="text-[10px] text-red-500 mt-4 px-2 text-center font-bold uppercase tracking-wider">{error}</p>
                )}
                
                <p className="text-[10px] text-gray-600 mt-6 text-center uppercase font-bold tracking-widest">
                    Esta acción actualizará tu inventario de inmediato
                </p>
            </div>
        </div>
    );
};
