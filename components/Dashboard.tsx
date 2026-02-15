import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Search, List as ListIcon, Plus, Minus, Folder as FolderIcon, ChevronRight, ArrowLeft, Move, Upload, Package, ShieldAlert, Clock, Home, FolderPlus, FilePlus, Filter, Zap, MoreVertical, Scan, FileSpreadsheet, X, Sparkles, ImagePlus, Lock, Store, GripVertical, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { AddProductModal } from './AddProductModal';
import { AddFolderModal } from './AddFolderModal';
import { EditFolderModal } from './EditFolderModal';
import { ProductDetailsModal } from './ProductDetailsModal';
import { MoveModal } from './MoveModal';
import { ContextMenu } from './ui/ContextMenu';
import { SettingsView } from './SettingsView';
import { AllItemsView } from './AllItemsView';
import { CategoriesView } from './CategoriesView';
import { StatsDashboard } from './StatsDashboard';
import { SearchFilters } from './SearchFilters';
import { InventoryImporter } from './InventoryImporter';
import { ProfileView } from './ProfileView';
import { PricingView } from './PricingView';
import { FinancialHealthView } from './FinancialHealthView';
import { OrdersView } from './OrdersView';
import { TourGuide } from './TourGuide';
import { ProductImage } from './ProductImage';
import { Product, ContextMenuState, Folder } from '../types';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import { WhatsAppModal } from './WhatsAppModal';

interface DashboardProps {
    isDemo?: boolean;
    onExitDemo?: () => void;
}

const ViewWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-full pb-20 md:pb-0 overflow-y-auto no-scrollbar pt-safe">{children}</div>
);

