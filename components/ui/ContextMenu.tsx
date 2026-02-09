import React, { useEffect, useRef } from 'react';
import { FolderPlus, FilePlus, Edit, Trash2, FolderInput } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'background' | 'folder' | 'item';
  onClose: () => void;
  onAction: (action: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, type, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const style = {
    top: y,
    left: x,
  };

  return (
    <div 
      ref={menuRef}
      style={style} 
      className="fixed z-50 bg-[#161616] border border-green-900/40 rounded-lg shadow-2xl min-w-[200px] py-1.5 animate-in fade-in zoom-in-95 duration-100 text-gray-200"
    >
      {type === 'background' && (
        <>
          <button 
            onClick={() => onAction('new-folder')} 
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-600/10 hover:text-green-400 flex items-center gap-2 transition-colors"
          >
            <FolderPlus size={16} /> Nueva carpeta
          </button>
          <button 
            onClick={() => onAction('new-item')} 
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-600/10 hover:text-green-400 flex items-center gap-2 transition-colors"
          >
            <FilePlus size={16} /> Nuevo item
          </button>
        </>
      )}

      {(type === 'folder' || type === 'item') && (
        <>
          <button 
            onClick={() => onAction('move')} 
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-600/10 hover:text-green-400 flex items-center gap-2 transition-colors"
          >
            <FolderInput size={16} /> Mover a...
          </button>
          <button 
            onClick={() => onAction('edit')} 
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-600/10 hover:text-green-400 flex items-center gap-2 transition-colors"
          >
            <Edit size={16} /> Editar
          </button>
          <div className="h-px bg-white/10 my-1"></div>
          <button 
            onClick={() => onAction('delete')} 
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </>
      )}
    </div>
  );
};
