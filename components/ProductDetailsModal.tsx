
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Edit, Calendar, DollarSign, Package, ShieldAlert, Clock, Copy, Check, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import es from 'date-fns/locale/es';
import { useStore } from '../store';
import { ProductImage } from './ProductImage';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose, onEdit }) => {
  const { categories } = useStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const getCategoryColor = (catName: string) => {
    return categories.find(c => c.name === catName)?.color || 'bg-gray-100 text-gray-700';
  };

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, "d MMM yyyy", { locale: es }) : 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  const handleCopyCaption = () => {
      const caption = `✨ ${product.name}\n\n${product.description || ''}\n\n💰 Precio: $${product.price.toFixed(2)}\n📦 Stock disponible: ${product.stock}\n\n📍 Pídelo por DM!`;
      navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px] animate-in fade-in zoom-in-95 duration-200 border border-white/5">
        
        {/* Left: Image & Main Info */}
        <div className="w-full md:w-1/3 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6">
          <div className="flex justify-between items-start mb-4 md:hidden">
            <h2 className="text-lg font-bold text-white">Detalles</h2>
            <button onClick={onClose} className="text-white"><X size={24} /></button>
          </div>
          
          <div className="aspect-square bg-black rounded-xl border border-white/10 p-4 mb-6 shadow-inner flex items-center justify-center relative overflow-hidden group">
            <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
          </div>

          <div className="flex-1">
             <div className="flex flex-wrap gap-2 mb-3">
               <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${getCategoryColor(product.category)}`}>
                  {product.category}
               </span>
               <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-[#222] text-gray-400 border border-gray-600 font-mono">
                  {product.sku}
               </span>
             </div>
             <h2 className="text-xl font-bold text-white leading-tight mb-2">{product.name}</h2>
             <p className="text-sm text-gray-400 line-clamp-4">{product.description}</p>
          </div>

          <div className="mt-6 space-y-3">
             <Button variant="secondary" className="w-full" onClick={() => onEdit(product)} icon={<Edit size={16} />}>
               Editar
             </Button>
             <Button variant="ghost" className="w-full" onClick={onClose}>
               Cerrar
             </Button>
          </div>
        </div>

        {/* Right: Social Selling Tools */}
        <div className="w-full md:w-2/3 bg-[#111] p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col">
           <div className="hidden md:flex justify-end items-center mb-6">
             <button 
                id="tour-close-details"
                onClick={onClose} 
                className="text-gray-400 hover:text-white bg-[#222] p-2 rounded-full transition-colors"
             >
               <X size={20} />
             </button>
           </div>

           <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Social Selling Section */}
                <div className="mb-8 bg-gradient-to-r from-green-900/10 to-black p-6 rounded-2xl border border-green-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles size={18} className="text-green-500" /> Listo para Vender
                    </h3>

                    <div className="bg-[#050505] p-4 rounded-xl border border-white/10 mb-4 text-sm text-gray-300 font-mono relative group">
                        <p>✨ {product.name}</p>
                        <br/>
                        <p>{product.description}</p>
                        <br/>
                        <p>💰 Precio: ${product.price.toFixed(2)}</p>
                        <p>📦 Stock: {product.stock}</p>
                        <br/>
                        <p>📍 Pídelo por DM!</p>
                    </div>

                    <Button 
                        onClick={handleCopyCaption} 
                        className={`w-full ${copied ? 'bg-white text-black' : 'bg-green-600 text-black hover:bg-green-500'} font-bold transition-all`}
                        icon={copied ? <Check size={18} /> : <Copy size={18} />}
                    >
                        {copied ? '¡Copiado!' : 'Copiar Caption para Instagram/WhatsApp'}
                    </Button>
                </div>

                {/* Quick KPIs */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20">
                        <p className="text-xs text-blue-400 font-medium uppercase mb-1 flex items-center gap-1">
                            <DollarSign size={14} /> Precio Venta
                        </p>
                        <p className="text-3xl font-bold text-white">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/10">
                        <p className="text-xs text-gray-500 font-medium uppercase mb-1 flex items-center gap-1">
                            <Package size={14} /> Unidades Físicas
                        </p>
                        <p className="text-3xl font-bold text-white">{product.stock}</p>
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="bg-[#161616] rounded-2xl p-6 mb-6 border border-white/5">
                    <h4 className="text-sm font-semibold text-white mb-4">Detalles Internos</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div>
                            <span className="text-gray-500 block text-xs uppercase mb-1">Costo (Tu inversión)</span>
                            <span className="font-medium text-gray-200">${product.cost.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs uppercase mb-1">Ganancia por Unidad</span>
                            <span className="font-bold text-green-400 text-lg">${(product.price - product.cost).toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs uppercase mb-1">Agregado el</span>
                            <span className="font-medium text-gray-200 flex items-center gap-2">
                                <Calendar size={14} className="text-gray-500" />
                                {formatDateSafe(product.createdAt)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs uppercase mb-1">Proveedor / Origen</span>
                            <span className="font-medium text-gray-200">{product.supplier || 'Propio'}</span>
                        </div>
                    </div>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};
