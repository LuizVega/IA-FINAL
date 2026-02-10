
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, Search, Tag, DollarSign, PenTool, MousePointer2, RefreshCw, Calendar, ShieldAlert, ChevronDown, ChevronUp, Box, Lock, Crown } from 'lucide-react';
import { Button } from './ui/Button';
import { analyzeImage, analyzeProductByName, generateSku } from '../services/geminiService';
import { useStore } from '../store';
import { Product } from '../types';
import { format, addMonths, isValid, parseISO } from 'date-fns';
import { DEFAULT_PRODUCT_IMAGE } from '../constants';
import { ProductImage } from './ProductImage';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProduct?: Product | null;
}

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, editProduct }) => {
  const [step, setStep] = useState<'upload' | 'crop' | 'analyzing' | 'confirm'>('confirm'); // Default to form view directly
  
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const [analysis, setAnalysis] = useState<Partial<Product> | null>(null);
  const [manualName, setManualName] = useState('');
  const [costInput, setCostInput] = useState<string>('');
  const [priceInput, setPriceInput] = useState<string>('');
  const [skuInput, setSkuInput] = useState<string>('');
  const [stockInput, setStockInput] = useState<string>('0');
  
  // Date Fields
  const [entryDate, setEntryDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [warrantyDate, setWarrantyDate] = useState<string>('');
  
  // Advanced Toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const { inventory, addProduct, updateProduct, currentFolderId, categories, settings, setCurrentView } = useStore();

  const isPlanLimitReached = !editProduct && settings.plan === 'starter' && inventory.length >= 50;

  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        // Edit Mode
        setStep('confirm');
        setOriginalImage(editProduct.imageUrl);
        setAnalysis({
          name: editProduct.name,
          category: editProduct.category,
          description: editProduct.description,
          confidence: editProduct.confidence
        });
        setManualName(editProduct.name);
        setCostInput(editProduct.cost.toString());
        setPriceInput(editProduct.price.toString());
        setSkuInput(editProduct.sku);
        setStockInput(editProduct.stock.toString());
        
        let safeEntryDate = format(new Date(), 'yyyy-MM-dd');
        if (editProduct.entryDate) {
          try {
             const parsed = parseISO(editProduct.entryDate);
             if (isValid(parsed)) safeEntryDate = format(parsed, 'yyyy-MM-dd');
          } catch(e) {}
        }
        setEntryDate(safeEntryDate);

        let safeWarrantyDate = '';
        if (editProduct.supplierWarranty) {
           try {
              const parsed = parseISO(editProduct.supplierWarranty);
              if (isValid(parsed)) safeWarrantyDate = format(parsed, 'yyyy-MM-dd');
           } catch(e) {}
        }
        setWarrantyDate(safeWarrantyDate);

      } else {
        // New Mode
        resetForm();
      }
    }
  }, [isOpen, editProduct]);

  // ... (Effects for Cost/SKU remain same) ...
  useEffect(() => {
    if (step === 'confirm' && costInput && analysis?.category) {
      const cost = parseFloat(costInput);
      const categoryConfig = categories.find(c => c.name === analysis?.category);
      if (!isNaN(cost) && categoryConfig) {
        const margin = categoryConfig.margin;
        const suggested = cost * (1 + margin);
        if (!priceInput || (!editProduct && priceInput)) {
             setPriceInput(suggested.toFixed(2));
        }
      }
    }
  }, [costInput, analysis?.category, step, categories]);

  useEffect(() => {
     if (step === 'confirm' && analysis?.category && !editProduct) {
        const categoryConfig = categories.find(c => c.name === analysis?.category);
        if (categoryConfig) {
           const newSku = generateSku(analysis.category, manualName, inventory.length, categoryConfig.prefix);
           setSkuInput(newSku);
        }
     }
  }, [analysis?.category, step, manualName, categories]);

  const resetForm = () => {
    setStep('confirm'); 
    setOriginalImage(DEFAULT_PRODUCT_IMAGE);
    setCroppedImage(null);
    setCropBox(null);
    setAnalysis({
      category: categories[0]?.name || 'General',
      confidence: 1
    });
    setManualName('');
    setCostInput('');
    setPriceInput('');
    setStockInput('1');
    setSkuInput('');
    setEntryDate(format(new Date(), 'yyyy-MM-dd'));
    setWarrantyDate('');
    setShowAdvanced(false);
    setIsCameraOpen(false);
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      alert("No se pudo acceder a la cámara");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setOriginalImage(canvas.toDataURL('image/jpeg'));
      stopCamera();
      setStep('crop');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalImage(ev.target?.result as string);
        setStep('crop');
      };
      reader.readAsDataURL(file);
    }
  };

  // ... (Cropping logic hidden for brevity) ...
  const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); if (!containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; setStartPos({ x, y }); setCropBox({ x, y, width: 0, height: 0 }); setIsDragging(true); };
  const handleMouseMove = (e: React.MouseEvent) => { e.preventDefault(); if (!isDragging || !containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); const currentX = e.clientX - rect.left; const currentY = e.clientY - rect.top; const width = Math.abs(currentX - startPos.x); const height = Math.abs(currentY - startPos.y); const x = Math.min(currentX, startPos.x); const y = Math.min(currentY, startPos.y); const containerWidth = containerRef.current.offsetWidth; const containerHeight = containerRef.current.offsetHeight; const safeX = Math.max(0, Math.min(x, containerWidth - width)); const safeY = Math.max(0, Math.min(y, containerHeight - height)); setCropBox({ x: safeX, y: safeY, width, height }); };
  const handleMouseUp = () => setIsDragging(false);

  const confirmSelection = async () => {
    if (!originalImage || !imageRef.current || !cropBox || cropBox.width < 10) {
      handleAnalysis(originalImage!);
      return;
    }
    const img = imageRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const canvas = document.createElement('canvas');
    canvas.width = cropBox.width * scaleX;
    canvas.height = cropBox.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, cropBox.x * scaleX, cropBox.y * scaleY, cropBox.width * scaleX, cropBox.height * scaleY, 0, 0, canvas.width, canvas.height);
      const croppedDataUrl = canvas.toDataURL('image/jpeg');
      setCroppedImage(croppedDataUrl);
      handleAnalysis(croppedDataUrl);
    }
  };

  const handleAnalysis = async (imageDataUrl: string) => {
    setStep('analyzing');
    const base64Data = imageDataUrl.split(',')[1];
    try {
      const result = await analyzeImage(base64Data);
      setAnalysis({
        name: result.name,
        category: result.category,
        description: result.description,
        imageUrl: imageDataUrl,
        confidence: result.confidence
      });
      if (result.confidence && result.confidence < 0.4) { setManualName(""); } 
      else { setManualName(result.name); }
      setStep('confirm');
    } catch (error) {
      alert("Error en análisis.");
      setStep('confirm');
    }
  };

  const setWarrantyMonths = (months: number) => {
     let start = new Date();
     if (entryDate) {
         const parsed = new Date(entryDate);
         if (!isNaN(parsed.getTime())) start = parsed;
     }
     
     const end = addMonths(start, months);
     setWarrantyDate(format(end, 'yyyy-MM-dd'));
  };

  const handleSave = () => {
    if (!analysis) return;
    const cost = parseFloat(costInput) || 0;
    const price = parseFloat(priceInput) || 0;
    const stock = parseInt(stockInput) || 0;
    
    let entryDateIso = new Date().toISOString();
    try {
        const d = new Date(entryDate);
        if (!isNaN(d.getTime())) entryDateIso = d.toISOString();
    } catch(e) {}

    let warrantyIso: string | undefined = undefined;
    try {
        if (warrantyDate) {
             const d = new Date(warrantyDate);
             if (!isNaN(d.getTime())) warrantyIso = d.toISOString();
        }
    } catch(e) {}

    const productData: Product = {
      id: editProduct ? editProduct.id : crypto.randomUUID(),
      name: manualName || analysis.name || 'Producto Nuevo',
      category: analysis.category || 'General',
      sku: skuInput,
      description: analysis.description,
      imageUrl: croppedImage || analysis.imageUrl || originalImage || DEFAULT_PRODUCT_IMAGE,
      confidence: analysis.confidence,
      cost: cost,
      price: price,
      supplier: '',
      createdAt: editProduct ? editProduct.createdAt : new Date().toISOString(),
      entryDate: entryDateIso,
      supplierWarranty: warrantyIso,
      folderId: editProduct ? editProduct.folderId : currentFolderId,
      stock: stock,
      tags: editProduct ? editProduct.tags : [],
    };

    if (editProduct) {
      updateProduct(editProduct.id, productData);
    } else {
      addProduct(productData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="bg-[#111] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/5 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#161616]">
          <h2 className="text-lg font-semibold text-white tracking-tight">
            {isPlanLimitReached ? 'Límite Alcanzado' : (
                editProduct ? 'Editar Producto' : 
                step === 'upload' ? 'Seleccionar Imagen' :
                step === 'crop' ? 'Seleccionar Objeto' :
                step === 'analyzing' ? 'Analizando...' : 'Agregar Nuevo Item'
            )}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#050505] h-full text-gray-300">
          
          {/* PLAN LIMIT REACHED STATE */}
          {isPlanLimitReached ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[400px]">
                  <div className="bg-orange-900/10 p-6 rounded-full border border-orange-500/20 mb-6 relative">
                      <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse"></div>
                      <Lock size={48} className="text-orange-500 relative z-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">¡Límite de Plan Alcanzado!</h3>
                  <p className="text-gray-400 max-w-sm mb-8">
                      Has alcanzado el límite de 50 items del plan Starter. Para seguir creciendo, actualiza a Growth.
                  </p>
                  <Button 
                    onClick={() => { onClose(); setCurrentView('pricing'); }}
                    className="bg-green-600 hover:bg-green-500 text-black px-8 py-3 font-bold"
                    icon={<Crown size={18}/>}
                  >
                      Ver Planes y Mejorar
                  </Button>
              </div>
          ) : (
            <>
                {/* Upload Step */}
                {step === 'upload' && (
                    <div className="p-8 flex flex-col gap-8 h-full items-center justify-center">
                    {!isCameraOpen ? (
                        <>
                        <div 
                            className="w-full max-w-md aspect-video border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-green-500 hover:bg-green-500/5 transition-all cursor-pointer group bg-[#111]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="bg-[#222] p-4 rounded-full shadow-sm group-hover:scale-110 transition-all">
                            <Upload className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="text-center">
                            <p className="font-medium text-white">Subir una foto</p>
                            <p className="text-sm text-gray-500 mt-1">Arrastra o haz clic</p>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                        
                        <div className="flex items-center gap-4 w-full max-w-md">
                            <div className="h-px bg-gray-800 flex-1"></div>
                            <span className="text-sm text-gray-600 font-medium">O</span>
                            <div className="h-px bg-gray-800 flex-1"></div>
                        </div>

                        <Button variant="primary" onClick={startCamera} icon={<Camera size={18} />} className="w-full max-w-md py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                            Abrir Cámara
                        </Button>
                        </>
                    ) : (
                        <div className="relative w-full h-full bg-black flex flex-col items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        <div className="absolute bottom-8 flex gap-6">
                            <button onClick={stopCamera} className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/30 transition-all">
                            <X size={24} />
                            </button>
                            <button onClick={capturePhoto} className="bg-white rounded-full p-1.5 border-4 border-white/30 shadow-lg">
                            <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-300"></div>
                            </button>
                        </div>
                        </div>
                    )}
                    </div>
                )}

                {/* Crop Step */}
                {step === 'crop' && originalImage && (
                    <div className="flex flex-col h-full">
                    <div className="flex-1 bg-black relative overflow-hidden select-none flex items-center justify-center">
                        <img ref={imageRef} src={originalImage} alt="Crop" className="max-h-[60vh]" />
                    </div>
                    <div className="p-4 bg-[#161616] flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setStep('confirm')}>Cancelar</Button>
                        <Button variant="primary" onClick={confirmSelection}>Usar Imagen</Button>
                    </div>
                    </div>
                )}

                {/* Analyzing Step */}
                {step === 'analyzing' && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-green-900 rounded-full animate-ping absolute"></div>
                        <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin relative z-10"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-8">Analizando...</h3>
                    </div>
                )}

                {/* CONFIRM / FORM STEP (Main View) */}
                {step === 'confirm' && analysis && (
                    <div className="p-6 md:p-8 space-y-6 bg-[#050505] h-full min-h-screen md:min-h-0">
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: Image (Editable) */}
                        <div className="w-full md:w-1/3 space-y-4">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-[#111] border border-white/5 shadow-inner relative group cursor-pointer" onClick={() => setStep('upload')}>
                            <ProductImage 
                            src={croppedImage || analysis.imageUrl || originalImage || DEFAULT_PRODUCT_IMAGE} 
                            alt="Product" 
                            className="w-full h-full object-contain p-2" 
                            />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium flex items-center gap-2"><PenTool size={16}/> Editar Foto</span>
                            </div>
                        </div>
                        <p className="text-xs text-center text-gray-600">Click en la imagen para cambiarla</p>
                        </div>

                        {/* Right: Form */}
                        <div className="w-full md:w-2/3 space-y-5">
                        
                        {/* BASIC INFO (Simple Mode) */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nombre del Item</label>
                                <input 
                                type="text" 
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                                placeholder="Ej. Taladro Percutor 20V"
                                className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white font-medium placeholder-gray-600 focus:bg-[#161616] focus:border-green-600 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Categoría</label>
                                <select 
                                    value={analysis.category}
                                    onChange={(e) => setAnalysis({...analysis, category: e.target.value})}
                                    className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white text-sm focus:bg-[#161616] focus:border-green-600"
                                >
                                    {categories.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                </div>
                                <div>
                                <label className="block text-xs font-semibold text-green-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <Box size={14}/> Stock (Cant.)
                                </label>
                                <input 
                                    type="number"
                                    value={stockInput}
                                    onChange={(e) => setStockInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white text-sm font-bold focus:bg-[#161616] focus:border-green-600"
                                />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-[#111] p-4 rounded-xl border border-white/5">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Costo ($)</label>
                                    <input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="0.00"
                                    value={costInput}
                                    onChange={(e) => setCostInput(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-lg text-white focus:border-green-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Precio Venta ($)</label>
                                    <input 
                                    type="number" 
                                    step="0.01"
                                    value={priceInput}
                                    onChange={(e) => setPriceInput(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-lg text-white font-semibold focus:border-green-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ADVANCED TOGGLE */}
                        <div>
                            <button 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm text-green-500 hover:text-green-400 transition-colors w-full justify-center py-2"
                            >
                                {showAdvanced ? 'Ocultar Configuración Avanzada' : 'Mostrar Configuración Avanzada (Garantías, SKU, etc)'}
                                {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>

                        {/* ADVANCED INFO */}
                        {showAdvanced && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-white/10">
                                <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">SKU (Código)</label>
                                <div className="relative">
                                    <input 
                                    type="text" 
                                    value={skuInput}
                                    onChange={(e) => setSkuInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white text-sm font-mono focus:bg-[#161616] focus:border-green-600"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                                    <RefreshCw size={14} />
                                    </div>
                                </div>
                                </div>

                                {/* Dates Section */}
                                <div className="bg-orange-900/10 rounded-2xl p-5 border border-orange-600/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-orange-500 flex items-center gap-2">
                                    <ShieldAlert size={16} />
                                    Garantía y Fechas
                                    </h4>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <label className="block text-xs text-orange-400/70 mb-1.5 flex items-center gap-1">
                                        <Calendar size={12} /> Fecha Ingreso
                                    </label>
                                    <input 
                                        type="date" 
                                        value={entryDate}
                                        onChange={(e) => setEntryDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#111] border border-orange-500/20 rounded-lg text-white focus:ring-1 focus:ring-orange-500"
                                    />
                                    </div>
                                    <div>
                                    <label className="block text-xs text-orange-400/70 mb-1.5">Vencimiento Garantía</label>
                                    <input 
                                        type="date" 
                                        value={warrantyDate}
                                        onChange={(e) => setWarrantyDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#111] border border-orange-500/20 rounded-lg text-white focus:ring-1 focus:ring-orange-500"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => setWarrantyMonths(1)} type="button" className="text-[10px] bg-[#111] border border-orange-500/20 px-2 py-1 rounded text-orange-400 hover:bg-orange-500/20">+1 Mes</button>
                                        <button onClick={() => setWarrantyMonths(3)} type="button" className="text-[10px] bg-[#111] border border-orange-500/20 px-2 py-1 rounded text-orange-400 hover:bg-orange-500/20">+3 Meses</button>
                                    </div>
                                    </div>
                                </div>
                                </div>

                                <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descripción Detallada</label>
                                <textarea 
                                    value={analysis.description || ''}
                                    onChange={(e) => setAnalysis({...analysis, description: e.target.value})}
                                    className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white text-sm focus:bg-[#161616] focus:border-green-600 resize-none h-24"
                                />
                                </div>
                            </div>
                        )}

                        </div>
                    </div>
                    </div>
                )}
            </>
          )}
        </div>

        {/* Footer */}
        {step === 'confirm' && !isPlanLimitReached && (
          <div className="px-8 py-5 bg-[#161616] border-t border-white/5 flex justify-end gap-3 z-20">
             <Button variant="ghost" onClick={() => onClose()}>
               Cancelar
             </Button>
             <Button variant="primary" onClick={handleSave} icon={<Check size={18} />} className="px-8">
               Guardar Item
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};
