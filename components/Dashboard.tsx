import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Search, LayoutGrid, List as ListIcon, Plus, Minus, Folder as FolderIcon, ChevronRight, ArrowLeft, MoreHorizontal, Upload, Package } from 'lucide-react';
import { Button } from './ui/Button';
import { AddProductModal } from './AddProductModal';
import { AddFolderModal } from './AddFolderModal';
import { EditFolderModal } from './EditFolderModal';
import { ProductDetailsModal } from './ProductDetailsModal';
import { ContextMenu } from './ui/ContextMenu';
import { SettingsView } from './SettingsView';
import { AllItemsView } from './AllItemsView';
import { CategoriesView } from './CategoriesView';
import { SearchFilters } from './SearchFilters';
import { InventoryImporter } from './InventoryImporter';
import { Product, ContextMenuState } from '../types';

export const Dashboard: React.FC = () => {
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
    decrementStock
  } = useStore();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    type: 'background'
  });

  const getCategoryColor = (catName: string) => {
    return categories.find(c => c.name === catName)?.color || 'bg-gray-100 text-gray-700';
  };

  const filteredInventory = getFilteredInventory();

  const currentFolders = useMemo(() => {
    if (searchQuery) return []; 
    return folders.filter(f => f.parentId === currentFolderId);
  }, [folders, currentFolderId, searchQuery]);

  const currentItems = useMemo(() => {
    return filteredInventory.filter(i => i.folderId === currentFolderId || searchQuery);
  }, [filteredInventory, currentFolderId, searchQuery]);

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

    if (action === 'new-folder') setIsFolderModalOpen(true);
    if (action === 'new-item') {
       setEditingProduct(null);
       setIsProductModalOpen(true);
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
          setIsProductModalOpen(true);
        }
      }
    }
  };

  const handleItemClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleEditFromDetails = (product: Product) => {
    setIsDetailsOpen(false);
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  // Views
  if (currentView === 'settings') return <SettingsView />;
  if (currentView === 'categories') return <CategoriesView />;
  if (currentView === 'all-items') return <AllItemsView />;

  return (
    <div 
      className="flex-1 h-full overflow-hidden flex flex-col bg-[#F5F5F7]"
      onContextMenu={(e) => handleContextMenu(e, 'background')}
    >
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
           {currentFolderId !== null && (
             <button onClick={() => setCurrentFolder(breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2].id : null)} className="md:hidden p-2 -ml-2 text-gray-600">
               <ArrowLeft size={20} />
             </button>
           )}
           
           <div className="flex items-center text-sm text-gray-600 overflow-x-auto no-scrollbar whitespace-nowrap">
             <button 
               onClick={() => setCurrentFolder(null)}
               className={`hover:bg-gray-100 px-2 py-1 rounded-md transition-colors ${currentFolderId === null ? 'font-semibold text-gray-900' : ''}`}
             >
               Inicio
             </button>
             {breadcrumbs.map((folder, index) => (
               <React.Fragment key={folder.id}>
                 <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mx-1" />
                 <button 
                   onClick={() => setCurrentFolder(folder.id)}
                   className={`hover:bg-gray-100 px-2 py-1 rounded-md transition-colors ${index === breadcrumbs.length - 1 ? 'font-semibold text-gray-900' : ''}`}
                 >
                   {folder.name}
                 </button>
               </React.Fragment>
             ))}
           </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setIsImporterOpen(true)} icon={<Upload size={16}/>} className="hidden md:flex">
             Importar
          </Button>

          <div className="relative hidden md:flex items-center gap-2">
             <div className="relative w-56">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             </div>
             <SearchFilters />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
               <LayoutGrid size={18} />
             </button>
             <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
               <ListIcon size={18} />
             </button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} icon={<Plus size={16} />}>
              Nuevo
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        
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
                  className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between h-32 relative"
                >
                  <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FolderIcon size={20} fill="currentColor" fillOpacity={0.2} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 truncate" title={folder.name}>{folder.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{inventory.filter(i => i.folderId === folder.id).length} items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3 px-1 uppercase tracking-wide">Inventario</h2>
          
          {currentItems.length === 0 && currentFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 pointer-events-none">
               <div className="bg-gray-100 p-6 rounded-full mb-4">
                 <Package size={40} className="text-gray-300" />
               </div>
               <p className="text-lg font-medium text-gray-600">
                 {searchQuery ? 'No se encontraron items' : 'Esta carpeta está vacía'}
               </p>
               <Button variant="ghost" className="mt-4 pointer-events-auto" onClick={() => setIsImporterOpen(true)}>
                 Importar desde Excel
               </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentItems.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group flex flex-col relative"
                  onContextMenu={(e) => handleContextMenu(e, 'item', product.id)}
                >
                  <div 
                    className="aspect-[4/3] relative overflow-hidden bg-gray-50 border-b border-gray-100 cursor-pointer"
                    onClick={() => handleItemClick(product)}
                  >
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    
                    {/* Tags */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                       {product.tags?.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-red-500 text-white shadow-sm">
                             {tag}
                          </span>
                       ))}
                    </div>

                    <span className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border bg-white/90 backdrop-blur-sm ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1 mb-3 cursor-pointer" onClick={() => handleItemClick(product)}>
                      {product.brand && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{product.brand}</p>
                      )}
                      <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2" title={product.name}>{product.name}</h3>
                      <p className="text-xs text-gray-400 font-mono mt-1">{product.sku}</p>
                    </div>

                    {/* Stock Control */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                       <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 uppercase">Stock</span>
                          <span className={`text-lg font-bold ${product.stock < 5 ? 'text-red-500' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                       </div>
                       
                       <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <button 
                             onClick={(e) => { e.stopPropagation(); decrementStock(product.id); }}
                             className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-600 active:scale-95 transition-all"
                          >
                             <Minus size={14} />
                          </button>
                          <button 
                             onClick={(e) => { e.stopPropagation(); incrementStock(product.id); }}
                             className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-green-600 active:scale-95 transition-all"
                          >
                             <Plus size={14} />
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map(product => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                      onClick={() => handleItemClick(product)}
                      onContextMenu={(e) => handleContextMenu(e, 'item', product.id)}
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                            <img className="h-full w-full object-cover" src={product.imageUrl} alt="" />
                          </div>
                          <div className="ml-4">
                            {product.brand && <div className="text-[10px] text-gray-500 uppercase font-bold">{product.brand}</div>}
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.tags?.includes('Descontinuado') && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1 rounded">DESCONTINUADO</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center">
                         <div className="inline-flex items-center gap-2">
                            <button 
                               onClick={(e) => { e.stopPropagation(); decrementStock(product.id); }}
                               className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                            >
                               <Minus size={12} />
                            </button>
                            <span className={`font-mono font-bold w-8 text-center ${product.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock}</span>
                            <button 
                               onClick={(e) => { e.stopPropagation(); incrementStock(product.id); }}
                               className="w-6 h-6 rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-600 flex items-center justify-center transition-colors"
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
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">${product.price.toFixed(2)}</td>
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

      <AddProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
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
