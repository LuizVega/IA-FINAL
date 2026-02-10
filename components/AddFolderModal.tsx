
import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { Folder, X } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFolderModal: React.FC<AddFolderModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const { addFolder, currentFolderId } = useStore();

  const handleSave = () => {
    if (!name.trim()) return;

    const newFolder: FolderType = {
      id: crypto.randomUUID(),
      name: name,
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
    };

    addFolder(newFolder);
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="bg-green-900/20 p-1.5 rounded-lg text-green-500">
              <Folder size={18} />
            </div>
            Nueva Carpeta
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
            <input 
              type="text" 
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Almacén 2"
              className="w-full px-4 py-2.5 bg-[#050505] border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-600"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose} size="sm">Cancelar</Button>
            <Button variant="primary" onClick={handleSave} size="sm">Crear Carpeta</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
