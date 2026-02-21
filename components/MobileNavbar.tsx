import React from 'react';
import { LayoutDashboard, Database, ListChecks, User, Plus, Scan, Store } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';

export const MobileNavbar: React.FC = () => {
  const { currentView, setCurrentView, setAddProductModalOpen, setEditingProduct, checkAuth, setCurrentFolder, isDemoMode } = useStore();
  const { t } = useTranslation();

  const handleAddClick = () => {
    if (checkAuth()) {
      setEditingProduct(null);
      setAddProductModalOpen(true);
    }
  };

  const navItems = isDemoMode ? [
    {
      id: 'dashboard',
      icon: <LayoutDashboard size={20} />,
      label: t('nav.home'),
      action: () => setCurrentView('dashboard')
    },
    {
      id: 'add',
      icon: <Plus size={24} />,
      label: t('nav.scan'),
      isAction: true,
      action: handleAddClick
    },
    {
      id: 'public-store',
      icon: <Store size={20} />,
      label: t('nav.publicStore'),
      action: () => setCurrentView('public-store')
    }
  ] : [
    {
      id: 'dashboard',
      icon: <LayoutDashboard size={20} />,
      label: t('nav.home'),
      action: () => setCurrentView('dashboard')
    },
    {
      id: 'files',
      icon: <Database size={20} />,
      label: t('nav.files'),
      action: () => {
        if (checkAuth()) {
          setCurrentFolder(null); // Reset to root
          setCurrentView('files');
        }
      }
    },
    // Center Button (Action)
    {
      id: 'add',
      icon: <Plus size={24} />,
      label: t('nav.scan'),
      isAction: true,
      action: handleAddClick
    },
    {
      id: 'categories',
      icon: <ListChecks size={20} />,
      label: t('nav.categories'),
      action: () => setCurrentView('categories')
    },
    {
      id: 'profile',
      icon: <User size={20} />,
      label: t('nav.profile'),
      action: () => setCurrentView('profile')
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 z-40 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex flex-col items-center justify-center -mt-8"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-green-600 to-green-400 text-black shadow-lg shadow-green-500/30 flex items-center justify-center transform active:scale-90 transition-all border-4 border-[#0a0a0a]">
                  <Scan size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-gray-400 mt-1">{item.label}</span>
              </button>
            );
          }

          const isActive = currentView === item.id || (item.id === 'files' && currentView === 'files');

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              <div className={`${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for newer iPhones */}
      <div className="h-4 w-full"></div>
    </div>
  );
};
