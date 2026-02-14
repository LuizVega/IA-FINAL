
import React, { useState } from 'react';
import { useStore } from '../store';
import { DollarSign, Package, AlertTriangle, Clock, ShieldAlert, TrendingUp, Zap, Activity, BrainCircuit, ArrowUpRight, CheckCircle, Shirt, Tag, Sparkles, Store, Copy, ExternalLink, MessageCircle, AlertCircle, CheckCircle2, Pencil } from 'lucide-react';
import { differenceInDays, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/Button';
import { PromoBanner } from './PromoBanner';
import { ProductImage } from './ProductImage';

interface StatsDashboardProps {
    onActionClick?: (filterType: 'warranty' | 'stagnant') => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onActionClick }) => {
  const { inventory, setCurrentView, settings, session, setWhatsAppModalOpen, updateSettings } = useStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [tempSlug, setTempSlug] = useState('');

  // 1. Calculate General Stats
  const totalItems = inventory.length;
  const totalStock = inventory.reduce((acc, item) => acc + item.stock, 0);
  const totalValue = inventory.reduce((acc, item) => acc + (item.price * item.stock), 0);
  
  // Potential Profit (Simplified for creators: just Revenue vs Cost if available)
  const totalCost = inventory.reduce((acc, item) => acc + (item.cost * item.stock), 0);
  const potentialProfit = totalValue - totalCost;

  // 3. Stagnant (Items that haven't sold/moved in a while)
  const stagnantThreshold = settings.stagnantDaysThreshold || 90;
  const stagnantItems = inventory.filter(item => {
      if (item.stock === 0 || !item.entryDate) return false;
      try {
          const days = differenceInDays(new Date(), parseISO(item.entryDate));
          return days > stagnantThreshold;
      } catch { return false; }
  }).sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()).slice(0, 5);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // FORCE UUID FOR RELIABILITY
  // We use session.user.id to ensure the link points to the correct Supabase owner ID.
  // Local slugs are not synced to DB in this version, so they won't resolve for other users.
  const storeId = session?.user.id; 
  const storeUrl = session ? `${window.location.origin}?shop=${storeId}` : '';

  const handleCopyLink = () => {
      navigator.clipboard.writeText(storeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  };

  const startEditingSlug = () => {
      // Feature temporarily disabled to ensure link reliability
      // setTempSlug(settings.storeSlug || '');
      // setIsEditingSlug(true);
      alert("La personalización de enlace estará disponible próximamente. Por favor usa el enlace por defecto.");
  };

  const saveSlug = () => {
      if (!tempSlug.trim()) return;
      const sanitized = tempSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      updateSettings({ storeSlug: sanitized });
      setIsEditingSlug(false);
  };

  if (totalItems === 0) {
      return (
          <div className="p-8 flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95 duration-500">
              <PromoBanner />
              
              <div className="max-w-3xl w-full mx-auto flex flex-col items-center">
                  <div className="bg-green-900/10 p-8 rounded-full mb-6 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                      <Sparkles size={64} className="text-green-500 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Tu Colección Empieza Aquí</h2>
                  <p className="text-gray-400 max-w-lg mb-8 text-lg leading-relaxed">
                      Sube tu primer producto (camiseta, case, accesorio) y deja que la IA organice tu catálogo visualmente.
                  </p>
                  <div className="flex gap-4">
                      <Button onClick={() => setCurrentView('files')} className="bg-green-600 hover:bg-green-500 text-black px-8 py-4 text-lg">
                          Crear mi Primer Item
                      </Button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar space-y-8" id="tour-stats">
      
      {/* Promo Banner at top */}
      <PromoBanner />

      {/* STORE LINK CARD */}
      <div className="bg-[#111] border border-green-500/30 rounded-3xl p-6 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-green-500/10 transition-colors"></div>
          
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
              <div className="flex items-start gap-4 flex-1">
                  <div className="bg-green-500/20 p-4 rounded-2xl text-green-400 border border-green-500/20">
                      <Store size={32} />
                  </div>
                  <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                          Tu Tienda Pública 
                          <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded-full font-bold">ONLINE</span>
                      </h3>
                      <p className="text-sm text-gray-400 max-w-lg mb-3">
                          Comparte este enlace. Tus clientes verán tu stock y podrán enviarte pedidos directamente a WhatsApp.
                      </p>
                      
                      {!settings.whatsappEnabled && (
                          <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-500/20 max-w-fit mb-3">
                              <AlertCircle size={14} />
                              <span>Falta configurar tu número de WhatsApp para recibir pedidos.</span>
                              <button onClick={() => setWhatsAppModalOpen(true)} className="underline font-bold hover:text-amber-400">Configurar</button>
                          </div>
                      )}

                      {/* Link Display */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                          <div className="flex bg-black/50 border border-white/10 rounded-xl p-1 w-full flex-1 relative items-center">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={storeUrl} 
                                    className="bg-transparent text-gray-500 text-xs px-3 py-2 w-full outline-none truncate"
                                />
                                {/* Hidden edit button for now to force UUID usage */}
                                {/*
                                <button 
                                    onClick={startEditingSlug}
                                    className="absolute right-12 top-1 bottom-1 px-2 text-gray-500 hover:text-white transition-colors"
                                    title="Personalizar Link"
                                >
                                    <Pencil size={14} />
                                </button>
                                */}
                                <button 
                                    onClick={handleCopyLink}
                                    className="bg-[#222] hover:bg-[#333] text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center m-1"
                                    title="Copiar Link"
                                >
                                    {copiedLink ? <CheckCircle2 size={16} className="text-green-500"/> : <Copy size={16}/>}
                                </button>
                          </div>
                          <Button 
                              variant="secondary" 
                              onClick={() => window.open(storeUrl, '_blank')}
                              icon={<ExternalLink size={16}/>}
                          >
                              Visitar
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="flex items-center justify-between mb-2">
         <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
               <Tag className="text-green-500" /> Resumen de Inventario
            </h2>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { 
             label: 'Valor Total en Stock', 
             value: formatMoney(totalValue), 
             sub: `Ganancia Potencial: ${formatMoney(potentialProfit)}`, 
             icon: DollarSign, 
             color: 'text-green-400', 
             bg: 'from-green-500/10 to-transparent',
             action: () => setCurrentView('financial-health')
          },
          { 
             label: 'Productos Únicos', 
             value: totalItems, 
             sub: `${totalStock} unidades disponibles`, 
             icon: Shirt, 
             color: 'text-purple-400', 
             bg: 'from-purple-500/10 to-transparent',
             action: null
          },
          { 
             label: 'Items Estancados', 
             value: stagnantItems.length, 
             sub: stagnantItems.length > 0 ? 'Mover en ofertas' : 'Todo fluye bien', 
             icon: Zap, 
             color: 'text-amber-400', 
             bg: 'from-amber-500/10 to-transparent',
             action: () => onActionClick && onActionClick('stagnant')
          },
        ].map((kpi, idx) => (
           <div 
             key={idx}
             id={idx === 0 ? 'tour-financial-health-card' : undefined}
             onClick={kpi.action || undefined}
             className={`bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300 ${kpi.action ? 'cursor-pointer hover:bg-white/5 ring-0 focus:ring-2 focus:ring-green-500/50' : ''}`}
           >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bg} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{kpi.label}</p>
                    <kpi.icon size={20} className={`${kpi.color}`} />
                 </div>
                 <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{kpi.value}</h3>
                 <p className="text-xs text-gray-500 font-medium">{kpi.sub}</p>
              </div>
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
          <div 
             onClick={() => onActionClick && onActionClick('stagnant')}
             className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden flex flex-col h-full hover:border-orange-900/30 transition-colors cursor-pointer group"
          >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111]/50 group-hover:bg-[#1a1a1a] transition-colors">
                  <h3 className="font-bold text-white flex items-center gap-2">
                      <Clock size={18} className="text-orange-500" />
                      Items con Baja Rotación
                  </h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-500 group-hover:text-white transition-colors">Sugerencia: Crear Promoción</span>
                  </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto max-h-[300px] custom-scrollbar pointer-events-none">
                   {stagnantItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-700 text-sm py-10">
                          <Package size={32} className="mb-2 opacity-20" />
                          ¡Tu stock se mueve rápido!
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {stagnantItems.map(item => {
                              let timeText = 'Desconocido';
                              try {
                                  timeText = formatDistanceToNow(parseISO(item.entryDate), { locale: es, addSuffix: false });
                              } catch {}
                              
                              return (
                                  <div key={item.id} className="flex items-center gap-4 p-3 bg-black/40 rounded-2xl border border-white/5 group-hover:border-orange-500/20 transition-all">
                                      <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/5">
                                          <ProductImage src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-70" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-bold text-gray-200 truncate">{item.name}</h4>
                                          <p className="text-[10px] text-gray-500 flex items-center gap-1 font-mono text-uppercase uppercase">
                                              EN STOCK HACE {timeText.toUpperCase()}
                                          </p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-sm font-bold text-white">{item.stock} Unid.</p>
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
