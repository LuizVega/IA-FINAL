
import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { Minus, Plus, Box, Trash2 } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { ContextMenu } from './ui/ContextMenu';
import { AddProductModal } from './AddProductModal';
import { ContextMenuState, Product } from '../types';

export const AllItemsView: React.FC = () => {
  const { 
    categories, 
    getFilteredInventory, 
    incrementStock, 
    decrementStock, 
    clearInventory, 
    checkAuth,
    deleteProduct,
    setEditingProduct,
    setAddProductModalOpen,
    isAddProductModalOpen,
    editingProduct,
    inventory
  } = useStore();

  // Local state for Context Menu in this view
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    type: 'item'
  });

  const getCategoryColor = (catName: string) => {
    return categories.find(c => c.name === catName)?.color || 'bg-gray-800 text-gray-300 border-gray-700';
  };

  const filteredItems = getFilteredInventory();

  const handleClearAll = async () => {
      if (!checkAuth()) return;
      if (confirm("⚠️ ¡ADVERTENCIA CRÍTICA! ⚠️\n\n¿Estás seguro de que quieres ELIMINAR TODO el inventario?\n\nEsta acción borrará todos los productos permanentemente y no se puede deshacer.")) {
          await clearInventory();
      }
  };

  const handleContextMenu = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: 'item',
      targetId: productId
    });
  };

  const handleContextMenuAction = (action: string) => {
    const { targetId } = contextMenu;
    setContextMenu({ ...contextMenu, isOpen: false });

    if (!checkAuth() || !targetId) return;

    if (action === 'delete') {
       if(confirm('¿Eliminar este item permanentemente?')) {
           deleteProduct(targetId);
       }
    }
    
    if (action === 'edit') {
       const product = inventory.find(p => p.id === targetId);
       if (product) {
           setEditingProduct(product);
           setAddProductModalOpen(true);
       }
    }
  };

  return (
    <div className="p-6 h-full flex flex-col" onClick={() => setContextMenu({ ...contextMenu, isOpen: false })}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Inventario Global</h2>
           <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
             <Box size={14} className="text-green-500" />
             {filteredItems.length} items registrados
           </p>
        </div>
        {filteredItems.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleClearAll} icon={<Trash2 size={16}/>}>
                Eliminar Todo
            </Button>
        )}
      </div>
      
      <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden flex-1 flex flex-col shadow-2xl">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-[#050505] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Item / Detalle</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Stock Control</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">SKU</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Precio Venta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map(product => (
                <tr 
                    key={product.id} 
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onContextMenu={(e) => handleContextMenu(e, product.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black group-hover:border-green-500/30 transition-colors">
                        <ProductImage className="h-full w-full object-cover opacity-80 group-hover:opacity-100" src={product.imageUrl} alt="" />
                      </div>
                      <div className="ml-4">
                         {product.brand && <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">{product.brand}</div>}
                        <div className="text-sm font-medium text-gray-200 group-hover:text-white">{product.name}</div>
                        {product.tags?.map(t => (
                           <span key={t} className="mt-1 mr-1 inline-block bg-red-900/20 text-red-400 border border-red-900/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">{t}</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5" onClick={(e) => e.stopPropagation()}>
                         <button onClick={() => decrementStock(product.id)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors"><Minus size={14}/></button>
                         <span className={`font-mono font-bold w-8 text-center ${product.stock < 5 ? 'text-red-500' : 'text-gray-200'}`}>{product.stock}</span>
                         <button onClick={() => incrementStock(product.id)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-green-900/20 text-gray-500 hover:text-green-500 transition-colors"><Plus size={14}/></button>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold rounded-md border uppercase tracking-wider ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono group-hover:text-green-500/70 transition-colors">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-200">${product.price.toFixed(2)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
               <p className="text-lg font-medium">No se encontraron items</p>
               <p className="text-sm">Intenta ajustar tus filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {contextMenu.isOpen && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          type="item" 
          onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} 
          onAction={handleContextMenuAction}
        />
      )}

      {/* Include Modal here because Dashboard unmounts its own when switching to this view */}
      <AddProductModal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setAddProductModalOpen(false)} 
        editProduct={editingProduct}
      />
    </div>
  );
};
