import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { useStore } from '../store';

export const SearchFilters: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters, categories, resetFilters } = useStore();

  const toggleCategory = (catName: string) => {
    const newCats = filters.categories.includes(catName)
      ? filters.categories.filter(c => c !== catName)
      : [...filters.categories, catName];
    setFilters({ categories: newCats });
  };

  const activeCount =
    filters.categories.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${isOpen || activeCount > 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500 hover:text-gray-900'
          }`}
      >
        <Filter size={18} />
        {activeCount > 0 && (
          <span className="bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-20 p-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Filtros</h3>
              {activeCount > 0 && (
                <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline">
                  Limpiar
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Price Range */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Precio
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ minPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ maxPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Categorías
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.categories.includes(cat.name)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 bg-white'
                        }`}>
                        {filters.categories.includes(cat.name) && <Check size={10} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={filters.categories.includes(cat.name)}
                        onChange={() => toggleCategory(cat.name)}
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
