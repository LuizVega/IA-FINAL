import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, DemoShop } from '../store';
import { supabase } from '../lib/supabase';
import {
  Code2, Store, Plus, Trash2, Eye, ArrowLeft,
  Loader2, ShieldCheck, Package, BarChart2, Lock,
  Sparkles, ChevronRight, Palette, Globe, X,
  ExternalLink, Smartphone, Settings, Layout
} from 'lucide-react';

const DEMO_SHOP_ITEM_LIMIT = 10;

export const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    session, isDeveloper, managedShops, demoShops,
    fetchManagedShops, fetchDemoShops, switchDeveloperShop,
    switchDemoShop, activeDeveloperUserId, activeDemoShopId, settings
  } = useStore();

  const [newShopName, setNewShopName] = useState('');
  const [newShopSlug, setNewShopSlug] = useState('');
  const [newShopColor, setNewShopColor] = useState('#32D74B');
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopStats, setShopStats] = useState<Record<string, { products: number; orders: number }>>({});
  const [ownShopInfo, setOwnShopInfo] = useState<{ company_name: string; store_slug: string; products: number; orders: number } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (isDeveloper) {
      fetchManagedShops();
      fetchDemoShops();
    }
  }, [isDeveloper]);

  useEffect(() => {
    if (!session) return;
    const fetchOwn = async () => {
      const { data: profile } = await supabase.from('profiles').select('company_name, store_slug').eq('id', session.user.id).maybeSingle();
      const [pCount, oCount] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id).is('demo_shop_id', null),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
      ]);
      if (profile) {
        setOwnShopInfo({
          company_name: profile.company_name || 'Mi Tienda',
          store_slug: profile.store_slug || '',
          products: pCount.count || 0,
          orders: oCount.count || 0,
        });
      }
    };
    fetchOwn();
  }, [session]);

  useEffect(() => {
    if (!demoShops.length || !session) return;
    const fetchStats = async () => {
      const map: Record<string, { products: number; orders: number }> = {};
      await Promise.all(demoShops.map(async (shop) => {
        const { count } = await supabase.from('products').select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id).eq('demo_shop_id', shop.id);
        map[shop.id] = { products: count || 0, orders: 0 };
      }));
      setShopStats(map);
    };
    fetchStats();
  }, [demoShops, session]);

  const autoSlug = (name: string) =>
    name.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 30);

  const handleCreateDemoShop = async () => {
    setError(null);
    if (!newShopName.trim() || !newShopSlug.trim() || !session) return;
    setCreateLoading(true);
    try {
      const slug = newShopSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      
      const { data: profileConflict } = await supabase.from('profiles').select('id').eq('store_slug', slug).maybeSingle();
      if (profileConflict) {
        setError(`El slug "${slug}" ya pertenece a un usuario real.`);
        setCreateLoading(false);
        return;
      }
      
      const { data: demoConflict } = await supabase.from('demo_shops').select('id').eq('slug', slug).maybeSingle();
      if (demoConflict) {
        setError(`Ya existe una tienda demo con el slug "${slug}".`);
        setCreateLoading(false);
        return;
      }

      const { error: insertErr } = await supabase.from('demo_shops').insert({
        developer_id: session.user.id,
        name: newShopName.trim(),
        slug,
        primary_color: newShopColor,
        settings: {
          companyName: newShopName.trim(),
          primaryColor: newShopColor,
          theme: 'dark'
        }
      });
      if (insertErr) throw insertErr;

      await fetchDemoShops();
      setNewShopName('');
      setNewShopSlug('');
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message || 'Error al crear la tienda demo');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteDemoShop = async (shopId: string) => {
    if (!session || !confirm('¿Estás seguro de eliminar esta tienda demo? Se borrarán todos sus productos.')) return;
    await supabase.from('demo_shops').delete().eq('id', shopId).eq('developer_id', session.user.id);
    fetchDemoShops();
  };

  const handleSwitchDemo = async (shopId: string) => {
    setLoading(true);
    await switchDemoShop(shopId);
    setLoading(false);
    navigate('/');
  };

  const handleSwitchManaged = async (shopUserId: string) => {
    setLoading(true);
    await switchDeveloperShop(shopUserId);
    setLoading(false);
    navigate('/');
  };

  if (!session || !isDeveloper) {
    return (
      <div className="min-h-screen bg-[#000] text-white flex items-center justify-center font-sans tracking-tight">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={28} className="text-white/20" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Acceso Restringido</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Este panel es exclusivo para desarrolladores autorizados del ecosistema MyMorez.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-white text-black py-4 rounded-full font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Volver al Inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 selection:text-white pb-32">
      {/* Aurora Effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[100vw] h-[60vh] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[50vh] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/60 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-white/[0.04] border border-white/[0.08] rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Developer Center</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-semibold">Dev Instance Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end">
                <p className="text-[11px] font-medium text-white/60 mb-0.5">{session.user.email}</p>
                <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Authorized Admin</p>
             </div>
             <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full border border-white/[0.08] flex items-center justify-center">
                <Smartphone size={16} className="text-blue-400/50" />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-12">
        
        {/* Own Shop Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <ShieldCheck size={14} className="text-white/20" />
            <h2 className="text-[12px] font-bold text-white/20 uppercase tracking-[0.15em]">Espacio Personal</h2>
          </div>
          
          <motion.div
            whileHover={{ y: -2 }}
            className={`group relative overflow-hidden rounded-[2rem] border transition-all cursor-pointer ${
              !activeDeveloperUserId && !activeDemoShopId 
                ? 'bg-white/[0.04] border-white/[0.15] shadow-2xl shadow-blue-500/10' 
                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
            }`}
            onClick={() => { switchDeveloperShop(null); navigate('/'); }}
          >
            <div className="p-8 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-[1.25rem] border border-blue-500/20 flex items-center justify-center shadow-inner">
                  <Layout size={28} className="text-blue-400/70" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-xl font-bold">{ownShopInfo?.company_name || 'Mi Espacio'}</h3>
                    {!activeDeveloperUserId && !activeDemoShopId && (
                      <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-tighter">LIVE</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-white/30 text-[12px]">
                       <Package size={12} />
                       <span>{ownShopInfo?.products || 0} items</span>
                    </div>
                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                    <div className="flex items-center gap-1.5 text-white/30 text-[12px]">
                       <BarChart2 size={12} />
                       <span>{ownShopInfo?.orders || 0} pedidos</span>
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-white/10 group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </div>
            
            {!activeDeveloperUserId && !activeDemoShopId && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full" />
            )}
          </motion.div>
        </section>

        {/* Demo Shops Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400/40" />
              <h2 className="text-[12px] font-bold text-white/20 uppercase tracking-[0.15em]">Entornos Demo ({demoShops.length})</h2>
            </div>
            <button
              onClick={() => { setShowCreateForm(!showCreateForm); setError(null); }}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/5"
            >
              <Plus size={14} />
              Entorno Nuevo
            </button>
          </div>

          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="overflow-hidden mb-8"
              >
                <div className="p-8 rounded-[2rem] border border-white/[0.08] bg-white/[0.03] space-y-6 relative overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-1">Nombre Comercial</label>
                      <input
                        type="text"
                        value={newShopName}
                        onChange={(e) => { setNewShopName(e.target.value); setNewShopSlug(autoSlug(e.target.value)); }}
                        placeholder="Ej: Urban Style Demo"
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 text-sm focus:border-blue-500/40 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-1">URL / Slug</label>
                       <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4">
                         <span className="text-white/20 mr-1 text-sm font-medium">/</span>
                         <input
                           type="text"
                           value={newShopSlug}
                           onChange={(e) => setNewShopSlug(autoSlug(e.target.value))}
                           placeholder="urban-style"
                           className="bg-transparent text-sm w-full outline-none font-medium text-blue-300/80"
                         />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-1">Brand Palette</label>
                    <div className="flex flex-wrap gap-3">
                      {['#32D74B', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#06b6d4', '#ffffff'].map(c => (
                        <button
                          key={c}
                          onClick={() => setNewShopColor(c)}
                          className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${newShopColor === c ? 'ring-2 ring-white ring-offset-4 ring-offset-[#050505] scale-110 shadow-lg' : 'hover:scale-[1.1] opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: c }}
                        >
                          {newShopColor === c && <div className="w-2 h-2 rounded-full bg-black/20" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-medium flex items-center gap-2">
                       <Lock size={12} /> {error}
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 py-4 text-sm font-bold text-white/40 hover:text-white transition-colors"
                    >Cancelar</button>
                    <button
                      disabled={createLoading || !newShopName.trim() || !newShopSlug.trim()}
                      onClick={handleCreateDemoShop}
                      className="flex-[2] bg-blue-500 hover:bg-blue-400 disabled:opacity-30 disabled:hover:scale-100 text-white font-bold text-sm py-4 rounded-full flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-500/10"
                    >
                      {createLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      Iniciar Entorno Demo
                    </button>
                  </div>
                  
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {demoShops.length === 0 && !showCreateForm ? (
            <div className="py-20 text-center rounded-[2rem] border border-dashed border-white/[0.08] bg-white/[0.01]">
               <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Store size={24} className="text-white/10" />
               </div>
               <p className="text-white/20 font-medium text-sm">Sin entornos demo creados</p>
               <p className="text-white/10 text-xs mt-1">Crea uno para mostrar el potencial de la plataforma</p>
            </div>
          ) : (
            <div className="space-y-4">
              {demoShops.map((shop, idx) => {
                const isActive = activeDemoShopId === shop.id;
                const stats = shopStats[shop.id];
                return (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative overflow-hidden rounded-[1.75rem] border transition-all ${
                      isActive ? 'bg-white/[0.05] border-white/20' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-5 min-w-0">
                           <div 
                              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0"
                              style={{ backgroundColor: `${shop.primary_color}10`, border: `1px solid ${shop.primary_color}25` }}
                           >
                              <Store size={22} style={{ color: shop.primary_color }} />
                           </div>
                           <div className="min-w-0">
                              <h3 className="font-bold text-lg truncate group-hover:text-blue-300 transition-colors">{shop.name}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className="text-xs font-medium text-white/30 truncate">mymorez.com/{shop.slug}</span>
                                 {isActive && <span className="text-[7px] font-black bg-white/10 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Current</span>}
                              </div>
                           </div>
                        </div>
                        <div className="flex -space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.08]" />
                           ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/[0.04] pt-5">
                         <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Items</span>
                               <span className="text-[13px] font-bold text-white/80">{stats?.products || 0}<span className="text-white/20 text-[10px] font-medium inline-block ml-1">/ {DEMO_SHOP_ITEM_LIMIT}</span></span>
                            </div>
                            <div className="w-px h-6 bg-white/[0.04]" />
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Color</span>
                               <div className="flex items-center gap-1.5">
                                 <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: shop.primary_color }} />
                                 <span className="text-[11px] font-mono text-white/30">{shop.primary_color.toUpperCase()}</span>
                               </div>
                            </div>
                         </div>

                         <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDeleteDemoShop(shop.id)}
                              className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                            >
                               <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleSwitchDemo(shop.id)}
                              className="px-6 py-3 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                            >
                               Administrar
                            </button>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Managed Shops Section */}
        {managedShops.length > 0 && (
          <section>
             <div className="flex items-center gap-2 mb-6 px-1">
              <Globe size={14} className="text-white/20" />
              <h2 className="text-[12px] font-bold text-white/20 uppercase tracking-[0.15em]">Suscripciones Vinculadas ({managedShops.length})</h2>
            </div>
            <div className="space-y-3">
              {managedShops.map((shop) => {
                const isActive = activeDeveloperUserId === shop.shop_user_id;
                return (
                  <div 
                    key={shop.shop_user_id}
                    className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                      isActive ? 'bg-white/[0.04] border-white/10' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                       <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Store size={18} className="text-white/20" />
                       </div>
                       <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">{shop.name}</h4>
                          <p className="text-[10px] text-white/20 font-medium">External Managed Shop</p>
                       </div>
                    </div>
                    <button
                      onClick={() => handleSwitchManaged(shop.shop_user_id)}
                      className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      {isActive ? 'Current' : 'Gestionar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* Floating Status Bar */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/[0.1] rounded-full px-8 py-4 shadow-2xl flex items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                 <Code2 size={14} className="text-blue-400" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-white/40 uppercase">Mode: Root</span>
           </div>
           <div className="w-px h-6 bg-white/10" />
           <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-white/20 uppercase tracking-[0.1em]">Total instances: {demoShops.length + 1}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
