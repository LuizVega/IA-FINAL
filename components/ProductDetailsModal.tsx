
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Edit, Calendar, DollarSign, Package, ShieldAlert, Clock, QrCode, Barcode, Printer, Lock } from 'lucide-react';
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
  const { categories, settings, setCurrentView, isDemoMode } = useStore();
  const [activeTab, setActiveTab] = useState<'info' | 'qr' | 'barcode'>('info');
  
  useEffect(() => {
      if (isOpen && isDemoMode) {
          // If in demo mode, auto switch to QR to show capability
          setActiveTab('qr');
      } else {
          setActiveTab('info');
      }
  }, [isOpen, isDemoMode]);

  if (!isOpen || !product) return null;

  const isStarter = settings.plan === 'starter';

  const getCategoryColor = (catName: string) => {
    return categories.find(c => c.name === catName)?.color || 'bg-gray-100 text-gray-700';
  };

  const getWarrantyInfo = () => {
    if (!product.supplierWarranty) return null;
    try {
      const date = parseISO(product.supplierWarranty);
      if (!isValid(date)) return null;

      const daysLeft = differenceInDays(date, new Date());
      if (daysLeft < 0) return { label: 'Garantía Vencida', color: 'text-red-600 bg-red-50', icon: ShieldAlert, days: daysLeft };
      if (daysLeft < 30) return { label: 'Vence Pronto', color: 'text-amber-600 bg-amber-50', icon: Clock, days: daysLeft };
      return { label: 'Garantía Vigente', color: 'text-green-600 bg-green-50', icon: ShieldAlert, days: daysLeft };
    } catch (e) {
      return null;
    }
  };

  const warranty = getWarrantyInfo();

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, "d MMM yyyy", { locale: es }) : 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  const handlePrint = (type: 'qr' | 'barcode') => {
      const printWindow = window.open('', '', 'width=400,height=400');
      if (printWindow) {
          const content = type === 'qr' 
            ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({id: product.id, sku: product.sku}))}" style="width:100%;" />`
            : `<div style="font-family: 'Libre Barcode 39', cursive; font-size: 60px; text-align: center;">*${product.sku}*</div><div style="text-align:center; font-family: sans-serif;">${product.sku}</div>`;
            
          printWindow.document.write(`
            <html>
              <head>
                <title>Imprimir Etiqueta</title>
                <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
                <style>
                  body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                  h1 { font-family: sans-serif; font-size: 16px; margin-bottom: 10px; }
                </style>
              </head>
              <body>
                <h1>${product.name}</h1>
                ${content}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          // Delay to allow image/font load
          setTimeout(() => {
              printWindow.print();
              printWindow.close();
          }, 500);
      }
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
          
          <div className="aspect-square bg-black rounded-xl border border-white/10 p-4 mb-6 shadow-inner flex items-center justify-center relative overflow-hidden">
            <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
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
             <Button variant="primary" className="w-full" onClick={() => onEdit(product)} icon={<Edit size={16} />}>
               Editar Item
             </Button>
             <Button variant="ghost" className="w-full" onClick={onClose}>
               Cerrar
             </Button>
          </div>
        </div>

        {/* Right: Stats & Performance */}
        <div className="w-full md:w-2/3 bg-[#111] p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col">
           <div className="hidden md:flex justify-between items-center mb-6">
             <div className="flex gap-4">
                 <button 
                    onClick={() => setActiveTab('info')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'info' ? 'text-green-500 border-green-500' : 'text-gray-500 border-transparent hover:text-white'}`}
                 >
                    Información
                 </button>
                 <button 
                    onClick={() => setActiveTab('qr')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'qr' ? 'text-green-500 border-green-500' : 'text-gray-500 border-transparent hover:text-white'}`}
                 >
                    <QrCode size={16} /> Código QR
                 </button>
                 <button 
                    onClick={() => setActiveTab('barcode')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'barcode' ? 'text-green-500 border-green-500' : 'text-gray-500 border-transparent hover:text-white'}`}
                 >
                    <Barcode size={16} /> Código de Barras
                 </button>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-white bg-[#222] p-2 rounded-full transition-colors">
               <X size={20} />
             </button>
           </div>

           {activeTab === 'info' && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20">
                            <p className="text-xs text-blue-400 font-medium uppercase mb-1 flex items-center gap-1">
                                <DollarSign size={14} /> Precio Actual
                            </p>
                            <p className="text-2xl font-bold text-white">${product.price.toFixed(2)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
                            <p className="text-xs text-purple-400 font-medium uppercase mb-1 flex items-center gap-1">
                                <Package size={14} /> Margen
                            </p>
                            <p className="text-2xl font-bold text-white">
                                {product.price > 0 ? (((product.price - product.cost) / product.cost) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                        {warranty ? (
                            <div className={`p-4 rounded-xl border ${warranty.color.replace('text-', 'border-').replace('600', '500/30')} ${warranty.color.replace('bg-', 'bg-opacity-10 bg-')}`}>
                                <p className="text-xs font-medium uppercase mb-1 flex items-center gap-1 opacity-80">
                                    <warranty.icon size={14} /> {warranty.label}
                                </p>
                                <p className="text-2xl font-bold">
                                    {warranty.days > 0 ? `${warranty.days} Días` : 'Vencida'}
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/10">
                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Garantía</p>
                                <p className="text-lg text-gray-400 font-medium mt-2">No registrada</p>
                            </div>
                        )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="bg-[#161616] rounded-2xl p-6 mb-6 border border-white/5">
                        <h4 className="text-sm font-semibold text-white mb-4">Información de Inventario</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                                <span className="text-gray-500 block text-xs uppercase mb-1">Costo Adquisición</span>
                                <span className="font-medium text-gray-200">${product.cost.toFixed(2)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs uppercase mb-1">Stock Actual</span>
                                <span className="font-bold text-green-400 text-lg">{product.stock} Unidades</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs uppercase mb-1">Fecha de Ingreso</span>
                                <span className="font-medium text-gray-200 flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-500" />
                                    {formatDateSafe(product.entryDate)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs uppercase mb-1">Fecha Registro Sistema</span>
                                <span className="font-medium text-gray-200 flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-500" />
                                    {formatDateSafe(product.createdAt)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs uppercase mb-1">Proveedor</span>
                                <span className="font-medium text-gray-200">{product.supplier || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
               </div>
           )}

           {(activeTab === 'qr' || activeTab === 'barcode') && (
               <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-300 relative">
                   {isStarter && !isDemoMode ? (
                       <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl text-center p-6">
                           <div className="bg-gray-800 p-4 rounded-full mb-4">
                               <Lock size={32} className="text-gray-400" />
                           </div>
                           <h3 className="text-xl font-bold text-white mb-2">Función Premium</h3>
                           <p className="text-gray-400 mb-6 max-w-xs">
                               La generación de etiquetas y códigos QR está disponible en el plan Growth.
                           </p>
                           <Button 
                             onClick={() => { onClose(); setCurrentView('pricing'); }} 
                             className="bg-green-600 hover:bg-green-500 text-black"
                           >
                               Mejorar Plan
                           </Button>
                       </div>
                   ) : null}

                   <div className={`flex flex-col items-center justify-center w-full ${(isStarter && !isDemoMode) ? 'blur-sm opacity-50' : ''}`}>
                       <div className="bg-white p-6 rounded-2xl mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                           {activeTab === 'qr' ? (
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({id: product.id, sku: product.sku, name: product.name}))}`}
                                    alt="QR Code" 
                                    className="w-48 h-48 mix-blend-multiply"
                                />
                           ) : (
                                <div className="flex flex-col items-center p-4">
                                    <div className="h-24 w-64 bg-[repeating-linear-gradient(90deg,black,black_2px,white_2px,white_4px)]"></div>
                                    <p className="text-black font-mono mt-2 tracking-widest">{product.sku}</p>
                                </div>
                           )}
                       </div>
                       <div className="text-center space-y-2">
                           <h3 className="text-xl font-bold text-white">{product.name}</h3>
                           <p className="text-gray-500 font-mono text-sm">{product.sku}</p>
                           <Button variant="secondary" size="sm" className="mt-4" icon={<Printer size={16}/>} onClick={() => (!isStarter || isDemoMode) && handlePrint(activeTab as 'qr' | 'barcode')} disabled={isStarter && !isDemoMode}>
                               Imprimir Etiqueta
                           </Button>
                       </div>
                   </div>
               </div>
           )}

        </div>
      </div>
    </div>
  );
};
