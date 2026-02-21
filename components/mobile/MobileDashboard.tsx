import React from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Grid, Folder, QrCode, LayoutList, Store } from 'lucide-react';
// @ts-ignore
import { MobileInventoryView } from './MobileInventoryView';
// @ts-ignore
import { MobileFoldersView } from './MobileFoldersView';
// @ts-ignore
import { MobileOrdersView } from './MobileOrdersView';
// @ts-ignore
import { MobileStatsView } from './MobileStatsView';
// @ts-ignore
import { MobileProfileView } from './MobileProfileView';
// @ts-ignore
import { MobileFinancialReportView } from './MobileFinancialReportView';
import { ProductDetailsModal } from '../ProductDetailsModal';
import { AddProductModal } from '../AddProductModal';
import { EditFolderModal } from '../EditFolderModal';
import { AddFolderModal } from '../AddFolderModal';
import { PricingView } from '../PricingView';

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
    const [initialModalStep, setInitialModalStep] = React.useState<'upload' | 'confirm'>('confirm');

    const handleOpenScanner = () => {
        setEditingProduct(null);
        setInitialModalStep('upload');
        setAddProductModalOpen(true);
    };

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
            case 'financial-health':
            case 'financials':
                return <MobileFinancialReportView />;
            case 'stats':
            case 'dashboard': // Map default dashboard to StatsView for mobile
                return <MobileStatsView />;
            case 'folders':
            case 'sales':
                return (
                    <MobileFoldersView
                        onEditFolder={handleEditFolder}
                        onAddFolder={() => setIsAddFolderOpen(true)}
                    />
                );
            case 'orders':
                return <MobileOrdersView />;
            case 'profile':
                return <MobileProfileView />;
            case 'pricing':
                return <PricingView />;
            case 'categories':
            case 'all-items':
            case 'items':
            default:
                return <MobileInventoryView />;
        }
    };

    return (
        <div className="bg-[#000000] text-slate-100 font-sans min-h-screen flex flex-col pb-24">

            <div className="flex-1 overflow-y-auto w-full">
                {renderView()}
            </div>

            {/* Bottom Navigation Navbar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-[#2C2C2E] px-2 pb-6 pt-2 pb-safe">
                <div className="max-w-md mx-auto flex justify-between items-end relative">
                    <button
                        onClick={() => setCurrentView('dashboard' as any)}
                        className={`flex-1 flex flex-col items-center gap-1 transition-colors ${(currentView as string) === 'dashboard' ? 'text-[#32D74B]' : 'text-gray-500 hover:text-[#32D74B]'}`}
                    >
                        <Grid size={24} />
                        <span className="text-[10px] font-medium">{t('nav.home') || 'Inicio'}</span>
                    </button>

                    <button
                        onClick={() => setCurrentView('all-items' as any)}
                        className={`flex-1 flex flex-col items-center gap-1 transition-colors ${(currentView as string) === 'all-items' ? 'text-[#32D74B]' : 'text-gray-500 hover:text-[#32D74B]'}`}
                    >
                        <Folder size={24} />
                        <span className="text-[10px] font-bold">{t('dashboard.inventory') || 'Inventario'}</span>
                    </button>

                    <div className="flex-1 -mt-8 flex flex-col items-center">
                        <button
                            onClick={handleOpenScanner}
                            className="w-14 h-14 bg-[#32D74B] text-black rounded-full shadow-[0_0_20px_rgba(50,215,75,0.3)] flex items-center justify-center border-4 border-black active:scale-90 transition-transform"
                        >
                            <QrCode size={30} />
                        </button>
                        <span className="text-[10px] font-bold mt-1 text-gray-500 uppercase tracking-tighter">{t('nav.scan') || 'Scan'}</span>
                    </div>

                    <button
                        onClick={() => setCurrentView('folders' as any)}
                        className={`flex-1 flex flex-col items-center gap-1 transition-colors ${(currentView as string) === 'folders' ? 'text-[#32D74B]' : 'text-gray-500 hover:text-[#32D74B]'}`}
                    >
                        <LayoutList size={24} />
                        <span className="text-[10px] font-medium">{t('nav.categories') || 'Categorías'}</span>
                    </button>

                    <button
                        onClick={() => setCurrentView('orders' as any)}
                        className={`flex-1 flex flex-col items-center gap-1 transition-colors ${(currentView as string) === 'orders' ? 'text-[#32D74B]' : 'text-gray-500 hover:text-[#32D74B]'}`}
                    >
                        <Store size={24} />
                        <span className="text-[10px] font-medium">{t('nav.orders') || 'Pedidos'}</span>
                    </button>
                </div>
            </nav>

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
        </div>
    );
};
