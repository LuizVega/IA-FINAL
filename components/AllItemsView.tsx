import React, { useState } from 'react';
import { useStore } from '../store';
import { SearchFilters } from './SearchFilters';
import { Button } from './ui/Button';
import { Upload, Minus, Plus } from 'lucide-react';

export const AllItemsView: React.FC = () => {
  const { categories, getFilteredInventory, incrementStock, decrementStock } = useStore();

  const getCategoryColor = (catName: string) => {
    return categories.find(c => c.name === catName)?.color || 'bg-gray-100 text-gray-700';
  };

  const filteredItems = getFilteredInventory();

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Todos los Items</h2>
           <p className="text-sm text-gray-500 mt-1">{filteredItems.length} items en total</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img className="h-full w-full object-cover" src={product.imageUrl} alt="" />
                      </div>
                      <div className="ml-4">
                         {product.brand && <div className="text-[10px] text-gray-500 uppercase font-bold">{product.brand}</div>}
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.tags?.map(t => (
                           <span key={t} className="ml-1 inline-block bg-red-50 text-red-500 text-[9px] px-1 rounded font-bold uppercase">{t}</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-2">
                         <button onClick={() => decrementStock(product.id)} className="text-gray-400 hover:text-red-500"><Minus size={14}/></button>
                         <span className={`font-mono font-bold w-6 ${product.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>{product.stock}</span>
                         <button onClick={() => incrementStock(product.id)} className="text-gray-400 hover:text-green-500"><Plus size={14}/></button>
                      </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{product.sku}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">${product.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <p>No se encontraron items.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
