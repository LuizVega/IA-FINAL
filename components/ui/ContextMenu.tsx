import React, { useEffect, useRef } from 'react';
import { FolderPlus, FilePlus, Edit, Trash2 } from 'lucide-react';

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
      className="fixed z-50 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-lg shadow-xl min-w-[200px] py-1.5 animate-in fade-in zoom-in-95 duration-100"
    >
      {type === 'background' && (
        <>
          <button 
            onClick={() => onAction('new-folder')} 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
          >
            <FolderPlus size={16} /> Nueva carpeta
          </button>
          <button 
            onClick={() => onAction('new-item')} 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
          >
            <FilePlus size={16} /> Nuevo item
          </button>
        </>
      )}

      {(type === 'folder' || type === 'item') && (
        <>
          <button 
            onClick={() => onAction('edit')} 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
          >
            <Edit size={16} /> Editar
          </button>
          <div className="h-px bg-gray-200 my-1"></div>
          <button 
            onClick={() => onAction('delete')} 
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </>
      )}
    </div>
  );
};
