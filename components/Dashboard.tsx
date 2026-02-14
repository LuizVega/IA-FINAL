
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Search, LayoutGrid, List as ListIcon, Plus, Minus, Folder as FolderIcon, ChevronRight, ArrowLeft, Move, Upload, Package, ShieldAlert, Clock, Home, FolderPlus, FilePlus, Filter, Zap, MoreVertical, Scan, FileSpreadsheet, X, Sparkles, ImagePlus } from 'lucide-react';
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
import { TourGuide } from './TourGuide';
import { ProductImage } from './ProductImage';
import { Product, ContextMenuState } from '../types';
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
    inventory, folders, categories, currentFolderId, searchQuery, viewMode, currentView,
    deleteProduct, deleteFolder, setSearchQuery, setCurrentFolder, getBreadcrumbs,
    getFilteredInventory, incrementStock, decrementStock, setCurrentView, checkAuth, settings,
    isAddProductModalOpen, setAddProductModalOpen, isImporterOpen, setIsImporterOpen,
    isDetailsOpen, setIsDetailsOpen, isCreateMenuOpen, setCreateMenuOpen, 
    editingProduct, setEditingProduct, selectedProduct, setSelectedProduct, setTourStep,
    isWhatsAppModalOpen, setWhatsAppModalOpen, pendingAction, setPendingAction
  } = useStore();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState<{id: string, type: 'folder' | 'item'} | null>(null);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => { if (isDemo) setRunTour(true); }, [isDemo]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ isOpen: false, x: 0, y: 0, type: 'background' });

  const withAuth = (action: () => void) => { if (checkAuth()) action(); };
  const getCategoryColor = (catName: string) => categories.find(c => c.name === catName)?.color || 'bg-gray-800 text-gray-300';
  const filteredInventory = getFilteredInventory();

  const currentFolders = useMemo(() => {
    if (searchQuery || pendingAction) return []; 
    return folders.filter(f => f.parentId === currentFolderId);
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
      if (action === 'delete') { if (confirm('¿Eliminar carpeta?')) deleteFolder(targetId); }
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

  const handleItemClick = (product: Product) => { setSelectedProduct(product); setIsDetailsOpen(true); };

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
                    <button onClick={() => setCurrentFolder(null)} className={`px-2 py-1 rounded-lg ${currentFolderId === null && !pendingAction ? 'font-bold text-green-500 bg-green-500/10' : ''}`}>Inicio</button>
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
        {currentFolders.length > 0 && (
          <div>
            <h2 className="text-[10px] font-bold text-gray-500 mb-4 px-1 uppercase tracking-widest">Carpetas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {currentFolders.map(folder => (
                <div 
                    key={folder.id} 
                    onClick={() => setCurrentFolder(folder.id)} 
                    className="
                        group relative bg-[#111] md:bg-[#111]/80 md:backdrop-blur-md p-4 rounded-2xl border border-white/5 
                        md:hover:border-green-500/50 transition-all cursor-pointer flex items-center gap-3 active:scale-95 shadow-sm 
                        md:hover:scale-105 md:hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]
                    "
                >
                  <div className="bg-blue-500/10 w-10 h-10 rounded-xl flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform"><FolderIcon size={20} fill="currentColor" fillOpacity={0.2} /></div>
                  <div className="min-w-0 flex-1"><h3 className="text-xs font-bold text-gray-200 truncate group-hover:text-white transition-colors">{folder.name}</h3></div>
                  <MoreVertical size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-[10px] font-bold text-gray-500 mb-4 px-1 uppercase tracking-widest">Archivos</h2>
          {currentItems.length === 0 && currentFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600 text-center"><div className="bg-[#111] p-8 rounded-full mb-4 border border-white/5 shadow-inner"><Package size={48} className="opacity-20" /></div><p className="text-xs font-bold uppercase tracking-widest text-gray-600">No hay archivos aquí</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {currentItems.map((product, idx) => (
                <div 
                  key={product.id} 
                  id={idx === 0 ? 'tour-first-item' : undefined} 
                  className="
                      group relative bg-[#111] md:bg-[#161616]/90 md:backdrop-blur-xl rounded-2xl border border-white/5 shadow-sm 
                      md:hover:border-green-500/50 transition-all duration-300 overflow-hidden flex md:flex-col items-center md:items-stretch p-2 md:p-0 active:scale-[0.98]
                      md:hover:scale-[1.03] md:hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
                  " 
                  onClick={() => handleItemClick(product)}
                >
                  {/* Desktop Glow Effect */}
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  <div className="w-16 h-16 md:w-full md:aspect-[4/3] relative bg-black rounded-xl md:rounded-none overflow-hidden shrink-0">
                    <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-contain opacity-90 md:group-hover:opacity-100 md:group-hover:scale-105 transition-all duration-500" />
                  </div>
                  <div className="p-3 flex flex-col flex-1 min-w-0 relative z-10">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs md:text-sm font-bold text-gray-100 truncate group-hover:text-green-400 transition-colors">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-gray-500 font-mono uppercase truncate group-hover:text-gray-400">SKU: {product.sku}</span>
                            <span className={`hidden md:inline px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border ${getCategoryColor(product.category)}`}>{product.category}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 md:mt-4 md:pt-3 md:border-t md:border-white/5 md:group-hover:border-white/10">
                       <div className="text-sm md:text-base font-bold text-white">${product.price.toFixed(0)}</div>
                       <div className="flex items-center gap-1.5 bg-black/50 rounded-lg px-2 py-1 border border-white/5 md:group-hover:border-white/20 transition-colors">
                          <button onClick={(e) => { e.stopPropagation(); withAuth(() => decrementStock(product.id)); }} className="text-gray-500 hover:text-red-400 p-0.5 hover:bg-white/10 rounded"><Minus size={14} /></button>
                          <span className={`text-xs font-bold min-w-[20px] text-center ${product.stock < 5 ? 'text-red-500' : 'text-gray-300'}`}>{product.stock}</span>
                          <button onClick={(e) => { e.stopPropagation(); withAuth(() => incrementStock(product.id)); }} className="text-gray-500 hover:text-green-400 p-0.5 hover:bg-white/10 rounded"><Plus size={14} /></button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* --- QUICK ACTION COMMAND CENTER (New) --- */}
      {isCreateMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setCreateMenuOpen(false)}>
            <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                
                {/* Background effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16"></div>
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-white">¿Qué deseas hacer?</h3>
                    <button onClick={() => setCreateMenuOpen(false)} className="bg-[#222] p-2 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-3 relative z-10">
                    {/* PRIMARY ACTION: AI SCAN (Updated for WEB) */}
                    <button 
                        id="tour-new-item-option" 
                        onClick={() => withAuth(() => { setEditingProduct(null); setAddProductModalOpen(true); setCreateMenuOpen(false); })}
                        className="w-full bg-gradient-to-r from-green-900/30 to-black border border-green-500/50 hover:border-green-400 rounded-2xl p-4 flex items-center gap-4 group transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] text-left"
                    >
                        <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center text-black shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                            {/* Changed Icon to Sparkles/ImagePlus for Web feel */}
                            <ImagePlus size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">Nuevo Item con IA</h4>
                                <span className="bg-green-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">AUTO</span>
                            </div>
                            <p className="text-sm text-gray-400 group-hover:text-gray-300">
                                Sube una imagen. Detectamos nombre, categoría y precio.
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
                                <h4 className="font-bold text-gray-200 group-hover:text-white text-sm">Nueva Carpeta</h4>
                                <p className="text-xs text-gray-500">Organizar archivos</p>
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
