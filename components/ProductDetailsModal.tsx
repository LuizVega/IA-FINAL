
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Edit, Calendar, DollarSign, Package, ShieldAlert, Clock, Copy, Check, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/95 md:bg-black/80 md:backdrop-blur-sm">
      <div className="bg-[#111] w-full max-w-4xl rounded-t-[32px] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[92vh] md:h-[600px] animate-in slide-in-from-bottom duration-300 border-t md:border border-white/5">

        {/* Header - Mobile Only (Compact) */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 md:hidden shrink-0">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest text-xs opacity-50">Detalles de Producto</h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"><X size={20} /></button>
        </div>

        {/* Left: Image & Main Info */}
        <div className="w-full md:w-1/3 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-4 md:p-6 shrink-0 md:shrink">
          <div className="h-40 md:aspect-square bg-black rounded-xl border border-white/10 p-2 md:p-4 mb-4 md:mb-6 shadow-inner flex items-center justify-center relative overflow-hidden group">
            <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
          </div>

          <div className="flex-1 overflow-hidden shrink-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md border ${getCategoryColor(product.category)}`}>
                {product.category}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md bg-white/5 text-gray-400 border border-white/10 font-mono">
                {product.sku}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-1">{product.name}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 md:line-clamp-4">{product.description}</p>
          </div>

          <div className="mt-4 md:mt-6 space-y-2 md:space-y-3 hidden md:block">
            <Button variant="secondary" className="w-full" onClick={() => onEdit(product)} icon={<Edit size={16} />}>
              Editar
            </Button>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>

        {/* Right: Social Selling Tools & Details */}
        <div className="w-full md:w-2/3 bg-[#111] p-4 md:p-8 overflow-y-auto flex flex-col">
          <div className="hidden md:flex justify-end items-center mb-6">
            <button
              id="tour-close-details"
              onClick={onClose}
              className="text-gray-400 hover:text-white bg-[#222] p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">

            {/* Price & Stock Highlight (Compact for Mobile) */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                <p className="text-[10px] text-green-500 font-black uppercase mb-1 flex items-center gap-1 tracking-widest">
                  <DollarSign size={12} /> Precio Venta
                </p>
                <p className="text-2xl md:text-3xl font-black text-white">${product.price.toFixed(0)}</p>
              </div>
              <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-gray-500 font-black uppercase mb-1 flex items-center gap-1 tracking-widest">
                  <Package size={12} /> Stock Disponible
                </p>
                <p className="text-2xl md:text-3xl font-black text-white">{product.stock}</p>
              </div>
            </div>

            {/* Social Selling Section */}
            <div className="bg-[#050505] p-5 rounded-[24px] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

              <h3 className="text-sm font-black text-white mb-3 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={16} className="text-green-500" /> Caption Lista
              </h3>

              <div className="bg-black/50 p-3 rounded-xl border border-white/5 mb-4 text-xs text-gray-400 font-mono relative group whitespace-pre-wrap leading-relaxed">
                {`✨ ${product.name}

${product.description}

💰 Precio: $${product.price.toFixed(0)}
📦 Stock: ${product.stock}

📍 Pídelo por DM!`}
              </div>

              <Button
                onClick={handleCopyCaption}
                className={`w-full py-3 ${copied ? 'bg-white text-black' : 'bg-[#32D74B] text-black hover:bg-[#32D74B]/90'} font-black text-xs uppercase tracking-widest transition-all rounded-xl`}
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
              >
                {copied ? '¡Copiado!' : 'Copiar para Instagram'}
              </Button>
            </div>

            {/* Metadata Grid */}
            <div className="bg-[#161616] rounded-[24px] p-5 border border-white/5 mb-4">
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Información del Negocio</h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-gray-600 block text-[10px] font-black uppercase tracking-widest mb-1">Costo</span>
                  <span className="font-bold text-gray-300 text-base">${product.cost.toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-gray-600 block text-[10px] font-black uppercase tracking-widest mb-1">Ganancia</span>
                  <span className="font-black text-[#32D74B] text-lg uppercase">${(product.price - product.cost).toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-gray-600 block text-[10px] font-black uppercase tracking-widest mb-1">Agregado</span>
                  <span className="font-bold text-gray-400 text-xs flex items-center gap-1.5 uppercase">
                    <Calendar size={12} className="text-gray-600" />
                    {formatDateSafe(product.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block text-[10px] font-black uppercase tracking-widest mb-1">Proveedor</span>
                  <span className="font-bold text-gray-400 text-xs uppercase truncate">{product.supplier || 'Propio'}</span>
                </div>
              </div>
            </div>

            {/* Mobile Actions (Visible Only on Mobile) */}
            <div className="grid grid-cols-2 gap-3 md:hidden pt-4 pb-10">
              <Button variant="secondary" className="w-full rounded-xl py-4 font-black uppercase tracking-widest text-xs" onClick={() => onEdit(product)} icon={<Edit size={16} />}>
                Editar
              </Button>
              <Button variant="ghost" className="w-full rounded-xl py-4 font-black uppercase tracking-widest text-xs border border-white/5" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
