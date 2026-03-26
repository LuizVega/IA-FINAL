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
import { MobileStatsView } from './MobileStatsView';
import { MobileSettingsView } from './MobileSettingsView';
import { PublicStorefront } from '../PublicStorefront';
import { CategoriesView } from '../CategoriesView';
import { QRModal } from './QRModal';
import { ProductDetailsModal } from '../ProductDetailsModal';
import { AddProductModal } from '../AddProductModal';
import { EditFolderModal } from '../EditFolderModal';
import { AddFolderModal } from '../AddFolderModal';
import { InventoryImporter } from '../InventoryImporter';
import { MobileSidebar } from './MobileSidebar';
import { ContextMenu } from '../ui/ContextMenu';
import { MoveModal } from '../MoveModal';
import { Menu } from 'lucide-react';

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
        setEditingProduct,
        currentFolderId,
        setCurrentFolder,
        deleteProduct,
        moveProduct,
        checkAuth
    } = useStore() as any;

    const [contextMenu, setContextMenu] = React.useState<any>({ isOpen: false, x: 0, y: 0, type: 'item' });
    const [isMoveModalOpen, setIsMoveModalOpen] = React.useState(false);
    const [moveTarget, setMoveTarget] = React.useState<any>(null);

    const [isEditFolderOpen, setIsEditFolderOpen] = React.useState(false);
    const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null);
    const [isAddFolderOpen, setIsAddFolderOpen] = React.useState(false);
    const [isImporterOpen, setIsImporterOpen] = React.useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
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
                return <MobileStatsView />;
            case 'settings':
                return <MobileSettingsView />;
            case 'categories':
                return <CategoriesView />;
            case 'all-items':
            case 'items':
            case 'files':
                return (
                    <MobileInventoryView 
                        onContextMenu={(e, type, id) => setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, type, targetId: id })}
                    />
                );
            case 'public-store':
                return (
                    <PublicStorefront
                        onBack={() => {
                            useStore.getState().exitBuyerMode();
                            setCurrentView('items' as any);
                        }}
                    />
                );
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
            default:
                return (
                    <MobileInventoryView 
                        onContextMenu={(e, type, id) => setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, type, targetId: id })}
                    />
                );
        }
    };

    return (
        <div className="bg-[#050505] text-slate-100 font-sans min-h-screen flex flex-col pb-6">
            <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Premium Web-Style Header */}
            <header className="sticky top-0 z-50 bg-[#050505] border-b border-white/5 pt-safe shrink-0">
                <div className="flex items-center justify-between px-5 py-4">
                    <div
                        className="flex items-center gap-3 active:scale-95 transition-transform"
                        onClick={() => setCurrentView('dashboard' as any)}
                    >
                        <AppLogo className="w-9 h-9 border border-green-500/20 shadow-lg shadow-green-500/5" />
                        <span className="font-bold text-xl tracking-tight text-white">MyMorez</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-all text-white"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>


            </header>

            <div className="flex-1 overflow-y-auto w-full mt-2">
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

            {contextMenu.isOpen && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    type={contextMenu.type} 
                    onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} 
                    onAction={(action) => {
                        const { targetId, type } = contextMenu;
                        setContextMenu({ ...contextMenu, isOpen: false });
                        if (action === 'edit') {
                            const product = (useStore.getState() as any).inventory.find((p: any) => p.id === targetId);
                            if (product) {
                                setEditingProduct(product);
                                setAddProductModalOpen(true);
                            }
                        }
                        if (action === 'delete') {
                            if (confirm('¿Eliminar este producto?')) {
                                deleteProduct(targetId);
                            }
                        }
                        if (action === 'move') {
                            setMoveTarget({ id: targetId, type });
                            setIsMoveModalOpen(true);
                        }
                    }} 
                />
            )}

            <MoveModal 
                isOpen={isMoveModalOpen} 
                onClose={() => setIsMoveModalOpen(false)} 
                itemId={moveTarget?.id} 
                itemType={moveTarget?.type || 'item'} 
            />

            <QRModal />
        </div>
    );
};
