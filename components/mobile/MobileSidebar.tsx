import React from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import {
    LayoutDashboard,
    Database,
    ShoppingBag,
    Settings,
    User,
    X,
    LogOut,
    Store
} from 'lucide-react';
import { AppLogo } from '../AppLogo';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
    const { currentView, setCurrentView, setCurrentFolder, checkAuth, session } = useStore();
    const { t } = useTranslation();

    if (!isOpen) return null;

    const navItems = [
        {
            icon: <LayoutDashboard size={20} />,
            label: t('nav.dashboard'),
            id: 'dashboard',
            action: () => {
                setCurrentView('dashboard');
                onClose();
            },
            active: currentView === 'dashboard'
        },
        {
            icon: <Database size={20} />,
            label: 'Inventario',
            id: 'files',
            action: () => {
                if (checkAuth()) {
                    setCurrentFolder(null);
                    setCurrentView('files');
                    onClose();
                }
            },
            active: currentView === 'files'
        },
        {
            icon: <ShoppingBag size={20} />,
            label: t('nav.orders'),
            id: 'orders',
            action: () => {
                setCurrentView('orders');
                onClose();
            },
            active: currentView === 'orders'
        },

        {
            icon: <Store size={20} />,
            label: 'Tienda',
            id: 'settings',
            action: () => {
                setCurrentView('settings');
                onClose();
            },
            active: currentView === 'settings'
        },
        {
            icon: <User size={20} />,
            label: t('nav.profile'),
            id: 'profile',
            action: () => {
                setCurrentView('profile');
                onClose();
            },
            active: currentView === 'profile'
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-[280px] h-full bg-[#050505] border-r border-white/10 shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <AppLogo className="w-8 h-8" />
                        <span className="text-white font-bold text-xl tracking-tight">MyMorez</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={item.action}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${item.active
                                ? 'bg-green-600/10 text-green-400 border border-green-600/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="pt-6 border-t border-white/5 mt-auto">
                    {session && (
                        <button
                            onClick={() => {
                                // Should use a logout function from store if available, 
                                // but for now we just show the exit intent by navigating to profile/settings
                                setCurrentView('profile');
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            <LogOut size={20} />
                            Cerrar Sesión
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
