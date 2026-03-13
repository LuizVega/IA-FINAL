import React from 'react';
import { Code2, ChevronDown, Store, X, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

/**
 * DeveloperBanner - Only shown when Luis (or another developer) is logged in.
 * Shows the current active shop name and a button to go back to own data.
 */
export const DeveloperBanner: React.FC = () => {
  const { isDeveloper, activeDeveloperUserId, managedShops, settings, switchDeveloperShop } = useStore();
  const navigate = useNavigate();

  if (!isDeveloper) return null;

  const isViewingOwnShop = !activeDeveloperUserId;
  const activeShop = managedShops.find(s => s.shop_user_id === activeDeveloperUserId);
  const shopName = isViewingOwnShop ? 'Tu cuenta (Dev)' : (activeShop?.name || settings.companyName || 'Tienda Cliente');

  return (
    <div className="relative z-50 w-full">
      {/* Animated gradient banner */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-800 to-indigo-900 border-b border-white/10 px-3 py-1.5 flex items-center justify-between gap-2">
        {/* Left side: mode indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            <Code2 size={12} className="text-violet-300" />
            <span className="text-[10px] font-black text-violet-200 uppercase tracking-widest">MODO DEV</span>
          </div>

          {/* Active shop indicator */}
          <div className="flex items-center gap-1.5 text-white">
            <Store size={12} className="text-violet-300" />
            <span className="text-xs font-bold text-white/90">
              {shopName}
            </span>
          </div>
        </div>

        {/* Right side: actions */}
        <div className="flex items-center gap-2">
          {!isViewingOwnShop && (
            <button
              onClick={() => switchDeveloperShop(null)}
              className="flex items-center gap-1 text-[10px] font-bold text-violet-200 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full transition-all"
            >
              <X size={10} />
              Salir
            </button>
          )}
          <button
            onClick={() => navigate('/developer')}
            className="flex items-center gap-1 text-[10px] font-bold text-violet-200 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full transition-all"
          >
            <ExternalLink size={10} />
            Centro Dev
          </button>
        </div>
      </div>
    </div>
  );
};
