import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { Folder, X } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string | null;
}

export const EditFolderModal: React.FC<EditFolderModalProps> = ({ isOpen, onClose, folderId }) => {
  const [name, setName] = useState('');
  const { folders, updateFolder } = useStore();

  useEffect(() => {
    if (isOpen && folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) setName(folder.name);
    }
  }, [isOpen, folderId, folders]);

  const handleSave = () => {
    if (!name.trim() || !folderId) return;
    updateFolder(folderId, { name });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
              <Folder size={18} />
            </div>
            Editar Carpeta
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              type="text" 
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose} size="sm">Cancelar</Button>
            <Button variant="primary" onClick={handleSave} size="sm">Guardar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
