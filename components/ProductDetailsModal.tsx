
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
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 md:backdrop-blur-md transition-all">
      {/* Main Card Container */}
      <div className="relative w-full max-w-[360px] rounded-[20px] p-6 text-white shadow-2xl overflow-hidden flex flex-col bg-[#141414]/95 backdrop-blur-md border border-white/10" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>

        {/* Header Controls */}
        <header className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </header>

        {/* Product Image Section */}
        <section className="relative mb-4 mt-2 flex justify-center w-full">
          <div className="relative">
            {/* Image Container */}
            <div className="w-56 h-56 rounded-lg overflow-hidden flex items-center justify-center bg-black/20">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none"></div>
              <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl z-10" />
            </div>

            {/* Floating Action Button (Edit) */}
            <button
              onClick={() => onEdit(product)}
              className="absolute -bottom-4 right-2 w-12 h-12 bg-[#00E054] rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform z-20"
              style={{ boxShadow: '0 4px 14px 0 rgba(0, 224, 84, 0.39)' }}
              aria-label="Edit Product"
            >
              <Edit size={18} />
            </button>
          </div>
        </section>

        {/* Product Info Summary */}
        <section className="mt-2 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/10 text-gray-300 border border-white/5">
              {product.category || 'General'}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {product.sku}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight mb-2">
            {product.name}
          </h1>
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
            {product.description || 'Sin descripción detallada.'}
          </p>
        </section>

        {/* Key Metrics Grid */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          {/* Price Metric */}
          <div className="bg-[#1C1C1E] rounded-xl p-4 border border-white/5 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#00E054]/5 rounded-full blur-xl -mr-8 -mt-8"></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <DollarSign size={12} className="text-[#00E054]" />
              Precio Venta
            </p>
            <p className="text-2xl font-black text-white">${product.price.toFixed(2)}</p>
          </div>

          {/* Stock Metric */}
          <div className="bg-[#1C1C1E] rounded-xl p-4 border border-white/5 flex flex-col justify-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Package size={12} />
              Unidades
            </p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-black text-white">{product.stock}</p>
              <span className={`text-[10px] pb-1 ${product.stock > 0 ? 'text-[#00E054]' : 'text-red-500'}`}>
                {product.stock > 0 ? 'En stock' : 'Agotado'}
              </span>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="mt-auto flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-[#1C1C1E] text-white text-sm font-bold border border-white/10 hover:bg-[#2C2C2E] transition-colors"
          >
            Cerrar
          </button>
        </section>
      </div>
    </div>
  );
};
