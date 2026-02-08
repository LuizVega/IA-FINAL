import React from 'react';
import { Product } from '../types';
import { X, Edit, Calendar, TrendingUp, DollarSign, Package, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from './ui/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore } from '../store';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose, onEdit }) => {
  const { categories } = useStore();
  
  if (!isOpen || !product) return null;

  const getCategoryColor = (catName: string) => {
    return categories.find(c => c.name === catName)?.color || 'bg-gray-100 text-gray-700';
  };

  // Mock data for charts
  const history = [
    { month: 'Ene', price: product.price * 0.9 },
    { month: 'Feb', price: product.price * 0.95 },
    { month: 'Mar', price: product.price * 0.92 },
    { month: 'Abr', price: product.price * 0.98 },
    { month: 'May', price: product.price },
  ];

  const maxPrice = Math.max(...history.map(h => h.price)) * 1.1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left: Image & Main Info */}
        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 flex flex-col p-6">
          <div className="flex justify-between items-start mb-4 md:hidden">
            <h2 className="text-lg font-bold">Detalles</h2>
            <button onClick={onClose}><X size={24} /></button>
          </div>
          
          <div className="aspect-square bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex items-center justify-center relative">
            <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
            {product.abcClass && (
              <div className="absolute top-2 right-2 flex flex-col items-end">
                <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full border shadow-sm ${
                    product.abcClass === 'A' ? 'bg-green-100 text-green-700 border-green-200' :
                    product.abcClass === 'B' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {product.abcClass}
                </span>
                <span className="text-[10px] text-gray-500 font-medium mt-1">Clase {product.abcClass}</span>
              </div>
            )}
          </div>

          <div className="flex-1">
             <div className="flex flex-wrap gap-2 mb-3">
               <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${getCategoryColor(product.category)}`}>
                  {product.category}
               </span>
               <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-gray-200 text-gray-600 border border-gray-300">
                  {product.sku}
               </span>
             </div>
             <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h2>
             <p className="text-sm text-gray-500 line-clamp-4">{product.description}</p>
          </div>

          <div className="mt-6 space-y-3">
             <Button variant="primary" className="w-full" onClick={() => onEdit(product)} icon={<Edit size={16} />}>
               Editar Item
             </Button>
             <Button variant="ghost" className="w-full" onClick={onClose}>
               Cerrar
             </Button>
          </div>
        </div>

        {/* Right: Stats & Performance */}
        <div className="w-full md:w-2/3 bg-white p-6 md:p-8 overflow-y-auto custom-scrollbar">
           <div className="hidden md:flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <Activity className="text-blue-500" /> Rendimiento y Estadísticas
             </h3>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
               <X size={20} />
             </button>
           </div>

           {/* KPIs */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
             <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
               <p className="text-xs text-blue-600 font-medium uppercase mb-1 flex items-center gap-1">
                 <DollarSign size={14} /> Precio Actual
               </p>
               <p className="text-2xl font-bold text-blue-900">${product.price.toFixed(2)}</p>
               <p className="text-xs text-blue-600/70 mt-1 flex items-center">
                 <ArrowUpRight size={12} className="mr-1" /> +2.5% vs mes pasado
               </p>
             </div>
             <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
               <p className="text-xs text-purple-600 font-medium uppercase mb-1 flex items-center gap-1">
                 <Package size={14} /> Margen
               </p>
               <p className="text-2xl font-bold text-purple-900">
                 {product.price > 0 ? (((product.price - product.cost) / product.cost) * 100).toFixed(1) : 0}%
               </p>
               <p className="text-xs text-purple-600/70 mt-1">
                 ${(product.price - product.cost).toFixed(2)} ganancia neta
               </p>
             </div>
             <div className="p-4 rounded-xl bg-green-50 border border-green-100 hidden md:block">
                <p className="text-xs text-green-600 font-medium uppercase mb-1 flex items-center gap-1">
                  <TrendingUp size={14} /> Clasificación
                </p>
                <p className="text-2xl font-bold text-green-900">Clase {product.abcClass || 'C'}</p>
                <p className="text-xs text-green-600/70 mt-1">
                  Basado en valor
                </p>
             </div>
           </div>

           {/* Chart */}
           <div className="mb-8">
             <h4 className="text-sm font-semibold text-gray-900 mb-4">Historial de Precios</h4>
             <div className="h-40 flex items-end gap-2 border-b border-gray-200 pb-2">
                {history.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="relative w-full flex justify-center">
                       <div 
                        className="w-full bg-blue-100 rounded-t-sm hover:bg-blue-500 transition-all duration-300 relative group-hover:shadow-lg"
                        style={{ height: `${(point.price / maxPrice) * 100}%` }}
                       ></div>
                       <div className="absolute -top-8 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                         ${point.price.toFixed(2)}
                       </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{point.month}</span>
                  </div>
                ))}
             </div>
           </div>

           {/* Metadata */}
           <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs uppercase mb-1">Costo Adquisición</span>
                  <span className="font-medium text-gray-900">${product.cost.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase mb-1">Fecha Registro</span>
                  <span className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {format(new Date(product.createdAt), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
                <div>
                   <span className="text-gray-500 block text-xs uppercase mb-1">Nivel Confianza IA</span>
                   <div className="flex items-center gap-2">
                     <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500" style={{ width: `${(product.confidence || 0) * 100}%` }}></div>
                     </div>
                     <span className="text-gray-900 font-medium">{Math.round((product.confidence || 0) * 100)}%</span>
                   </div>
                </div>
                <div>
                   <span className="text-gray-500 block text-xs uppercase mb-1">Proveedor</span>
                   <span className="font-medium text-gray-900">{product.supplier || 'N/A'}</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
