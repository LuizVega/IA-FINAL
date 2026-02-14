
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Edit2, X, Tag, Lock, ShoppingBag, Percent, Palette, Store, Archive, ArrowRight, Check } from 'lucide-react';
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
      if (confirm('¿Eliminar esta categoría? Los productos asociados podrían quedar sin categoría.')) {
        deleteCategory(id);
      }
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
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Categorías</h2>
          <p className="text-gray-400 mt-2 text-sm max-w-lg leading-relaxed">
            Organiza tu inventario en grupos lógicos. Define márgenes automáticos para ahorrar tiempo al fijar precios.
          </p>
        </div>
        
        {!isAdding && (
          <Button 
            onClick={handleStartAdd} 
            icon={<Plus size={18} strokeWidth={2.5} />} 
            className="rounded-full px-6 py-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105 transition-transform"
          >
            Nueva Categoría
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Editor Panel */}
        {isAdding && (
          <div className="w-full lg:w-[400px] flex-shrink-0 bg-[#121212] rounded-[2rem] p-1 shadow-2xl border border-white/10 animate-in slide-in-from-left-4 duration-500 sticky top-4 z-20">
            <div className="bg-[#1a1a1a] rounded-[1.8rem] p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white pl-1">
                  {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-white bg-black/40 p-2 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                
                {/* 1. Name Input */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre de la Categoría</label>
                  <input 
                    autoFocus
                    placeholder="Ej. Electrónica"
                    className="w-full px-4 py-3.5 bg-black/50 border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all font-medium text-lg"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>

                {/* 2. Type Selection (Cards) */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Tipo de Uso</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => handleTypeChange(false)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group ${
                        !form.isInternal 
                          ? 'bg-green-500/10 border-green-500/50' 
                          : 'bg-black/30 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className={`mb-2 ${!form.isInternal ? 'text-green-400' : 'text-gray-500'}`}>
                        <Store size={24} />
                      </div>
                      <div className={`text-sm font-bold mb-1 ${!form.isInternal ? 'text-white' : 'text-gray-400'}`}>Mercadería</div>
                      <p className="text-[10px] text-gray-500 leading-tight">Visible en tienda. Con precio venta.</p>
                      {!form.isInternal && <div className="absolute top-3 right-3 text-green-500"><Check size={14} strokeWidth={3}/></div>}
                    </div>

                    <div 
                      onClick={() => handleTypeChange(true)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group ${
                        form.isInternal 
                          ? 'bg-blue-500/10 border-blue-500/50' 
                          : 'bg-black/30 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className={`mb-2 ${form.isInternal ? 'text-blue-400' : 'text-gray-500'}`}>
                        <Archive size={24} />
                      </div>
                      <div className={`text-sm font-bold mb-1 ${form.isInternal ? 'text-white' : 'text-gray-400'}`}>Uso Interno</div>
                      <p className="text-[10px] text-gray-500 leading-tight">Insumos y activos. Oculto al cliente.</p>
                      {form.isInternal && <div className="absolute top-3 right-3 text-blue-500"><Check size={14} strokeWidth={3}/></div>}
                    </div>
                  </div>
                </div>

                {/* 3. Settings Grid */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Prefijo SKU</label>
                      <div className="relative">
                        <input 
                          placeholder="ABC"
                          className="w-full px-4 py-3 bg-black/50 border border-white/5 rounded-2xl text-white font-mono text-center focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all uppercase tracking-widest"
                          maxLength={3}
                          value={form.prefix}
                          onChange={e => setForm({...form, prefix: e.target.value.toUpperCase()})}
                        />
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                      </div>
                   </div>
                   
                   <div className={`space-y-2 transition-opacity duration-300 ${form.isInternal ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Margen %</label>
                      <div className="relative">
                        <input 
                          type="number"
                          disabled={form.isInternal}
                          className="w-full px-4 py-3 bg-black/50 border border-white/5 rounded-2xl text-white font-bold text-right pr-10 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                          value={Math.round((form.margin || 0) * 100)}
                          onChange={e => setForm({...form, margin: parseFloat(e.target.value)/100})}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                          <Percent size={14} />
                        </span>
                      </div>
                   </div>
                </div>

                {/* 4. Color Picker */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">Etiqueta Visual</label>
                  <div className="flex flex-wrap gap-2 bg-black/30 p-3 rounded-2xl border border-white/5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.label}
                        onClick={() => setForm({...form, color: color.class})}
                        className={`w-8 h-8 rounded-full border-2 transition-all relative ${color.class.split(' ')[0]} ${color.class.split(' ')[2]} ${
                          form.color === color.class ? 'ring-2 ring-offset-2 ring-offset-[#1a1a1a] ring-white scale-110 opacity-100 border-transparent' : 'opacity-60 hover:opacity-100 border-transparent'
                        }`}
                        title={color.label}
                      >
                        {form.color === color.class && <div className="absolute inset-0 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                   <Button onClick={handleSave} className="w-full py-4 text-sm rounded-2xl shadow-lg font-bold tracking-wide">
                      {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                   </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid List */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="group bg-[#121212] hover:bg-[#181818] rounded-[1.5rem] p-1 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/50 border border-white/5 relative"
              >
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => handleStartEdit(cat)} 
                      className="p-2 bg-black/60 text-white rounded-full hover:bg-green-500 hover:text-black transition-colors backdrop-blur-sm"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      className="p-2 bg-black/60 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors backdrop-blur-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                </div>

                <div className="bg-[#1a1a1a] rounded-[1.3rem] p-5 h-full flex flex-col justify-between overflow-hidden relative">
                   {/* Decorative background blob */}
                   <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-[60px] opacity-10 ${cat.color.split(' ')[0].replace('/10', '')}`}></div>

                   <div>
                      <div className="flex justify-between items-start mb-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color} border shadow-lg`}>
                            <span className="text-lg font-bold">{cat.prefix.substring(0, 1)}</span>
                         </div>
                         
                         {cat.isInternal ? (
                           <div className="bg-[#222] text-gray-400 border border-white/5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                             <Lock size={10} /> Interno
                           </div>
                         ) : (
                           <div className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                             <Store size={10} /> Venta
                           </div>
                         )}
                      </div>

                      <h3 className="font-bold text-white text-lg tracking-tight mb-1">{cat.name}</h3>
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-gray-500 font-mono bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                            {cat.prefix}
                         </span>
                      </div>
                   </div>

                   {!cat.isInternal && (
                     <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium">Margen Ganancia</span>
                        <span className="text-sm font-bold text-white bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                           {(cat.margin * 100).toFixed(0)}%
                        </span>
                     </div>
                   )}
                   
                   {cat.isInternal && (
                     <div className="mt-6 pt-4 border-t border-white/5">
                        <p className="text-[10px] text-gray-600 flex items-center gap-1.5">
                           <Archive size={12}/> Activos fijos / Suministros
                        </p>
                     </div>
                   )}
                </div>
              </div>
            ))}
            
            {/* Add New Card Button */}
            {!isAdding && (
               <button 
                 onClick={handleStartAdd}
                 className="group h-full min-h-[180px] rounded-[1.5rem] border-2 border-dashed border-[#222] hover:border-green-500/30 hover:bg-green-500/5 transition-all flex flex-col items-center justify-center gap-4 text-gray-600 hover:text-green-400"
               >
                 <div className="w-16 h-16 rounded-full bg-[#161616] border border-[#333] group-hover:border-green-500/30 flex items-center justify-center transition-all group-hover:scale-110 shadow-xl">
                    <Plus size={28} />
                 </div>
                 <span className="font-bold text-sm tracking-wide">Crear Categoría</span>
               </button>
            )}
          </div>

          {categories.length === 0 && !isAdding && (
             <div className="flex flex-col items-center justify-center py-20 mt-10 opacity-50">
                <div className="w-20 h-20 bg-[#161616] rounded-full flex items-center justify-center mb-6 border border-white/5">
                   <Tag size={32} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Comienza a organizar</h3>
                <p className="text-gray-500 max-w-sm text-center">Define tus categorías para que la IA pueda clasificar tus productos automáticamente.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
