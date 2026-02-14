
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

  // Adjust position to keep menu in viewport (basic logic)
  const style: React.CSSProperties = {
    top: y,
    left: x,
  };

  return (
    <div 
      ref={menuRef}
      style={style} 
      className="fixed z-50 bg-[#161616]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl min-w-[200px] py-2 text-gray-200 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 ease-out origin-top-left"
    >
      {type === 'background' && (
        <>
          <button 
            onClick={() => onAction('new-folder')} 
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
          >
            <FolderPlus size={16} className="text-blue-400"/> Nueva Sección
          </button>
          <button 
            onClick={() => onAction('new-item')} 
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
          >
            <FilePlus size={16} className="text-green-400"/> Nuevo Item
          </button>
        </>
      )}

      {(type === 'folder' || type === 'item') && (
        <>
          {/* MOVE OPTION: Only for ITEMS */}
          {type === 'item' && (
            <button 
              onClick={() => onAction('move')} 
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
            >
              <FolderInput size={16} className="text-yellow-400"/> Mover a...
            </button>
          )}
          
          <button 
            onClick={() => onAction('edit')} 
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Edit size={16} className="text-blue-400"/> Editar
          </button>
          
          <div className="h-px bg-white/10 my-1 mx-2"></div>
          
          <button 
            onClick={() => onAction('delete')} 
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-3 transition-colors"
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </>
      )}
    </div>
  );
};
