import React from 'react';
import { useStore } from '../store';
import { Home, FolderOpen, Box, Settings, ChevronRight, ListChecks } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { setCurrentFolder, currentFolderId, setCurrentView, currentView } = useStore();

  const navItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Inicio', 
      id: 'home', 
      action: () => setCurrentFolder(null), 
      active: currentView === 'files' 
    },
    { 
      icon: <Box size={20} />, 
      label: 'Todos los Items', 
      id: 'all', 
      action: () => setCurrentView('all-items'), 
      active: currentView === 'all-items' 
    },
    { 
      icon: <ListChecks size={20} />, 
      label: 'Categorías', 
      id: 'categories', 
      action: () => setCurrentView('categories'), 
      active: currentView === 'categories' 
    },
    { 
      icon: <Settings size={20} />, 
      label: 'Configuración', 
      id: 'settings', 
      action: () => setCurrentView('settings'), 
      active: currentView === 'settings' 
    },
  ];

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Box size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">AutoStock</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              item.active 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="pt-6 pb-2 px-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Carpetas Rápidas</p>
          <div className="space-y-1">
             <button onClick={() => setCurrentFolder(null)} className="w-full flex items-center justify-between text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm group">
               <span className="flex items-center gap-2">
                 <FolderOpen size={16} className="text-gray-400 group-hover:text-blue-500" />
                 Raíz
               </span>
               <ChevronRight size={14} className="text-gray-300" />
             </button>
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-100">
         <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-900">Plan Gratuito</p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 mb-1 overflow-hidden">
               <div className="bg-blue-500 h-full w-[35%] rounded-full"></div>
            </div>
            <p className="text-[10px] text-gray-500">35 items usados</p>
         </div>
      </div>
    </aside>
  );
};
