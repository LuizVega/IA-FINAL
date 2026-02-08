import React from 'react';
import { Tag } from 'lucide-react';

export const TagsView: React.FC = () => {
  return (
    <div className="p-6 flex flex-col items-center justify-center h-full text-gray-400">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <Tag size={40} className="text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-600">Etiquetas</h2>
      <p>Próximamente: Organiza tus items con etiquetas personalizadas.</p>
    </div>
  );
};
