import React from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Grid, Folder, LayoutList, Zap, User, Plus } from 'lucide-react';
import { AppLogo } from '../AppLogo';
// @ts-ignore
import { MobileInventoryView } from './MobileInventoryView';
// @ts-ignore
import { MobileFoldersView } from './MobileFoldersView';
// @ts-ignore
import { MobileOrdersView } from './MobileOrdersView';
// @ts-ignore
import { MobileProfileView } from './MobileProfileView';
// @ts-ignore
import { MobilePassportView } from './MobilePassportView';
import { QRModal } from './QRModal';
import { ProductDetailsModal } from '../ProductDetailsModal';
import { AddProductModal } from '../AddProductModal';
import { EditFolderModal } from '../EditFolderModal';
import { AddFolderModal } from '../AddFolderModal';
import { InventoryImporter } from '../InventoryImporter';

export const MobileDashboard: React.FC = () => {
    const { t } = useTranslation();
    const {
        currentView,
        setCurrentView,
        isDetailsOpen,
        setIsDetailsOpen,
        selectedProduct,
        isAddProductModalOpen,
        setAddProductModalOpen,
        editingProduct,
        setEditingProduct
    } = useStore() as any;

    const [isEditFolderOpen, setIsEditFolderOpen] = React.useState(false);
    const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null);
    const [isAddFolderOpen, setIsAddFolderOpen] = React.useState(false);
    const [isImporterOpen, setIsImporterOpen] = React.useState(false);
    const [initialModalStep, setInitialModalStep] = React.useState<'upload' | 'confirm'>('confirm');



    const handleAddProduct = () => {
        setEditingProduct(null);
        setInitialModalStep('confirm');
        setAddProductModalOpen(true);
    };

    const handleEditFolder = (id: string) => {
        setEditingFolderId(id);
        setIsEditFolderOpen(true);
    };

    const renderView = () => {
        const view = currentView as string;
        switch (view) {
            case 'dashboard':
            case 'categories':
            case 'all-items':
            case 'items':
            default:
                return <MobileInventoryView />;
            case 'folders':
            case 'sales':
                return (
                    <MobileFoldersView
                        onEditFolder={handleEditFolder}
                        onAddFolder={() => setIsAddFolderOpen(true)}
                    />
                );
            case 'passport':
            case 'orders':
            case 'leads':
                return <MobilePassportView />;
            case 'profile':
                return <MobileProfileView />;

        }
    };

    return (
        <div className="bg-[#050505] text-slate-100 font-sans min-h-screen flex flex-col pb-6">

            {/* Apple-Style Top Navigation Header */}
            <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 pt-safe shrink-0">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                        <AppLogo className="w-8 h-8 opacity-90" />
                        <span className="font-bold text-lg tracking-tight">MyMorez</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsImporterOpen(true)}
                            className="flex items-center gap-1.5 px-3 h-8 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 rounded-full border border-amber-500/30 active:scale-90 transition-transform"
                        >
                            <Zap size={14} className="fill-amber-500/50" />
                            <span className="text-xs font-bold tracking-tight">Importar</span>
                        </button>
                        <button
                            onClick={() => setAddProductModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 h-8 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 active:scale-90 transition-transform"
                        >
                            <Plus size={16} />
                            <span className="text-xs font-bold tracking-tight">Manual</span>
                        </button>
                    </div>
                </div>

                {/* Horizontal Scrolling Nav */}
                <div className="flex overflow-x-auto hide-scrollbar px-4 pb-2 gap-4 items-center mt-2 border-t border-white/5 pt-3">
                    <button
                        onClick={() => setCurrentView('all-items' as any)}
                        className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full transition-colors text-sm font-medium ${['dashboard', 'all-items'].includes(currentView as string) ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Grid size={16} />
                        {t('nav.home') || 'Inventario'}
                    </button>

                    <button
                        onClick={() => setCurrentView('folders' as any)}
                        className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full transition-colors text-sm font-medium ${(currentView as string) === 'folders' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <LayoutList size={16} />
                        {t('nav.categories') || 'Categorías'}
                    </button>

                    <button
                        onClick={() => setCurrentView('passport' as any)}
                        className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full transition-colors text-sm font-medium ${['passport', 'orders', 'leads'].includes(currentView as string) ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Zap size={16} fill={['passport', 'orders', 'leads'].includes(currentView as string) ? 'currentColor' : 'none'} />
                        Pasaporte
                    </button>

                    <button
                        onClick={() => setCurrentView('profile' as any)}
                        className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full transition-colors text-sm font-medium ${(currentView as string) === 'profile' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <User size={16} />
                        Perfil
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto w-full px-2 mt-2">
                {renderView()}
            </div>

            {/* Global Modals for Mobile */}
            <ProductDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                product={selectedProduct}
                onEdit={(p) => {
                    setIsDetailsOpen(false);
                    setEditingProduct(p);
                    setAddProductModalOpen(true);
                }}
            />

            <AddProductModal
                isOpen={isAddProductModalOpen}
                onClose={() => setAddProductModalOpen(false)}
                editProduct={editingProduct}
                initialStep={initialModalStep}
            />

            <EditFolderModal
                isOpen={isEditFolderOpen}
                onClose={() => setIsEditFolderOpen(false)}
                folderId={editingFolderId}
            />

            <AddFolderModal
                isOpen={isAddFolderOpen}
                onClose={() => setIsAddFolderOpen(false)}
            />

            <InventoryImporter
                isOpen={isImporterOpen}
                onClose={() => setIsImporterOpen(false)}
            />

            <QRModal />
        </div>
    );
};
