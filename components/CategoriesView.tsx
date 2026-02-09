
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Edit2, X, Tag, Lock, ShoppingBag, Percent, Palette } from 'lucide-react';
import { Button } from './ui/Button';
import { CategoryConfig } from '../types';

const PRESET_COLORS = [
  { label: 'Naranja', class: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { label: 'Verde', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { label: 'Azul', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'Púrpura', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { label: 'Rosa', class: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { label: 'Gris', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  { label: 'Rojo', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { label: 'Indigo', class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
];

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, checkAuth } = useStore();
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

  const handleStartAdd = () => {
    if (checkAuth()) {
      setIsAdding(true);
    }
  };

  const handleStartEdit = (cat: CategoryConfig) => {
    if (checkAuth()) {
      setEditingId(cat.id);
      setForm(cat);
      setIsAdding(true);
    }
  };

  const handleDelete = (id: string) => {
    if (checkAuth()) {
      deleteCategory(id);
    }
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
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Categorías</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base font-light">
            Estructura tu inventario para que la IA clasifique correctamente.
          </p>
        </div>
        
        {!isAdding && (
          <Button 
            onClick={handleStartAdd} 
            icon={<Plus size={20} />} 
            className="shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all"
          >
            Nueva Categoría
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Editor Panel - Dark Matrix Style */}
        {isAdding && (
          <div className="w-full lg:w-1/3 xl:w-1/4 bg-[#111] rounded-3xl p-6 shadow-2xl border border-green-900/30 animate-in slide-in-from-left-4 duration-300 sticky top-4 z-10">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {editingId ? <Edit2 size={16} className="text-green-500" /> : <Plus size={16} className="text-green-500" />}
                {editingId ? 'Editar Categoría' : 'Crear Categoría'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-white bg-black/50 p-2 rounded-full transition-colors border border-white/5 hover:border-white/20">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nombre</label>
                <input 
                  autoFocus
                  placeholder="Ej. Herramientas"
                  className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white placeholder-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all font-medium"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Tipo de Inventario</label>
                <div className="flex bg-black p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => handleTypeChange(false)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${!form.isInternal ? 'bg-[#222] text-green-400 shadow-sm border border-green-900/30' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    <ShoppingBag size={14} /> Venta
                  </button>
                  <button 
                    onClick={() => handleTypeChange(true)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${form.isInternal ? 'bg-[#222] text-green-400 shadow-sm border border-green-900/30' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    <Lock size={14} /> Interno
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Prefijo SKU</label>
                    <input 
                      placeholder="Ej. HER"
                      className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white font-mono focus:border-green-500 outline-none transition-all uppercase text-center"
                      maxLength={3}
                      value={form.prefix}
                      onChange={e => setForm({...form, prefix: e.target.value.toUpperCase()})}
                    />
                 </div>
                 
                 <div className={form.isInternal ? 'opacity-30 pointer-events-none' : ''}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Margen</label>
                    <div className="relative">
                      <input 
                        type="number"
                        disabled={form.isInternal}
                        className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 outline-none transition-all text-right pr-8"
                        value={Math.round((form.margin || 0) * 100)}
                        onChange={e => setForm({...form, margin: parseFloat(e.target.value)/100})}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                        <Percent size={14} />
                      </span>
                    </div>
                 </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2"><Palette size={12}/> Color de Etiqueta</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.label}
                      onClick={() => setForm({...form, color: color.class})}
                      className={`w-8 h-8 rounded-lg border transition-all ${color.class.split(' ')[0]} ${color.class.split(' ')[2]} ${
                        form.color === color.class ? 'ring-2 ring-offset-2 ring-offset-black ring-green-500 scale-110 opacity-100' : 'opacity-40 hover:opacity-80'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                 <Button onClick={handleSave} className="w-full py-3.5 text-sm rounded-xl shadow-lg">
                    {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                 </Button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid List */}
        <div className={`flex-1 w-full ${isAdding ? 'lg:w-2/3 xl:w-3/4' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="group bg-[#111] rounded-2xl p-5 border border-white/5 hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.05)] transition-all duration-300 flex flex-col justify-between h-40 relative overflow-hidden"
              >
                 {/* Background Glow */}
                 <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-20 ${cat.color.split(' ')[0].replace('/10', '/30')}`}></div>

                <div className="flex justify-between items-start z-10">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color} border`}>
                      <span className="text-sm font-bold">{cat.prefix.substring(0, 1)}</span>
                   </div>
                   
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleStartEdit(cat)} 
                        className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)} 
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>

                <div className="z-10">
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-200 text-base truncate group-hover:text-white transition-colors">{cat.name}</h3>
                      {cat.isInternal && (
                        <span className="bg-[#222] text-gray-400 border border-white/5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Lock size={8} />
                        </span>
                      )}
                   </div>
                   
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5 bg-black border border-white/10 px-2 py-1 rounded font-mono text-[10px]">
                         <Tag size={10} className="opacity-50" /> {cat.prefix}
                      </span>
                      {!cat.isInternal && (
                        <span className="flex items-center gap-1">
                          Margen: <span className="text-green-400 font-bold">{(cat.margin * 100).toFixed(0)}%</span>
                        </span>
                      )}
                   </div>
                </div>
              </div>
            ))}
            
            {!isAdding && (
               <button 
                 onClick={handleStartAdd}
                 className="group h-40 rounded-2xl border-2 border-dashed border-gray-800 hover:border-green-500/50 hover:bg-green-900/5 transition-all flex flex-col items-center justify-center gap-3 text-gray-600 hover:text-green-400"
               >
                 <div className="w-12 h-12 rounded-full bg-black border border-gray-800 group-hover:border-green-500/50 flex items-center justify-center transition-colors">
                    <Plus size={20} />
                 </div>
                 <span className="font-medium text-sm">Añadir Categoría</span>
               </button>
            )}
          </div>

          {categories.length === 0 && (
             <div className="text-center py-32 bg-[#111] rounded-3xl border border-dashed border-gray-800 w-full">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600 border border-gray-800">
                   <Tag size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">Sin Categorías</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">Define tus categorías para organizar el inventario y establecer márgenes automáticos.</p>
                <Button onClick={handleStartAdd}>Crear Primera Categoría</Button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
