import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, ManagedShop } from '../store';
import { supabase } from '../lib/supabase';
import {
  Code2, Store, PlusCircle, ChevronRight, Trash2,
  Eye, RefreshCw, ArrowLeft, Loader2, ShieldCheck,
  Users, Package, BarChart2, Lock
} from 'lucide-react';

export const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { session, isDeveloper, managedShops, fetchManagedShops, switchDeveloperShop, activeDeveloperUserId } = useStore();
  const [slugInput, setSlugInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopStats, setShopStats] = useState<Record<string, { products: number; orders: number }>>({});

  useEffect(() => {
    if (isDeveloper) {
      fetchManagedShops();
    }
  }, [isDeveloper]);

  // Fetch stats for each managed shop
  useEffect(() => {
    if (!managedShops.length) return;
    const fetchStats = async () => {
      const statsMap: Record<string, { products: number; orders: number }> = {};
      await Promise.all(managedShops.map(async (shop) => {
        const [p, o] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', shop.shop_user_id),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', shop.shop_user_id),
        ]);
        statsMap[shop.shop_user_id] = { products: p.count || 0, orders: o.count || 0 };
      }));
      setShopStats(statsMap);
    };
    fetchStats();
  }, [managedShops]);

  const handleAddShop = async () => {
    setError(null);
    if (!slugInput.trim() || !nameInput.trim() || !session) return;
    setAddLoading(true);
    try {
      // Resolve slug to user_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, store_slug')
        .eq('store_slug', slugInput.trim().toLowerCase())
        .maybeSingle();

      const shopUserId = profile?.id;
      if (!shopUserId) {
        setError(`No se encontró ninguna tienda con el slug "${slugInput}".`);
        setAddLoading(false);
        return;
      }

      const { error: insertErr } = await supabase.from('managed_shops').insert({
        developer_id: session.user.id,
        shop_user_id: shopUserId,
        name: nameInput.trim(),
      });
      if (insertErr) throw insertErr;

      await fetchManagedShops();
      setSlugInput('');
      setNameInput('');
    } catch (err: any) {
      setError(err.message || 'Error al agregar tienda');
    }
    setAddLoading(false);
  };

  const handleRemoveShop = async (shopUserId: string) => {
    if (!session) return;
    await supabase.from('managed_shops')
      .delete()
      .eq('developer_id', session.user.id)
      .eq('shop_user_id', shopUserId);
    fetchManagedShops();
  };

  const handleSwitchAndGo = async (shopUserId: string) => {
    setLoading(true);
    await switchDeveloperShop(shopUserId);
    setLoading(false);
    navigate('/');
  };

  // Guard: not logged in or not a developer
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8">
          <Lock size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Acceso Denegado</h1>
          <p className="text-slate-400">Debes iniciar sesión para acceder a esta sección.</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-green-500 text-black font-black rounded-2xl">
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }
  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8">
          <Lock size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Sin Acceso</h1>
          <p className="text-slate-400 mb-1">Tu cuenta no tiene permisos de desarrollador.</p>
          <p className="text-slate-600 text-sm">Solo los programadores autorizados pueden acceder aquí.</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-slate-700 text-white font-black rounded-2xl">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Dev Header */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white transition-colors p-1"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-violet-500/20 border border-violet-500/30 rounded-2xl flex items-center justify-center">
                <Code2 size={20} className="text-violet-300" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white leading-none">Centro de Desarrollador</h1>
                <p className="text-[10px] text-violet-300/70 uppercase tracking-widest font-bold">MyMorez Dev Mode</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} className="text-green-400" />
            <span className="text-xs font-bold text-green-300">Verificado</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* My own shop button */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-white/60 uppercase tracking-widest">Tu Cuenta</h2>
            {activeDeveloperUserId && (
              <button
                onClick={() => switchDeveloperShop(null).then(() => navigate('/'))}
                className="text-xs text-violet-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={12} /> Volver a mis datos
              </button>
            )}
          </div>
          <button
            onClick={() => switchDeveloperShop(null).then(() => navigate('/'))}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${!activeDeveloperUserId
              ? 'bg-green-500/10 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
              : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
              }`}
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-green-500/20">
              <Code2 size={24} className="text-green-400" />
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-white">Cuenta Personal (Luis)</p>
              <p className="text-xs text-slate-500">{session.user.email}</p>
            </div>
            {!activeDeveloperUserId && (
              <span className="text-[10px] font-black bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full uppercase tracking-wider">
                Activa
              </span>
            )}
            <ChevronRight size={16} className="text-white/30" />
          </button>
        </div>

        {/* Managed Shops Grid */}
        <div>
          <h2 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">
            Tiendas Administradas ({managedShops.length})
          </h2>
          {managedShops.length === 0 ? (
            <div className="text-center py-12 text-slate-600 border border-dashed border-white/10 rounded-3xl">
              <Store size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Sin tiendas vinculadas.</p>
              <p className="text-xs">Añade la primera tienda de cliente usando el formulario de abajo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {managedShops.map((shop) => {
                const isActive = activeDeveloperUserId === shop.shop_user_id;
                const stats = shopStats[shop.shop_user_id];
                return (
                  <div
                    key={shop.shop_user_id}
                    className={`relative rounded-2xl border p-4 transition-all group ${isActive
                      ? 'bg-violet-500/10 border-violet-500/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                        <Store size={18} className="text-violet-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-black text-white truncate">{shop.name}</p>
                          {isActive && (
                            <span className="text-[9px] font-black bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                              Vista activa
                            </span>
                          )}
                        </div>
                        {stats && (
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Package size={10} /> {stats.products} productos
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <BarChart2 size={10} /> {stats.orders} órdenes
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleRemoveShop(shop.shop_user_id)}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Eliminar tienda"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => handleSwitchAndGo(shop.shop_user_id)}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                      >
                        {loading && isActive ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
                        Ver tienda
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add new shop form */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <PlusCircle size={18} className="text-green-400" />
            <h2 className="text-sm font-black text-white">Vincular Nueva Tienda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Slug de la Tienda
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="mi-tienda-ejemplo"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Nombre para Mostrar
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Tienda de Cliente ABC"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-xs mb-3 flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          )}
          <button
            onClick={handleAddShop}
            disabled={addLoading || !slugInput.trim() || !nameInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addLoading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
            Vincular Tienda
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-700 text-xs pb-8">
          Solo visible para cuentas autorizadas en la tabla <code className="bg-white/5 px-1 rounded">developers</code>
        </p>
      </div>
    </div>
  );
};
