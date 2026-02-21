
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, Search, Tag, DollarSign, PenTool, MousePointer2, RefreshCw, Calendar, ShieldAlert, ChevronDown, ChevronUp, Box, Lock, Crown, ImagePlus, FileImage, Sparkles, Folder } from 'lucide-react';
import { Button } from './ui/Button';
import { analyzeImage, analyzeProductByName, generateSku } from '../services/geminiService';
import { useStore } from '../store';
import { Product } from '../types';
import { format, addMonths, isValid, parseISO } from 'date-fns';
import { DEFAULT_PRODUCT_IMAGE, FREE_PLAN_LIMIT } from '../constants';
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

// Image Compression Utility
const compressImage = (base64Str: string, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width *= maxWidth / height;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str); // Fallback
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, editProduct }) => {
  // CHANGED: Default step is 'confirm' (Form view), not 'upload' (Camera view)
  const [step, setStep] = useState<'upload' | 'crop' | 'analyzing' | 'confirm'>('confirm');

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Initialize analysis with default values
  const [analysis, setAnalysis] = useState<Partial<Product> | null>({ category: 'General', confidence: 1 });

  const [manualName, setManualName] = useState('');
  const [costInput, setCostInput] = useState<string>('');
  const [priceInput, setPriceInput] = useState<string>('');
  const [skuInput, setSkuInput] = useState<string>('');
  const [stockInput, setStockInput] = useState<string>('0');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

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

  const { inventory, addProduct, updateProduct, currentFolderId, folders, settings, setCurrentView, isDemoMode, setTourStep } = useStore();

  const isPlanLimitReached = !editProduct && settings.plan === 'starter' && inventory.length >= FREE_PLAN_LIMIT;

  // Derive context from currently selected folder
  const currentFolder = folders.find(f => f.id === selectedFolderId);
  const categoryName = currentFolder ? currentFolder.name : (analysis?.category || 'General');

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
        setSelectedFolderId(editProduct.folderId);

        let safeEntryDate = format(new Date(), 'yyyy-MM-dd');
        if (editProduct.entryDate) {
          try {
            const parsed = parseISO(editProduct.entryDate);
            if (isValid(parsed)) safeEntryDate = format(parsed, 'yyyy-MM-dd');
          } catch (e) { }
        }
        setEntryDate(safeEntryDate);

        let safeWarrantyDate = '';
        if (editProduct.supplierWarranty) {
          try {
            const parsed = parseISO(editProduct.supplierWarranty);
            if (isValid(parsed)) safeWarrantyDate = format(parsed, 'yyyy-MM-dd');
          } catch (e) { }
        }
        setWarrantyDate(safeWarrantyDate);

      } else {
        // New Mode - Reset but keep 'confirm' as step
        resetForm();
        // Set default folder to where the user currently is
        setSelectedFolderId(currentFolderId);
      }
    }
  }, [isOpen, editProduct]);

  // EFFECT: Auto-calculate Sale Price based on Folder Margin
  useEffect(() => {
    if (step === 'confirm' && costInput) {
      const cost = parseFloat(costInput);

      // Use folder margin if available, else default
      const margin = currentFolder?.margin !== undefined ? currentFolder.margin : 0.30;

      if (!isNaN(cost)) {
        const suggested = cost * (1 + margin);
        // Only auto-fill if price is empty OR we are in creation mode (not editing)
        if (!priceInput || (!editProduct && priceInput)) {
          setPriceInput(suggested.toFixed(2));
        }
      }
    }
  }, [costInput, currentFolder, step]);

  // EFFECT: Auto SKU
  useEffect(() => {
    if (step === 'confirm' && !editProduct) {
      // Use folder prefix if available
      const prefix = currentFolder?.prefix;
      if (manualName || analysis?.name) {
        const newSku = generateSku(categoryName, manualName, inventory.length, prefix);
        setSkuInput(newSku);
      }
    }
  }, [step, manualName, currentFolder, categoryName]);

  const resetForm = () => {
    setStep('confirm'); // CHANGED: Start at confirm form
    setOriginalImage(null); // No image initially
    setCroppedImage(null);
    setCropBox(null);
    setAnalysis({
      category: categoryName,
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

  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const rawData = canvas.toDataURL('image/jpeg');

      // Optimize immediately
      const optimizedData = await compressImage(rawData);
      setOriginalImage(optimizedData);

      stopCamera();
      setStep('crop');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const rawResult = ev.target?.result as string;
        // Optimize before setting state
        const optimized = await compressImage(rawResult);
        setOriginalImage(optimized);
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

      // Secondary optimization for the cropped result
      const optimizedCrop = await compressImage(croppedDataUrl, 600, 0.7);

      setCroppedImage(optimizedCrop);
      handleAnalysis(optimizedCrop);
    }
  };

  const handleAnalysis = async (imageDataUrl: string) => {
    setStep('analyzing');
    const base64Data = imageDataUrl.split(',')[1];
    try {
      const result = await analyzeImage(base64Data);
      setAnalysis({
        name: result.name,
        category: categoryName, // Keep current folder as category
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
    // With manual entry, analysis might be partial, which is fine
    const cost = parseFloat(costInput) || 0;
    const price = parseFloat(priceInput) || 0;
    const stock = parseInt(stockInput) || 0;

    let entryDateIso = new Date().toISOString();
    try {
      const d = new Date(entryDate);
      if (!isNaN(d.getTime())) entryDateIso = d.toISOString();
    } catch (e) { }

    let warrantyIso: string | undefined = undefined;
    try {
      if (warrantyDate) {
        const d = new Date(warrantyDate);
        if (!isNaN(d.getTime())) warrantyIso = d.toISOString();
      }
    } catch (e) { }

    const productData: Product = {
      id: editProduct ? editProduct.id : crypto.randomUUID(),
      name: manualName || analysis?.name || 'Producto Nuevo',
      category: categoryName,
      sku: skuInput,
      description: analysis?.description,
      imageUrl: croppedImage || analysis?.imageUrl || originalImage || DEFAULT_PRODUCT_IMAGE,
      confidence: analysis?.confidence || 1,
      cost: cost,
      price: price,
      supplier: '',
      createdAt: editProduct ? editProduct.createdAt : new Date().toISOString(),
      entryDate: entryDateIso,
      supplierWarranty: warrantyIso,
      folderId: selectedFolderId,
      stock: stock,
      tags: editProduct ? editProduct.tags : [],
    };

    if (editProduct) {
      updateProduct(editProduct.id, productData);
    } else {
      addProduct(productData);
    }

    onClose();

    // TRIGGER TOUR ADVANCE IF IN DEMO MODE
    if (isDemoMode && !editProduct) {
      setTourStep(7); // Jump to Import Step (Step 7)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 md:bg-black/80 md:backdrop-blur-md transition-all">
      <div className="bg-[#111] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/5 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#161616]">
          <h2 className="text-lg font-semibold text-white tracking-tight">
            {isPlanLimitReached ? 'Límite Alcanzado' : (
              editProduct ? 'Editar Producto' : 'Agregar Nuevo Item'
            )}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-0 overflow-y-auto overflow-x-hidden bg-[#050505] h-full text-gray-300">

          {/* PLAN LIMIT REACHED STATE */}
          {isPlanLimitReached ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[400px]">
              <div className="bg-orange-900/10 p-6 rounded-full border border-orange-500/20 mb-6 relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse"></div>
                <Lock size={48} className="text-orange-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">¡Límite de Plan Alcanzado!</h3>
              <p className="text-gray-400 max-w-sm mb-8">
                Has alcanzado el límite de {FREE_PLAN_LIMIT} items del plan Starter. Para seguir creciendo, actualiza a Growth.
              </p>
              <Button
                onClick={() => { onClose(); setCurrentView('pricing'); }}
                className="bg-green-600 hover:bg-green-500 text-black px-8 py-3 font-bold"
                icon={<Crown size={18} />}
              >
                Ver Planes y Mejorar
              </Button>
            </div>
          ) : (
            <>
              {/* Upload Step (Only shown if triggered from Form) */}
              {step === 'upload' && (
                <div className="p-8 flex flex-col gap-6 h-full items-center justify-center min-h-[400px]">
                  {!isCameraOpen ? (
                    <>
                      {/* Main Dropzone */}
                      <div
                        className="w-full max-w-lg aspect-[4/3] border-2 border-dashed border-gray-700 hover:border-green-500 rounded-3xl flex flex-col items-center justify-center gap-6 cursor-pointer group bg-[#111] hover:bg-[#161616] transition-all relative overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {/* Animated Background Effect on Hover */}
                        <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="bg-[#222] p-6 rounded-full shadow-lg group-hover:scale-110 group-hover:bg-green-500/10 group-hover:text-green-500 transition-all text-gray-400 border border-white/5 group-hover:border-green-500/20 relative z-10">
                          <ImagePlus className="w-12 h-12" />
                        </div>

                        <div className="text-center relative z-10">
                          <h3 className="text-xl font-bold text-white mb-2">Sube una imagen</h3>
                          <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Arrastra tu archivo aquí o haz clic para buscar.
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a1a] border border-white/5 text-[10px] text-gray-400">
                            <FileImage size={12} />
                            <span>Soporta JPG, PNG, WEBP</span>
                          </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={startCamera}
                          className="text-gray-600 hover:text-green-500 text-xs font-medium flex items-center gap-2 transition-colors py-2"
                        >
                          <Camera size={14} />
                          ¿Usar Webcam?
                        </button>

                        <button
                          onClick={() => setStep('confirm')}
                          className="text-gray-600 hover:text-white text-xs font-medium flex items-center gap-2 transition-colors py-2"
                        >
                          <X size={14} />
                          Cancelar Subida
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="relative w-full h-full bg-black flex flex-col items-center justify-center rounded-2xl overflow-hidden aspect-video">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                      <div className="absolute bottom-6 flex gap-6">
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
                  <div className="flex-1 bg-black relative overflow-hidden select-none flex items-center justify-center min-h-[300px]">
                    <img ref={imageRef} src={originalImage} alt="Crop" className="max-h-[60vh] object-contain" />
                  </div>
                  <div className="p-4 bg-[#161616] flex justify-between items-center gap-3">
                    <div className="text-xs text-gray-500 hidden md:block">
                      Arrastra para seleccionar el objeto (Opcional)
                    </div>
                    <div className="flex gap-3 ml-auto">
                      <Button variant="ghost" onClick={() => setStep('upload')}>Atrás</Button>
                      <Button variant="primary" onClick={confirmSelection}>Analizar Imagen</Button>
                    </div>
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
                  <p className="text-sm text-gray-500 mt-2">Detectando producto y precios</p>
                </div>
              )}

              {/* CONFIRM / FORM STEP (Main View - Default) */}
              {step === 'confirm' && (
                <div className="p-6 md:p-8 space-y-6 bg-[#050505] h-full min-h-screen md:min-h-0">

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Image (Editable) */}
                    <div className="w-full md:w-1/3 space-y-4">
                      <div
                        className="aspect-square rounded-2xl overflow-hidden bg-[#111] border border-white/5 shadow-inner relative group cursor-pointer flex items-center justify-center"
                        onClick={() => setStep('upload')}
                      >
                        <ProductImage
                          src={croppedImage || analysis?.imageUrl || originalImage || DEFAULT_PRODUCT_IMAGE}
                          alt="Product"
                          className="w-full h-full object-contain p-2"
                        />

                        {/* Overlay Always Visible on Default Image to encourage click */}
                        <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity ${(!croppedImage && !originalImage && !analysis?.imageUrl) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <div className="bg-green-600/20 p-4 rounded-full mb-2">
                            <ImagePlus size={24} className="text-green-500" />
                          </div>
                          <span className="text-white font-medium text-xs">Subir Imagen / IA</span>
                        </div>
                      </div>
                      <p className="text-xs text-center text-gray-600">Click en la imagen para subir foto y usar IA</p>
                    </div>

                    {/* Right: Form */}
                    <div className="w-full md:w-2/3 space-y-5">

                      {/* BASIC INFO (Simple Mode) */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nombre del Item</label>
                            <input
                              id="tour-product-name" // ADDED ID
                              type="text"
                              value={manualName}
                              onChange={(e) => setManualName(e.target.value)}
                              placeholder="Ej. Taladro Percutor 20V"
                              autoFocus
                              className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white font-medium placeholder-gray-600 focus:bg-[#161616] focus:border-green-600 transition-colors"
                            />
                          </div>
                          {/* Explicit Action Button inside form */}
                          <button
                            type="button"
                            onClick={() => setStep('upload')}
                            className="mt-6 p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl text-green-500 flex items-center justify-center transition-colors"
                            title="Adjuntar Imagen / Escanear"
                          >
                            <Sparkles size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Ubicación / Categoría</label>
                            <div className="relative">
                              <select
                                value={selectedFolderId || ''}
                                onChange={(e) => setSelectedFolderId(e.target.value || null)}
                                className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-xl text-gray-300 text-sm flex items-center gap-2 appearance-none focus:border-green-500 outline-none"
                              >
                                <option value="">Almacén Principal (Raíz)</option>
                                {folders.map(f => (
                                  <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-green-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Box size={14} /> Stock (Cant.)
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
                              id="tour-product-cost" // ADDED ID
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
                              value={analysis?.description || ''}
                              onChange={(e) => setAnalysis({ ...analysis, description: e.target.value })}
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
            <Button id="tour-save-product-btn" variant="primary" onClick={handleSave} icon={<Check size={18} />} className="px-8">
              Guardar Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
