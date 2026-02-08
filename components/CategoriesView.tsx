import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Edit2, X, Tag, Lock, ShoppingBag, Percent } from 'lucide-react';
import { Button } from './ui/Button';
import { CategoryConfig } from '../types';

const PRESET_COLORS = [
  { label: 'Naranja', class: 'bg-orange-50 text-orange-700 border-orange-100' },
  { label: 'Verde', class: 'bg-green-50 text-green-700 border-green-100' },
  { label: 'Azul', class: 'bg-blue-50 text-blue-700 border-blue-100' },
  { label: 'Púrpura', class: 'bg-purple-50 text-purple-700 border-purple-100' },
  { label: 'Rosa', class: 'bg-pink-50 text-pink-700 border-pink-100' },
  { label: 'Gris', class: 'bg-gray-50 text-gray-700 border-gray-100' },
  { label: 'Rojo', class: 'bg-red-50 text-red-700 border-red-100' },
  { label: 'Indigo', class: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
];

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New Category State
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<CategoryConfig>>({
    name: '',
    prefix: '',
    margin: 0.30,
    color: PRESET_COLORS[5].class,
    isInternal: false
  });

  const resetForm = () => {
    setForm({
      name: '',
      prefix: '',
      margin: 0.30,
      color: PRESET_COLORS[5].class,
      isInternal: false
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleStartEdit = (cat: CategoryConfig) => {
    setEditingId(cat.id);
    setForm(cat);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!form.name || !form.prefix) return;

    if (editingId) {
      updateCategory(editingId, form);
    } else {
      addCategory({
        id: crypto.randomUUID(),
        name: form.name,
        prefix: form.prefix.toUpperCase(),
        margin: Number(form.margin),
        color: form.color || PRESET_COLORS[5].class,
        isInternal: form.isInternal || false
      });
    }
    resetForm();
  };

  const handleTypeChange = (isInternal: boolean) => {
    setForm(prev => ({
      ...prev,
      isInternal,
      margin: isInternal ? 0 : (prev.margin === 0 ? 0.30 : prev.margin) 
    }));
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Categorías</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base font-light">
            Organiza tu inventario y automatiza precios.
          </p>
        </div>
        
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)} 
            icon={<Plus size={20} />} 
            className="shadow-lg hover:shadow-xl transition-all"
          >
            Nueva Categoría
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Editor Panel */}
        {isAdding && (
          <div className="w-full lg:w-1/3 xl:w-1/4 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 animate-in slide-in-from-left-4 duration-300 sticky top-4 z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar Categoría' : 'Crear Categoría'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nombre</label>
                <input 
                  autoFocus
                  placeholder="Ej. Herramientas"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Tipo</label>
                <div className="flex bg-gray-50 p-1 rounded-2xl">
                  <button 
                    onClick={() => handleTypeChange(false)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${!form.isInternal ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <ShoppingBag size={16} /> Venta
                  </button>
                  <button 
                    onClick={() => handleTypeChange(true)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${form.isInternal ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Lock size={16} /> Interno
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Prefijo</label>
                    <input 
                      placeholder="Ej. HER"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase text-center"
                      maxLength={3}
                      value={form.prefix}
                      onChange={e => setForm({...form, prefix: e.target.value.toUpperCase()})}
                    />
                 </div>
                 
                 <div className={form.isInternal ? 'opacity-50 pointer-events-none' : ''}>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Margen</label>
                    <div className="relative">
                      <input 
                        type="number"
                        disabled={form.isInternal}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-right pr-8"
                        value={Math.round((form.margin || 0) * 100)}
                        onChange={e => setForm({...form, margin: parseFloat(e.target.value)/100})}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                        <Percent size={14} />
                      </span>
                    </div>
                 </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Color</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.label}
                      onClick={() => setForm({...form, color: color.class})}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color.class.replace('text-', 'bg-').split(' ')[0].replace('-50', '-400')} ${
                        form.color === color.class ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 border-white' : 'border-transparent opacity-40 hover:opacity-100'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                 <Button onClick={handleSave} className="w-full py-4 text-base rounded-2xl shadow-lg">
                    {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                 </Button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid List - Now takes full remaining width */}
        <div className={`flex-1 w-full ${isAdding ? 'lg:w-2/3 xl:w-3/4' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between h-40 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color} bg-opacity-50`}>
                      <span className="text-lg font-bold">{cat.prefix.substring(0, 1)}</span>
                   </div>
                   
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleStartEdit(cat)} 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteCategory(cat.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>

                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{cat.name}</h3>
                      {cat.isInternal && (
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Lock size={10} />
                        </span>
                      )}
                   </div>
                   
                   <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg font-mono text-xs">
                         <Tag size={12} className="opacity-50" /> {cat.prefix}
                      </span>
                      {!cat.isInternal && (
                        <span className="flex items-center gap-1 text-xs">
                          Margen: <span className="text-gray-900 font-semibold">{(cat.margin * 100).toFixed(0)}%</span>
                        </span>
                      )}
                   </div>
                </div>
              </div>
            ))}
            
            {!isAdding && categories.length > 0 && (
               <button 
                 onClick={() => setIsAdding(true)}
                 className="group h-40 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-blue-600"
               >
                 <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Plus size={24} />
                 </div>
                 <span className="font-medium">Nueva Categoría</span>
               </button>
            )}
          </div>

          {categories.length === 0 && (
             <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 w-full">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                   <Tag size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sin Categorías</h3>
                <p className="text-gray-400 mb-6 max-w-sm mx-auto">Define tus categorías para organizar el inventario y establecer márgenes automáticos.</p>
                <Button onClick={() => setIsAdding(true)}>Crear Primera Categoría</Button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
