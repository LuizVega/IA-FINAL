
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Search, LayoutGrid, List as ListIcon, Plus, Minus, Folder as FolderIcon, ChevronRight, ArrowLeft, MoreHorizontal, Upload, Package, AlertTriangle, ShieldAlert, FilePlus, FolderPlus, Clock, Home } from 'lucide-react';
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

interface DashboardProps {
    isDemo?: boolean;
    onExitDemo?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ isDemo, onExitDemo }) => {
  const { 
    inventory, 
    folders, 
    categories,
    currentFolderId, 
    searchQuery, 
    viewMode,
    currentView,
    deleteProduct, 
    deleteFolder,
    setSearchQuery, 
    setViewMode,
    setCurrentFolder,
    getBreadcrumbs,
    getFilteredInventory,
    incrementStock,
    decrementStock,
    setCurrentView,
    checkAuth, 
    setAuthModalOpen,
    isAddProductModalOpen, 
    setAddProductModalOpen,
    editingProduct,
    setEditingProduct
  } = useStore();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  
  // UI States
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [pendingActionType, setPendingActionType] = useState<'warranty' | 'stagnant' | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  
  const [moveTarget, setMoveTarget] = useState<{id: string, type: 'folder' | 'item'} | null>(null);

  // Tour State
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
     if (isDemo) {
         setRunTour(true);
     }
  }, [isDemo]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    type: 'background'
  });

  const withAuth = (action: () => void) => {
      if (checkAuth()) {
          action();
      }
  };

  const getCategoryColor = (catName: string) => {
    return categories.find(c => c.name === catName)?.color || 'bg-gray-800 text-gray-300';
  };

  const filteredInventory = getFilteredInventory();

  const currentFolders = useMemo(() => {
    if (searchQuery || pendingActionType) return []; 
    return folders.filter(f => f.parentId === currentFolderId);
  }, [folders, currentFolderId, searchQuery, pendingActionType]);

  const currentItems = useMemo(() => {
    let items = filteredInventory.filter(i => i.folderId === currentFolderId || searchQuery);
    
    if (pendingActionType === 'warranty') {
        items = inventory.filter(item => {
            return item.supplierWarranty ? differenceInDays(parseISO(item.supplierWarranty), new Date()) < 60 : false;
        });
    } else if (pendingActionType === 'stagnant') {
        items = inventory.filter(item => {
            if (!item.entryDate || item.stock === 0) return false;
            try {
               const days = differenceInDays(new Date(), parseISO(item.entryDate));
               return days > 90;
            } catch { return false; }
        });
    }
    
    return items;
  }, [filteredInventory, currentFolderId, searchQuery, pendingActionType, inventory]);

  const breadcrumbs = getBreadcrumbs();

  const handleContextMenu = (e: React.MouseEvent, type: 'background' | 'folder' | 'item', id?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type,
      targetId: id
    });
  };

  const handleContextMenuAction = (action: string) => {
    const { targetId, type } = contextMenu;
    setContextMenu({ ...contextMenu, isOpen: false });

    if (!checkAuth()) return;

    if (action === 'new-folder') setIsFolderModalOpen(true);
    if (action === 'new-item') {
       setEditingProduct(null);
       setAddProductModalOpen(true);
    }
    
    if (action === 'move' && targetId) {
        setMoveTarget({ id: targetId, type: type as 'folder' | 'item' });
        setIsMoveModalOpen(true);
    }

    if (type === 'folder' && targetId) {
      if (action === 'delete') {
         if (confirm('¿Estás seguro de eliminar esta carpeta?')) deleteFolder(targetId);
      }
      if (action === 'edit') {
        setEditingFolderId(targetId);
        setIsEditFolderOpen(true);
      }
    }

    if (type === 'item' && targetId) {
      if (action === 'delete') {
        deleteProduct(targetId);
      }
      if (action === 'edit') {
        const product = inventory.find(p => p.id === targetId);
        if (product) {
          setEditingProduct(product);
          setAddProductModalOpen(true);
        }
      }
    }
  };

  const handleItemClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleEditFromDetails = (product: Product) => {
    if (!checkAuth()) return;
    setIsDetailsOpen(false);
    setEditingProduct(product);
    setAddProductModalOpen(true);
  };

  const getWarrantyStatus = (warrantyDate?: string) => {
    if (!warrantyDate) return null;
    try {
      const date = parseISO(warrantyDate);
      if (!isValid(date)) return null;
      
      const daysLeft = differenceInDays(date, new Date());
      if (daysLeft < 0) return 'expired';
      if (daysLeft < 30) return 'warning';
      return 'ok';
    } catch (e) {
      return null;
    }
  };

  if (currentView === 'dashboard') {
      return (
        <div className="h-full flex flex-col pb-24 md:pb-0" id="tour-welcome">
            <StatsDashboard 
                onActionClick={(type) => {
                    setPendingActionType(type);
                    setCurrentView('files');
                }}
            />
            {isDemo && <TourGuide isActive={runTour} onClose={() => setRunTour(false)} />}
        </div>
      );
  }
  if (currentView === 'profile') return <div className="h-full pb-24 md:pb-0"><ProfileView /></div>;
  if (currentView === 'settings') return <div className="h-full pb-24 md:pb-0"><SettingsView /></div>;
  if (currentView === 'categories') return <div className="h-full pb-24 md:pb-0"><CategoriesView /></div>;
  if (currentView === 'all-items') return <div className="h-full pb-24 md:pb-0"><AllItemsView /></div>;
  if (currentView === 'pricing') return <div className="h-full pb-24 md:pb-0"><PricingView /></div>;
  if (currentView === 'financial-health') return <div className="h-full pb-24 md:pb-0"><FinancialHealthView /></div>;

  return (
    <div 
      className="flex-1 h-full overflow-hidden flex flex-col bg-[#050505] pb-24 md:pb-0" 
      onContextMenu={(e) => handleContextMenu(e, 'background')}
    >
      {/* Top Bar */}
      <div className="bg-[#111111] border-b border-green-900/30 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4 flex-1">
           {isDemo && onExitDemo && (
               <Button variant="ghost" size="sm" onClick={onExitDemo} className="mr-2 text-gray-400 hover:text-white border border-white/10" icon={<Home size={16}/>}>
                   Volver al Inicio
               </Button>
           )}

           {currentFolderId !== null && !pendingActionType && (
             <button onClick={() => setCurrentFolder(breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2].id : null)} className="md:hidden p-2 -ml-2 text-gray-400">
               <ArrowLeft size={20} />
             </button>
           )}
           
           {pendingActionType ? (
               <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" onClick={() => setPendingActionType(null)} icon={<ArrowLeft size={16}/>}>
                       Volver
                   </Button>
                   <span className={`text-white font-bold flex items-center gap-2 px-3 py-1 rounded-lg border ${
                       pendingActionType === 'warranty' 
                         ? 'bg-red-900/30 border-red-900/50 text-red-500' 
                         : 'bg-orange-900/30 border-orange-900/50 text-orange-500'
                   }`}>
                      {pendingActionType === 'warranty' ? <ShieldAlert size={16} /> : <Clock size={16} />}
                      {pendingActionType === 'warranty' ? 'Riesgo de Garantía' : 'Inventario Estancado'}
                   </span>
               </div>
           ) : (
            <div className="flex items-center text-sm text-gray-400 overflow-x-auto no-scrollbar whitespace-nowrap">
                <button 
                onClick={() => setCurrentFolder(null)}
                className={`hover:bg-[#222] px-2 py-1 rounded-md transition-colors ${currentFolderId === null ? 'font-bold text-green-500' : ''}`}
                >
                Inicio
                </button>
                {breadcrumbs.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    <ChevronRight size={16} className="text-gray-600 flex-shrink-0 mx-1" />
                    <button 
                    onClick={() => setCurrentFolder(folder.id)}
                    className={`hover:bg-[#222] px-2 py-1 rounded-md transition-colors ${index === breadcrumbs.length - 1 ? 'font-bold text-green-500' : ''}`}
                    >
                    {folder.name}
                    </button>
                </React.Fragment>
                ))}
            </div>
           )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => withAuth(() => setIsImporterOpen(true))} icon={<Upload size={16}/>} className="hidden md:flex">
             Importar
          </Button>

          <div className="relative hidden md:flex items-center gap-2" id="tour-search">
             <div className="relative w-56">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#1a1a1a] border border-transparent focus:border-green-600 rounded-lg text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-green-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
             </div>
             <SearchFilters />
          </div>

          <div className="flex bg-[#1a1a1a] p-1 rounded-lg">
             <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-[#2a2a2a] shadow-sm text-green-500' : 'text-gray-500'}`}>
               <LayoutGrid size={18} />
             </button>
             <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-[#2a2a2a] shadow-sm text-green-500' : 'text-gray-500'}`}>
               <ListIcon size={18} />
             </button>
          </div>
          
          <div className="relative">
            <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)} 
                icon={<Plus size={16} />}
                className={isCreateMenuOpen ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-[#111]' : ''}
            >
              Nuevo
            </Button>
            {isCreateMenuOpen && (
                <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCreateMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <button 
                        onClick={() => withAuth(() => { setIsFolderModalOpen(true); setIsCreateMenuOpen(false); })}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-gray-200 transition-colors"
                    >
                        <FolderPlus size={18} className="text-blue-400" /> Carpeta
                    </button>
                    <button 
                        onClick={() => withAuth(() => { setEditingProduct(null); setAddProductModalOpen(true); setIsCreateMenuOpen(false); })}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-gray-200 transition-colors border-t border-white/5"
                    >
                        <FilePlus size={18} className="text-green-400" /> Nuevo Item
                    </button>
                </div>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" id="tour-grid">
        
        {/* Folders */}
        {currentFolders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 mb-3 px-1 uppercase tracking-wide">Carpetas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {currentFolders.map(folder => (
                <div 
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder.id)}
                  onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
                  className="group bg-[#111111] p-4 rounded-xl border border-white/5 shadow-sm hover:shadow-lg hover:border-green-600/50 transition-all cursor-pointer flex flex-col justify-between h-32 relative"
                >
                  <div className="bg-green-900/10 w-10 h-10 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-black transition-colors">
                    <FolderIcon size={20} fill="currentColor" fillOpacity={0.2} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200 truncate group-hover:text-white" title={folder.name}>{folder.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{inventory.filter(i => i.folderId === folder.id).length} items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3 px-1 uppercase tracking-wide">
              {pendingActionType ? 'Resultados del filtro' : 'Inventario'}
          </h2>
          
          {currentItems.length === 0 && currentFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600 pointer-events-none">
               <div className="bg-[#111111] p-6 rounded-full mb-4 border border-white/5">
                 <Package size={40} className="text-gray-500" />
               </div>
               <p className="text-lg font-medium text-gray-400">
                 {searchQuery 
                    ? 'No se encontraron items' 
                    : pendingActionType 
                      ? 'No hay items que requieran atención' 
                      : 'Esta carpeta está vacía'}
               </p>
               {!pendingActionType && (
                <Button variant="ghost" className="mt-4 pointer-events-auto" onClick={() => withAuth(() => setIsImporterOpen(true))}>
                    Importar desde Excel
                </Button>
               )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentItems.map(product => {
                const warrantyStatus = getWarrantyStatus(product.supplierWarranty);
                return (
                <div 
                  key={product.id} 
                  className={`bg-[#111111] rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden group flex flex-col relative ${warrantyStatus === 'expired' ? 'border-red-500/40' : 'border-white/5 hover:border-green-600/30'}`}
                  onContextMenu={(e) => handleContextMenu(e, 'item', product.id)}
                >
                  <div 
                    className="aspect-[4/3] relative overflow-hidden bg-black border-b border-white/5 cursor-pointer"
                    onClick={() => handleItemClick(product)}
                  >
                    <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100" />
                    
                    {/* Tags */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                       {product.tags?.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-red-600 text-white shadow-sm">
                             {tag}
                          </span>
                       ))}
                    </div>

                    {/* Warranty Indicator */}
                    {warrantyStatus === 'warning' && (
                        <div className="absolute top-2 left-2 mt-6 bg-amber-500/90 text-black p-1 rounded-md shadow-sm" title="Garantía por vencer">
                           <ShieldAlert size={14} />
                        </div>
                    )}
                    {warrantyStatus === 'expired' && (
                        <div className="absolute top-2 left-2 mt-6 bg-red-600/90 text-white p-1 rounded-md shadow-sm" title="Garantía Vencida">
                           <ShieldAlert size={14} />
                        </div>
                    )}

                    <span className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1 mb-3 cursor-pointer" onClick={() => handleItemClick(product)}>
                      {product.brand && (
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{product.brand}</p>
                      )}
                      <h3 className="font-semibold text-gray-100 leading-tight line-clamp-2" title={product.name}>{product.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">{product.sku}</p>
                    </div>

                    {/* Stock Control */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                       <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase">Stock</span>
                          <span className={`text-lg font-bold ${product.stock < 5 ? 'text-red-500' : 'text-gray-200'}`}>
                            {product.stock}
                          </span>
                       </div>
                       
                       <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
                          <button 
                             onClick={(e) => { e.stopPropagation(); withAuth(() => decrementStock(product.id)); }}
                             className="w-7 h-7 flex items-center justify-center bg-[#222] rounded-md shadow-sm text-gray-400 hover:text-red-400 active:scale-95 transition-all"
                          >
                             <Minus size={14} />
                          </button>
                          <button 
                             onClick={(e) => { e.stopPropagation(); withAuth(() => incrementStock(product.id)); }}
                             className="w-7 h-7 flex items-center justify-center bg-[#222] rounded-md shadow-sm text-gray-400 hover:text-green-400 active:scale-95 transition-all"
                          >
                             <Plus size={14} />
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="bg-[#111111] rounded-xl border border-white/5 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-[#1a1a1a]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {currentItems.map(product => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleItemClick(product)}
                      onContextMenu={(e) => handleContextMenu(e, 'item', product.id)}
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-700 bg-black">
                            <ProductImage className="h-full w-full object-cover" src={product.imageUrl} alt="" />
                          </div>
                          <div className="ml-4">
                            {product.brand && <div className="text-[10px] text-gray-500 uppercase font-bold">{product.brand}</div>}
                            <div className="text-sm font-medium text-gray-200">{product.name}</div>
                            {product.tags?.includes('Descontinuado') && <span className="text-[10px] text-red-400 font-bold bg-red-900/20 px-1 rounded">DESCONTINUADO</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center">
                         <div className="inline-flex items-center gap-2">
                            <button 
                               onClick={(e) => { e.stopPropagation(); withAuth(() => decrementStock(product.id)); }}
                               className="w-6 h-6 rounded-full bg-[#222] hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors"
                            >
                               <Minus size={12} />
                            </button>
                            <span className={`font-mono font-bold w-8 text-center ${product.stock < 5 ? 'text-red-400' : 'text-gray-200'}`}>{product.stock}</span>
                            <button 
                               onClick={(e) => { e.stopPropagation(); withAuth(() => incrementStock(product.id)); }}
                               className="w-6 h-6 rounded-full bg-[#222] hover:bg-green-500/20 hover:text-green-400 flex items-center justify-center transition-colors"
                            >
                               <Plus size={12} />
                            </button>
                         </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-200 text-right font-medium">${product.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {contextMenu.isOpen && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          type={contextMenu.type} 
          onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} 
          onAction={handleContextMenuAction}
        />
      )}
      
      {/* New Move Modal */}
      <MoveModal 
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        itemId={moveTarget?.id || null}
        itemType={moveTarget?.type || 'item'}
      />

      <AddProductModal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setAddProductModalOpen(false)} 
        editProduct={editingProduct}
      />
      
      <ProductDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={selectedProduct}
        onEdit={handleEditFromDetails}
      />

      <AddFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} />
      <EditFolderModal isOpen={isEditFolderOpen} onClose={() => setIsEditFolderOpen(false)} folderId={editingFolderId} />
      
      <InventoryImporter isOpen={isImporterOpen} onClose={() => setIsImporterOpen(false)} />
    </div>
  );
};
