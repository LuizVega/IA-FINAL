import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { Folder, X, FolderOpen, ArrowRight } from 'lucide-react';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemType: 'folder' | 'item';
}

export const MoveModal: React.FC<MoveModalProps> = ({ isOpen, onClose, itemId, itemType }) => {
  const { folders, moveProduct, moveFolder } = useStore();
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  if (!isOpen || !itemId) return null;

  // Filter folders to prevent moving a folder into itself or its children (basic circular check)
  const availableFolders = folders.filter(f => {
    if (itemType === 'folder') {
      return f.id !== itemId; // Cannot move into self. (Deep circular check omitted for brevity in MVP)
    }
    return true;
  });

  const handleMove = () => {
    if (itemType === 'item') {
      moveProduct(itemId, targetFolderId);
    } else {
      moveFolder(itemId, targetFolderId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111111] w-full max-w-md rounded-2xl shadow-2xl border border-green-900/30 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#161616]">
          <h3 className="text-lg font-semibold text-green-500 flex items-center gap-2">
            <FolderOpen size={20} />
            Mover {itemType === 'item' ? 'Item' : 'Carpeta'} a...
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-2">
            {/* Root Option */}
            <button
              onClick={() => setTargetFolderId(null)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all border ${
                targetFolderId === null 
                  ? 'bg-green-900/20 border-green-600 text-green-400' 
                  : 'bg-[#1a1a1a] border-white/5 text-gray-300 hover:bg-[#222]'
              }`}
            >
              <div className={`p-2 rounded-md ${targetFolderId === null ? 'bg-green-600 text-black' : 'bg-gray-800 text-gray-400'}`}>
                <FolderOpen size={18} />
              </div>
              <span className="font-medium">Inicio (Raíz)</span>
              {targetFolderId === null && <ArrowRight size={16} className="ml-auto" />}
            </button>

            {/* Other Folders */}
            {availableFolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setTargetFolderId(folder.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all border ${
                  targetFolderId === folder.id 
                    ? 'bg-green-900/20 border-green-600 text-green-400' 
                    : 'bg-[#1a1a1a] border-white/5 text-gray-300 hover:bg-[#222]'
                }`}
              >
                <div className={`p-2 rounded-md ${targetFolderId === folder.id ? 'bg-green-600 text-black' : 'bg-gray-800 text-gray-400'}`}>
                  <Folder size={18} />
                </div>
                <div className="text-left">
                  <span className="font-medium block">{folder.name}</span>
                  {/* Show path hint if possible, here simple */}
                  <span className="text-[10px] text-gray-500">
                     {folder.parentId ? 'Subcarpeta' : 'Carpeta Principal'}
                  </span>
                </div>
                {targetFolderId === folder.id && <ArrowRight size={16} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#161616] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} size="sm">Cancelar</Button>
          <Button variant="primary" onClick={handleMove} size="sm">
            Mover Aquí
          </Button>
        </div>
      </div>
    </div>
  );
};
