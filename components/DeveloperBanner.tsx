import React from 'react';
import { motion } from 'framer-motion';
import { Store, ArrowLeft, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export const DeveloperBanner: React.FC = () => {
  const { 
    isDeveloper, activeDeveloperUserId, activeDemoShopId, 
    managedShops, demoShops, settings, 
    switchDeveloperShop, switchDemoShop 
  } = useStore();
  const navigate = useNavigate();

  if (!isDeveloper) return null;

  const isViewingOwnShop = !activeDeveloperUserId && !activeDemoShopId;

  let shopName = 'Mi Catálogo Principal';
  if (activeDemoShopId) {
    const demoShop = demoShops.find(s => s.id === activeDemoShopId);
    shopName = demoShop?.name || 'Tienda Demo';
  } else if (activeDeveloperUserId) {
    const managed = managedShops.find(s => s.shop_user_id === activeDeveloperUserId);
    shopName = managed?.name || settings.companyName || 'Tienda Gestionada';
  }

  const handleBackToDev = () => navigate('/developer');

  const handleExitToOwn = () => {
    if (activeDemoShopId) switchDemoShop(null);
    else switchDeveloperShop(null);
  };

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-[60] w-full"
    >
      <div 
        className="bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 py-2 flex items-center justify-between"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Developer Mode</span>
          </div>

          {!isViewingOwnShop && (
            <div className="flex items-center gap-2 border-l border-white/10 pl-4 py-1 min-w-0">
              <Store size={12} className="text-white/20 flex-shrink-0" />
              <p className="text-[11px] font-medium text-white/60 truncate tracking-tight">
                Vista Activa: <span className="text-white font-bold">{shopName}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isViewingOwnShop && (
            <button
              onClick={handleExitToOwn}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-full text-[10px] font-bold text-white/40 hover:text-white transition-all active:scale-95"
            >
              <RefreshCw size={10} />
              Finalizar Gestión
            </button>
          )}
          <button
            onClick={handleBackToDev}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-500 hover:bg-blue-400 rounded-full text-[10px] font-black text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/10"
          >
            <ArrowLeft size={10} />
            Panel Control
          </button>
        </div>
      </div>
    </motion.div>
  );
};
