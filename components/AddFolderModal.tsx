
import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { Folder, X, Store, Archive, Check, Tag, Percent } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  { label: 'Naranja', class: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { label: 'Verde', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { label: 'Azul', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'Púrpura', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { label: 'Rosa', class: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { label: 'Gris', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
];

export const AddFolderModal: React.FC<AddFolderModalProps> = ({ isOpen, onClose }) => {
  const { addFolder, currentFolderId } = useStore();
  
  // Extended State
  const [name, setName] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [margin, setMargin] = useState(0.30);
  const [color, setColor] = useState(PRESET_COLORS[5].class);

  const handleSave = () => {
    if (!name.trim()) return;

    const newFolder: FolderType = {
      id: crypto.randomUUID(),
      name: name,
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
      // New Properties
      isInternal,
      prefix: prefix.toUpperCase() || name.substring(0,3).toUpperCase(),
      margin,
      color
    };

    addFolder(newFolder);
    
    // Reset
    setName('');
    setIsInternal(false);
    setPrefix('');
    setMargin(0.30);
    setColor(PRESET_COLORS[5].class);
    
    onClose();
  };

  const handleTypeChange = (internal: boolean) => {
      setIsInternal(internal);
      if (internal) setMargin(0);
      else if (margin === 0) setMargin(0.30);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden p-1 animate-in fade-in zoom-in-95 duration-200 border border-white/10">
        <div className="bg-[#161616] rounded-[1.8rem] p-6 h-full flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="bg-white/10 p-2 rounded-xl text-white">
                  <Folder size={20} />
                </div>
                Nueva Sección
              </h3>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* 1. Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre</label>
                <input 
                  type="text" 
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Herramientas, Limpieza..."
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/5 rounded-2xl text-white font-medium focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all placeholder-gray-700 text-lg"
                />
              </div>

              {/* 2. Type Selection */}
              <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Tipo de Almacenamiento</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => handleTypeChange(false)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group ${
                        !isInternal 
                          ? 'bg-green-500/10 border-green-500/50' 
                          : 'bg-black/30 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className={`mb-2 ${!isInternal ? 'text-green-400' : 'text-gray-500'}`}>
                        <Store size={24} />
                      </div>
                      <div className={`text-sm font-bold mb-1 ${!isInternal ? 'text-white' : 'text-gray-400'}`}>Mercadería</div>
                      <p className="text-[10px] text-gray-500 leading-tight">Visible en tienda. Se vende al público.</p>
                      {!isInternal && <div className="absolute top-3 right-3 text-green-500"><Check size={14} strokeWidth={3}/></div>}
                    </div>

                    <div 
                      onClick={() => handleTypeChange(true)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group ${
                        isInternal 
                          ? 'bg-blue-500/10 border-blue-500/50' 
                          : 'bg-black/30 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className={`mb-2 ${isInternal ? 'text-blue-400' : 'text-gray-500'}`}>
                        <Archive size={24} />
                      </div>
                      <div className={`text-sm font-bold mb-1 ${isInternal ? 'text-white' : 'text-gray-400'}`}>Uso Interno</div>
                      <p className="text-[10px] text-gray-500 leading-tight">Insumos, activos y suministros. Oculto.</p>
                      {isInternal && <div className="absolute top-3 right-3 text-blue-500"><Check size={14} strokeWidth={3}/></div>}
                    </div>
                  </div>
              </div>

              {/* 3. Settings */}
              <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Prefijo Código</label>
                      <div className="relative">
                        <input 
                          placeholder="ABC"
                          className="w-full px-4 py-3 bg-black/50 border border-white/5 rounded-2xl text-white font-mono text-center focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all uppercase tracking-widest"
                          maxLength={3}
                          value={prefix}
                          onChange={e => setPrefix(e.target.value.toUpperCase())}
                        />
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                      </div>
                   </div>
                   
                   <div className={`space-y-2 transition-opacity duration-300 ${isInternal ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Margen %</label>
                      <div className="relative">
                        <input 
                          type="number"
                          disabled={isInternal}
                          className="w-full px-4 py-3 bg-black/50 border border-white/5 rounded-2xl text-white font-bold text-right pr-10 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                          value={Math.round(margin * 100)}
                          onChange={e => setMargin(parseFloat(e.target.value)/100)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                          <Percent size={14} />
                        </span>
                      </div>
                   </div>
              </div>

              {/* 4. Color */}
              <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">Color Etiqueta</label>
                  <div className="flex flex-wrap gap-2 bg-black/30 p-3 rounded-2xl border border-white/5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.label}
                        onClick={() => setColor(c.class)}
                        className={`w-8 h-8 rounded-full border-2 transition-all relative ${c.class.split(' ')[0]} ${c.class.split(' ')[2]} ${
                          color === c.class ? 'ring-2 ring-offset-2 ring-offset-[#1a1a1a] ring-white scale-110 opacity-100 border-transparent' : 'opacity-60 hover:opacity-100 border-transparent'
                        }`}
                        title={c.label}
                      >
                        {color === c.class && <div className="absolute inset-0 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                      </button>
                    ))}
                  </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave} className="px-8 shadow-lg">Crear Sección</Button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
