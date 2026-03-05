
import React from 'react';
import { useStore } from '../store';
import { LayoutDashboard, Database, Box, ListChecks, Settings, User, LogIn, ShoppingBag, Store } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { useTranslation } from '../hooks/useTranslation';

export const Sidebar: React.FC = () => {
  const { setCurrentFolder, currentFolderId, setCurrentView, currentView, inventory, session, setAuthModalOpen, checkAuth, orders, settings } = useStore();
  const { t } = useTranslation();

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
      label: t('nav.dashboard'),
      id: 'dashboard',
      navId: 'tour-nav-dashboard', // Added ID for Tour
      action: () => setCurrentView('dashboard'),
      active: currentView === 'dashboard'
    },
    {
      icon: <Store size={20} />,
      label: 'Inventario', // Renamed from Almacén as per unification
      id: 'home',
      navId: 'nav-files', // Added ID for Tour
      action: () => handleProtectedAction(() => setCurrentFolder(null)), // Protected
      active: currentView === 'files'
    },
    {
      icon: <ShoppingBag size={20} />,
      label: t('nav.orders'),
      id: 'orders',
      navId: 'tour-nav-orders',
      action: () => setCurrentView('orders'),
      active: currentView === 'orders',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    {
      icon: <Store size={20} />,
      label: t('nav.settings'),
      id: 'settings',
      action: () => setCurrentView('settings'),
      active: currentView === 'settings'
    },
  ];

  return (
    <aside className="w-20 lg:w-64 glass h-screen border-r border-white/5 flex flex-col fixed left-0 top-0 z-40 hidden md:flex shadow-2xl transition-all duration-300" id="tour-sidebar">
      <div className="md:hidden fixed bottom-0 left-0 w-full glass backdrop-blur-xl border-t border-white/10 z-40 pb-safe">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer flex-shrink-0">
            <div className="absolute inset-0 bg-green-500/20 blur-md rounded-full group-hover:bg-green-500/30 transition-all"></div>
            <AppLogo className="w-10 h-10 border border-green-500/30 shadow-lg" />
          </div>
        </div>
      </div>
      <div className="h-20 flex items-center px-6 border-b border-white/5 bg-[#050505]">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer flex-shrink-0">
            <div className="absolute inset-0 bg-green-500/20 blur-md rounded-full group-hover:bg-green-500/30 transition-all"></div>
            <AppLogo className="w-10 h-10 border border-green-500/30 shadow-lg" />
          </div>
          <div className="flex flex-col justify-center h-full overflow-hidden lg:flex transition-all lg:opacity-100 md:opacity-0 md:w-0 lg:w-auto">
            <span className="text-xl font-bold tracking-tight text-white leading-none whitespace-nowrap">MyMorez</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={item.navId}
            onClick={item.action}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${item.active
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
          <button
            onClick={() => setCurrentView('profile')}
            className="w-full bg-slate-900 border border-white/10 text-white font-bold py-3 rounded-xl hover:border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <User size={18} />
            <span className="hidden lg:inline">{t('nav.profile')}</span>
          </button>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            <span className="hidden lg:inline">{t('nav.login')}</span>
          </button>
        )}
      </div>
    </aside>
  );
};