export const Dashboard: React.FC<DashboardProps> = ({ isDemo, onExitDemo }) => {
  const { 
    inventory, folders, currentFolderId, searchQuery, viewMode, currentView,
    deleteProduct, deleteFolder, setSearchQuery, setCurrentFolder, getBreadcrumbs,
    getFilteredInventory, incrementStock, decrementStock, setCurrentView, checkAuth, settings,
    isAddProductModalOpen, setAddProductModalOpen, isImporterOpen, setIsImporterOpen,
    isDetailsOpen, setIsDetailsOpen, isCreateMenuOpen, setCreateMenuOpen, 
    editingProduct, setEditingProduct, selectedProduct, setSelectedProduct, setTourStep,
    isWhatsAppModalOpen, setWhatsAppModalOpen, pendingAction, setPendingAction,
    moveProduct
  } = useStore();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState<{id: string, type: 'folder' | 'item'} | null>(null);
  const [runTour, setRunTour] = useState(false);
  
  // Drag & Drop State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  useEffect(() => { if (isDemo) setRunTour(true); }, [isDemo]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ isOpen: false, x: 0, y: 0, type: 'background' });

  const withAuth = (action: () => void) => { if (checkAuth()) action(); };
  
  const filteredInventory = getFilteredInventory();

  // Split folders into types
  const salesFolders = useMemo(() => {
    if (searchQuery || pendingAction) return [];
    return folders.filter(f => f.parentId === currentFolderId && !f.isInternal);
  }, [folders, currentFolderId, searchQuery, pendingAction]);

  const internalFolders = useMemo(() => {
    if (searchQuery || pendingAction) return [];
    return folders.filter(f => f.parentId === currentFolderId && f.isInternal);
  }, [folders, currentFolderId, searchQuery, pendingAction]);

  const currentItems = useMemo(() => {
    let items = filteredInventory.filter(i => i.folderId === currentFolderId || searchQuery);
    if (pendingAction === 'warranty') {
        items = inventory.filter(item => item.supplierWarranty ? differenceInDays(parseISO(item.supplierWarranty), new Date()) < 60 : false);
    } else if (pendingAction === 'stagnant') {
        const threshold = settings.stagnantDaysThreshold || 90;
        items = inventory.filter(item => {
            if (!item.entryDate || item.stock === 0) return false;
            try { return differenceInDays(new Date(), parseISO(item.entryDate)) > threshold; } catch { return false; }
        });
    }
    return items;
  }, [filteredInventory, currentFolderId, searchQuery, pendingAction, inventory, settings.stagnantDaysThreshold]);

  const breadcrumbs = getBreadcrumbs();

  const handleContextMenu = (e: React.MouseEvent, type: 'background' | 'folder' | 'item', id?: string) => {
    e.preventDefault(); e.stopPropagation();
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, type, targetId: id });
  };

  const handleContextMenuAction = (action: string) => {
    const { targetId, type } = contextMenu;
    setContextMenu({ ...contextMenu, isOpen: false });
    if (!checkAuth()) return;
    if (action === 'new-folder') setIsFolderModalOpen(true);
    if (action === 'new-item') { setEditingProduct(null); setAddProductModalOpen(true); }
    if (action === 'move' && targetId) { setMoveTarget({ id: targetId, type: type as 'folder' | 'item' }); setIsMoveModalOpen(true); }
    if (type === 'folder' && targetId) {
      if (action === 'delete') { if (confirm('¿Eliminar esta sección y su configuración?')) deleteFolder(targetId); }
      if (action === 'edit') { setEditingFolderId(targetId); setIsEditFolderOpen(true); }
    }
    if (type === 'item' && targetId) {
      if (action === 'delete') deleteProduct(targetId);
      if (action === 'edit') {
        const product = inventory.find(p => p.id === targetId);
        if (product) { setEditingProduct(product); setAddProductModalOpen(true); }
      }
    }
  };

  // --- DRAG & DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
      e.dataTransfer.setData('text/plain', itemId);
      e.dataTransfer.effectAllowed = 'move';
      setDraggedItemId(itemId);
  };

  const handleDragOverFolder = (e: React.DragEvent, folderId: string) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
      setDragOverFolderId(folderId);
  };

  const handleDragLeaveFolder = (e: React.DragEvent) => {
      setDragOverFolderId(null);
  };

  const handleDropOnFolder = (e: React.DragEvent, folderId: string) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      
      if (itemId && itemId !== folderId) { // Prevent weird self-drops logic
          moveProduct(itemId, folderId);
      }
      setDragOverFolderId(null);
      setDraggedItemId(null);
  };

  const handleItemClick = (product: Product) => { setSelectedProduct(product); setIsDetailsOpen(true); };

  // Reusable Folder Card Component
  // REMOVED: 3 dots button
  const FolderCard: React.FC<{ folder: Folder }> = ({ folder }) => (
    <div 
        onClick={() => setCurrentFolder(folder.id)} 
        onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
        onDragOver={(e) => handleDragOverFolder(e, folder.id)}
        onDragLeave={handleDragLeaveFolder}
        onDrop={(e) => handleDropOnFolder(e, folder.id)}
        className={`
            group relative bg-[#111] md:bg-[#111]/80 md:backdrop-blur-md p-4 rounded-3xl border transition-all cursor-pointer flex flex-col gap-3 active:scale-95 shadow-sm 
            md:hover:scale-105 md:hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]
            ${dragOverFolderId === folder.id ? 'border-green-400 bg-green-500/10 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''}
            ${folder.isInternal ? 'border-blue-900/30 md:hover:border-blue-500/50' : 'border-white/5 md:hover:border-green-500/50'}
        `}
    >
      <div className="flex justify-between items-start pointer-events-none">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${folder.color ? folder.color : (folder.isInternal ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500')}`}>
             {folder.isInternal ? <Lock size={24} /> : <Store size={24} />}
          </div>
          {/* Removed 3-dots button. User must right click. */}
      </div>
      <div className="pointer-events-none">
          <h3 className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">{folder.name}</h3>
          <div className="flex items-center gap-2 mt-1">
             {folder.prefix && (
                 <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded border border-white/5 text-gray-500">
                    {folder.prefix}
                 </span>
             )}
             {folder.margin !== undefined && !folder.isInternal && (
                 <span className="text-[10px] text-green-500/70 font-bold">
                    {(folder.margin * 100).toFixed(0)}%
                 </span>
             )}
          </div>
      </div>
    </div>
  );

  if (currentView === 'dashboard') {
      return (
        <div className="h-full flex flex-col pb-20 md:pb-0" id="tour-welcome">
            <StatsDashboard onActionClick={(type) => { setCurrentView('files'); setPendingAction(type); }} />
            {isDemo && <TourGuide isActive={runTour} onClose={() => setRunTour(false)} onExitDemo={onExitDemo} />}
            <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setWhatsAppModalOpen(false)} />
        </div>
      );
  }

  if (currentView === 'profile') return <ViewWrapper><ProfileView /></ViewWrapper>;
  if (currentView === 'settings') return <ViewWrapper><SettingsView /></ViewWrapper>;
  if (currentView === 'categories') return <ViewWrapper><CategoriesView /></ViewWrapper>;
  if (currentView === 'all-items') return <ViewWrapper><AllItemsView /></ViewWrapper>;
  if (currentView === 'pricing') return <ViewWrapper><PricingView /></ViewWrapper>;
  if (currentView === 'financial-health') return <ViewWrapper><FinancialHealthView /></ViewWrapper>;
  if (currentView === 'orders') return <ViewWrapper><OrdersView /></ViewWrapper>;

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-[#050505] md:bg-transparent pb-20 md:pb-0" onContextMenu={(e) => handleContextMenu(e, 'background')}>
      {isDemo && <TourGuide isActive={runTour} onClose={() => setRunTour(false)} onExitDemo={onExitDemo} />}
      
      {/* Header - Glassmorphism on Desktop */}
      <div className="bg-[#111111] md:bg-[#111]/80 md:backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 flex flex-col gap-3 sticky top-0 z-20 shadow-md pt-safe shrink-0">
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
                {currentFolderId !== null && !pendingAction && (
                    <button onClick={() => setCurrentFolder(breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2].id : null)} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="flex items-center text-xs md:text-sm text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap gap-1">
                    <button onClick={() => setCurrentFolder(null)} className={`px-2 py-1 rounded-lg ${currentFolderId === null && !pendingAction ? 'font-bold text-green-500 bg-green-500/10' : ''}`}>Almacén Principal</button>
                    {breadcrumbs.map((f, idx) => (
                        <React.Fragment key={f.id}>
                            <ChevronRight size={14} className="opacity-30 shrink-0" />
                            <button onClick={() => setCurrentFolder(f.id)} className={`px-2 py-1 rounded-lg truncate max-w-[80px] ${idx === breadcrumbs.length - 1 ? 'font-bold text-green-500 bg-green-500/10' : ''}`}>{f.name}</button>
                        </React.Fragment>
                    ))}
                    {pendingAction && (
                         <div className="flex items-center gap-1">
                            <ChevronRight size={14} className="opacity-30" />
                            <span className="text-orange-500 font-bold px-2 py-1 bg-orange-500/10 rounded-lg">{pendingAction === 'warranty' ? 'Alertas' : 'Estancado'}</span>
                         </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button id="tour-import-btn" variant="secondary" size="sm" onClick={() => setIsImporterOpen(true)} className="h-9 px-3 border-white/10" icon={<Zap size={16} className="text-amber-500" />}>
                   <span className="hidden sm:inline">Importar</span>
                </Button>
                <Button id="tour-new-btn" variant="primary" size="sm" onClick={() => setCreateMenuOpen(true)} icon={<Plus size={18} />} className="h-9 px-3">
                    <span className="hidden sm:inline ml-1">Nuevo</span>
                </Button>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <input type="text" placeholder="Buscar en archivos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-[#1a1a1a] border border-white/5 focus:border-green-600 rounded-xl text-sm text-white placeholder-gray-600 h-10 transition-all" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
            <SearchFilters />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar space-y-8" id="tour-grid">
        
        {/* SETUP WARNING: If WhatsApp is not configured */}
        {!settings.whatsappEnabled && !isDemo && (
            <div 
                onClick={() => setWhatsAppModalOpen(true)}
                className="bg-green-900/10 border border-green-500/20 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-green-900/20 transition-all group"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-500 animate-pulse">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">Tu tienda no puede recibir pedidos</h4>
                        <p className="text-xs text-gray-400 mt-1">
                            Debes conectar tu número de WhatsApp para que los clientes puedan enviarte el carrito de compras.
                        </p>
                    </div>
                </div>
                <div className="bg-green-600 text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg group-hover:scale-105 transition-transform">
                    Conectar Ahora
                </div>
            </div>
        )}

        {/* SALES FOLDERS */}
        {salesFolders.length > 0 && (
          <div>
            <h2 className="text-[10px] font-bold text-green-500 mb-4 px-1 uppercase tracking-widest flex items-center gap-2">
                <Store size={12} /> Mercadería (Venta)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {salesFolders.map(folder => <FolderCard key={folder.id} folder={folder} />)}
            </div>
          </div>
        )}

        {/* INTERNAL FOLDERS */}
        {internalFolders.length > 0 && (
          <div>
            <h2 className="text-[10px] font-bold text-blue-500 mb-4 px-1 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} /> Activos / Insumos (Interno)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {internalFolders.map(folder => <FolderCard key={folder.id} folder={folder} />)}
            </div>
          </div>
        )}

        {/* ITEMS GRID - SQUARED LAYOUT */}
        <div>
          {currentItems.length > 0 && (
             <h2 className="text-[10px] font-bold text-gray-500 mb-4 px-1 uppercase tracking-widest mt-4">Items en esta ubicación</h2>
          )}
          
          {currentItems.length === 0 && salesFolders.length === 0 && internalFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600 text-center">
                <div className="bg-[#111] p-8 rounded-full mb-4 border border-white/5 shadow-inner">
                    <Package size={48} className="opacity-20" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Almacén Vacío</p>
                <p className="text-xs text-gray-700 mt-2">Crea una sección o agrega un item</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {currentItems.map((product, idx) => (
                <div 
                  key={product.id} 
                  id={idx === 0 ? 'tour-first-item' : undefined}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, product.id)}
                  onContextMenu={(e) => handleContextMenu(e, 'item', product.id)}
                  className="
                      group aspect-square relative bg-[#111] md:bg-[#161616]/90 md:backdrop-blur-xl rounded-3xl border border-white/5 shadow-sm 
                      hover:border-green-500/50 transition-all duration-300 overflow-hidden flex flex-col active:scale-[0.98]
                      hover:scale-[1.03] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing select-none
                  " 
                  onClick={() => handleItemClick(product)}
                >
                  {/* Image takes up significant space */}
                  <div className="absolute inset-0 z-0">
                    <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  </div>

                  {/* Stock Controls - Large and Tappable */}
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                      <button onClick={(e) => { e.stopPropagation(); withAuth(() => incrementStock(product.id)); }} className="w-10 h-10 bg-black/60 hover:bg-green-600 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 transition-colors shadow-lg">
                          <Plus size={20} strokeWidth={3} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); withAuth(() => decrementStock(product.id)); }} className="w-10 h-10 bg-black/60 hover:bg-red-600 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 transition-colors shadow-lg">
                          <Minus size={20} strokeWidth={3} />
                      </button>
                  </div>

                  {/* Info Overlay at Bottom */}
                  <div className="mt-auto p-4 z-10 relative flex flex-col gap-1">
                    <div className="flex justify-between items-end">
                       <span className={`text-2xl font-bold ${product.stock < 5 ? 'text-red-500' : 'text-white'}`}>{product.stock}</span>
                       <span className="text-sm font-bold text-green-400 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5">${product.price.toFixed(0)}</span>
                    </div>
                    
                    <h3 className="text-sm font-bold text-gray-100 leading-tight line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center gap-2 mt-1 opacity-70">
                        <span className="text-[10px] text-gray-300 font-mono uppercase truncate">SKU: {product.sku}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Create Menu */}
      {isCreateMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setCreateMenuOpen(false)}>
            <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16"></div>
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-white">¿Qué deseas hacer?</h3>
                    <button onClick={() => setCreateMenuOpen(false)} className="bg-[#222] p-2 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-3 relative z-10">
                    {/* NEW ITEM */}
                    <button 
                        id="tour-new-item-option" 
                        onClick={() => withAuth(() => { setEditingProduct(null); setAddProductModalOpen(true); setCreateMenuOpen(false); })}
                        className="w-full bg-gradient-to-r from-green-900/30 to-black border border-green-500/50 hover:border-green-400 rounded-2xl p-4 flex items-center gap-4 group transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] text-left"
                    >
                        <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center text-black shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                            <ImagePlus size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">Nuevo Item con IA</h4>
                                <span className="bg-green-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">AUTO</span>
                            </div>
                            <p className="text-sm text-gray-400 group-hover:text-gray-300">
                                Sube una imagen. Detectamos nombre y precio.
                            </p>
                        </div>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                         {/* FOLDER */}
                        <button 
                            onClick={() => withAuth(() => { setIsFolderModalOpen(true); setCreateMenuOpen(false); })}
                            className="bg-[#1a1a1a] hover:bg-[#222] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col justify-center gap-2 transition-all text-left group"
                        >
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <FolderPlus size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-200 group-hover:text-white text-sm">Nueva Sección</h4>
                                <p className="text-xs text-gray-500">Categoría / Almacén</p>
                            </div>
                        </button>

                        {/* IMPORT */}
                        <button 
                            onClick={() => withAuth(() => { setIsImporterOpen(true); setCreateMenuOpen(false); })}
                            className="bg-[#1a1a1a] hover:bg-[#222] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col justify-center gap-2 transition-all text-left group"
                        >
                            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-200 group-hover:text-white text-sm">Carga Masiva</h4>
                                <p className="text-xs text-gray-500">Importar Excel/CSV</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {contextMenu.isOpen && <ContextMenu x={contextMenu.x} y={contextMenu.y} type={contextMenu.type} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} onAction={handleContextMenuAction} />}
      <MoveModal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} itemId={moveTarget?.id || null} itemType={moveTarget?.type || 'item'} />
      <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setAddProductModalOpen(false)} editProduct={editingProduct} />
      <ProductDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} product={selectedProduct} onEdit={(p) => { setIsDetailsOpen(false); setEditingProduct(p); setAddProductModalOpen(true); }} />
      <InventoryImporter isOpen={isImporterOpen} onClose={() => setIsImporterOpen(false)} />
      <AddFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} />
      <EditFolderModal isOpen={isEditFolderOpen} onClose={() => setIsEditFolderOpen(false)} folderId={editingFolderId} />
      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setWhatsAppModalOpen(false)} />
    </div>
  );
};