
import React from 'react';
import { useStore } from '../store';
import { LayoutDashboard, Database, Box, ListChecks, Settings, User, LogIn, ShoppingBag, Store } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { FREE_PLAN_LIMIT } from '../constants';

export const Sidebar: React.FC = () => {
  const { setCurrentFolder, currentFolderId, setCurrentView, currentView, inventory, session, setAuthModalOpen, checkAuth, orders } = useStore();

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // Helper to wrap protected actions
  const handleProtectedAction = (action: () => void) => {
    if (checkAuth()) {
      action();
    }
  };

  const navItems = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: 'Dashboard', 
      id: 'dashboard', 
      navId: 'tour-nav-dashboard', // Added ID for Tour
      action: () => setCurrentView('dashboard'), 
      active: currentView === 'dashboard' 
    },
    { 
      icon: <Store size={20} />, 
      label: 'Almacén', 
      id: 'home', 
      navId: 'nav-files', // Added ID for Tour
      action: () => handleProtectedAction(() => setCurrentFolder(null)), // Protected
      active: currentView === 'files' 
    },
    { 
      icon: <ShoppingBag size={20} />, 
      label: 'Pedidos', 
      id: 'orders', 
      action: () => setCurrentView('orders'), 
      active: currentView === 'orders',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    { 
      icon: <Box size={20} />, 
      label: 'Inventario Global', 
      id: 'all', 
      action: () => setCurrentView('all-items'), 
      active: currentView === 'all-items' 
    },
    { 
      icon: <Settings size={20} />, 
      label: 'Configuración', 
      id: 'settings', 
      action: () => setCurrentView('settings'), 
      active: currentView === 'settings' 
    },
    { 
      icon: <User size={20} />, 
      label: 'Perfil', 
      id: 'profile', 
      action: () => setCurrentView('profile'), 
      active: currentView === 'profile' 
    },
  ];

  // Logic for Storage Bar
  const PLAN_LIMIT = FREE_PLAN_LIMIT; 
  const currentItems = inventory.length;
  const usagePercentage = Math.min((currentItems / PLAN_LIMIT) * 100, 100);
  const isFull = currentItems >= PLAN_LIMIT;

  return (
    <aside className="w-64 bg-[#0a0a0a] h-screen border-r border-white/5 flex flex-col fixed left-0 top-0 z-40 hidden md:flex shadow-2xl" id="tour-sidebar">
      <div className="h-20 flex items-center px-6 border-b border-white/5 bg-[#050505]">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
             <div className="absolute inset-0 bg-green-500/20 blur-md rounded-full group-hover:bg-green-500/30 transition-all"></div>
             <AppLogo className="w-10 h-10 border border-green-500/30 shadow-lg" />
          </div>
          <div className="flex flex-col justify-center h-full">
             <span className="text-xl font-bold tracking-tight text-white leading-none">MyMorez</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={item.navId}
            onClick={item.action}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
              item.active 
                ? 'bg-green-600/10 text-green-400 border border-green-600/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                : 'text-gray-500 hover:bg-[#111] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
                <div className={`transition-transform duration-200 ${item.active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
                </div>
                {item.label}
            </div>
            {item.badge && (
                <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                </span>
            )}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/5 bg-[#050505]">
         {session ? (
             <div 
               onClick={() => setCurrentView('pricing')}
               className="bg-gradient-to-br from-[#111] to-black rounded-xl p-4 border border-white/10 relative overflow-hidden group cursor-pointer hover:border-green-500/30 transition-all"
             >
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-green-500/20 transition-colors"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Actual</p>
                <p className="text-sm font-bold text-white mb-2">Starter (Gratis)</p>
                <div className="w-full h-1.5 bg-gray-800 rounded-full mb-2 overflow-hidden">
                   <div 
                     className={`h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-green-500'}`}
                     style={{ width: `${usagePercentage}%` }}
                   ></div>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-600">Almacenamiento</p>
                    <p className={`text-[10px] font-mono ${isFull ? 'text-red-500' : 'text-green-500'}`}>
                        {currentItems}/{PLAN_LIMIT}
                    </p>
                </div>
             </div>
         ) : (
             <button 
                onClick={() => setAuthModalOpen(true)}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
             >
                 <LogIn size={18} />
                 Iniciar Sesión
             </button>
         )}
      </div>
    </aside>
  );
};
