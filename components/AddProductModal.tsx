
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, RefreshCw, Calendar, ShieldAlert, ChevronDown, ChevronUp, Lock, Crown, ImagePlus, FileImage, Video, VideoOff, Play } from 'lucide-react';
import { Button } from './ui/Button';
import { analyzeImage, analyzeProductByName, generateSku } from '../services/geminiService';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { Product } from '../types';
import { format, addMonths, isValid, parseISO } from 'date-fns';
import { DEFAULT_PRODUCT_IMAGE, getPlanLimit, getPlanName } from '../constants';
import { ProductImage } from './ProductImage';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProduct?: Product | null;
  initialStep?: 'upload' | 'crop' | 'analyzing' | 'confirm';
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

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, editProduct, initialStep = 'confirm' }) => {
  // CHANGED: Default step is 'confirm' (Form view), not 'upload' (Camera view)
  const [step, setStep] = useState<'upload' | 'crop' | 'analyzing' | 'confirm'>('confirm');

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [productVideo, setProductVideo] = useState<string | null>(null); // videoUrl state

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
  const videoFileInputRef = useRef<HTMLInputElement>(null); // Video file input
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { inventory, addProduct, updateProduct, currentFolderId, folders, settings, setCurrentView, isDemoMode, setTourStep, capturedImage, setCapturedImage } = useStore();
  const { t } = useTranslation();

  const PLAN_LIMIT = getPlanLimit(settings.plan);
  const isPlanLimitReached = !editProduct && inventory.length >= PLAN_LIMIT;

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
        if (editProduct.videoUrl) setProductVideo(editProduct.videoUrl);

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
        // New Mode - Reset but use initialStep
        resetForm();
        setStep(initialStep);
        // Set default folder to where the user currently is
        setSelectedFolderId(currentFolderId);

        if (capturedImage) {
          // Bypass manual crop entirely and auto-analyze since it's already a cropped square
          setOriginalImage(capturedImage);
          setCroppedImage(capturedImage); // Ensure the cropped reference matches
          setStep('analyzing');
          handleAnalysis(capturedImage);
          setCapturedImage(null);
        }
      }
    }
  }, [isOpen, editProduct, initialStep]);

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
    setStep('confirm');
    setOriginalImage(null);
    setCroppedImage(null);
    setProductVideo(null);
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
        const optimized = await compressImage(rawResult);
        setOriginalImage(optimized);
        setStep('crop');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 60 * 1024 * 1024) {
      alert('El video es muy grande. Máximo 60 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProductVideo(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
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
      videoUrl: productVideo || undefined,
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
              <h3 className="text-2xl font-bold text-white mb-2">{t('addProduct.limitReached')}</h3>
              <p className="text-gray-400 max-w-sm mb-8">
                {t('addProduct.limitDesc').replace('{limit}', PLAN_LIMIT.toString()).replace('Starter', getPlanName(settings.plan))}
              </p>
              <Button
                onClick={() => { onClose(); setCurrentView('pricing'); }}
                className="bg-green-600 hover:bg-green-500 text-black px-8 py-3 font-bold"
                icon={<Crown size={18} />}
              >
                {t('addProduct.viewPlans')}
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

              {/* CONFIRM / FORM STEP — minimal like scanner */}
              {step === 'confirm' && (
                <div className="flex flex-col bg-black min-h-screen">

                  {/* Product photo — top */}
                  <div
                    className="relative cursor-pointer"
                    style={{ height: '40vh' }}
                    onClick={() => setStep('upload')}
                  >
                    <ProductImage
                      src={croppedImage || analysis?.imageUrl || originalImage || DEFAULT_PRODUCT_IMAGE}
                      alt="Producto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    {/* Tap to change image */}
                    <div className="absolute bottom-4 right-4">
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <ImagePlus size={12} className="text-white/60" />
                        <span className="text-white/60 text-xs font-bold">Cambiar foto</span>
                      </div>
                    </div>
                  </div>

                  {/* Video upload section */}
                  <div className="px-5 pt-4 pb-1">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Video size={11} /> Video del producto <span className="text-white/15">(opcional)</span>
                    </p>

                    {productVideo ? (
                      /* Video preview */
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 group" style={{ height: '220px' }}>
                        <video
                          src={productVideo}
                          className="w-full h-full object-cover"
                          controls
                          playsInline
                          preload="metadata"
                        />
                        {/* Remove button */}
                        <button
                          onClick={() => setProductVideo(null)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-2 left-2 text-[9px] text-white/40 font-bold uppercase tracking-widest bg-black/60 px-2 py-1 rounded-full">
                          Video listo ✓
                        </div>
                      </div>
                    ) : (
                      /* Upload dropzone */
                      <button
                        onClick={() => videoFileInputRef.current?.click()}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-dashed border-white/10 hover:border-white/25 hover:bg-white/5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-white/60 transition-colors shrink-0">
                          <Video size={22} />
                        </div>
                        <div className="text-left">
                          <p className="text-white/50 text-sm font-bold group-hover:text-white/70 transition-colors">Subir video del producto</p>
                          <p className="text-white/20 text-xs mt-0.5">MP4, MOV, WEBM — máx. 60 MB</p>
                        </div>
                        <Upload size={16} className="text-white/20 ml-auto shrink-0" />
                      </button>
                    )}
                    <input
                      type="file"
                      ref={videoFileInputRef}
                      className="hidden"
                      accept="video/mp4,video/mov,video/webm,video/quicktime"
                      onChange={handleVideoUpload}
                    />
                  </div>

                  {/* Form area */}
                  <div className="flex-1 px-5 pt-6 pb-4 space-y-4 bg-[#0a0a0a]">

                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Datos del producto</p>

                    {/* Name */}
                    <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-1.5 block">Nombre</label>
                      <input
                        id="tour-product-name"
                        type="text"
                        value={manualName}
                        onChange={e => setManualName(e.target.value)}
                        placeholder="Ej. Pulsera artesanal..."
                        autoFocus
                        className="w-full bg-white/5 border border-white/10 focus:border-green-500 rounded-2xl px-4 py-3.5 text-white font-medium outline-none text-base transition-colors placeholder-white/20"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-1.5 block">Precio de Venta público</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-black text-lg">S/</span>
                        <input
                          type="number"
                          value={priceInput}
                          onChange={e => setPriceInput(e.target.value)}
                          placeholder="0"
                          className="w-full bg-white/5 border border-white/10 focus:border-green-500 rounded-2xl px-4 py-3.5 pl-10 text-white font-black text-2xl outline-none transition-colors"
                          inputMode="decimal"
                        />
                      </div>
                      <p className="text-white/20 text-xs mt-1.5 ml-1">El costo está en Opciones Avanzadas</p>
                    </div>

                    {/* Advanced toggle */}
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors w-full justify-between py-2 px-1"
                    >
                      <span className="text-xs font-black uppercase tracking-widest">Opciones Avanzadas</span>
                      {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showAdvanced && (
                      <div className="space-y-4 pt-2 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">

                        {/* Cost */}
                        <div>
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-1.5 block">Costo (referencia)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-black">S/</span>
                            <input
                              id="tour-product-cost"
                              type="number"
                              step="0.01"
                              placeholder="0"
                              value={costInput}
                              onChange={e => setCostInput(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 focus:border-green-500/50 rounded-2xl px-4 py-3 pl-10 text-white text-base outline-none transition-colors"
                              inputMode="decimal"
                            />
                          </div>
                        </div>

                        {/* Stock + Folder */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-1.5 block">Stock</label>
                            <input
                              type="number"
                              value={stockInput}
                              onChange={e => setStockInput(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 focus:border-green-500/50 rounded-2xl px-4 py-3 text-white font-bold outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-1.5 block">Categoría</label>
                            <div className="relative">
                              <select
                                value={selectedFolderId || ''}
                                onChange={e => setSelectedFolderId(e.target.value || null)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white text-sm appearance-none outline-none focus:border-green-500/50"
                              >
                                <option value="" className="bg-[#111] text-white">General (Sin categoría)</option>
                                {folders.map(f => (
                                  <option key={f.id} value={f.id} className="bg-[#111] text-white">{f.name}</option>
                                ))}
                              </select>
                              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {/* SKU */}
                        <div>
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-1.5 block">SKU / Código</label>
                          <input
                            type="text"
                            value={skuInput}
                            onChange={e => setSkuInput(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-green-500/50 rounded-2xl px-4 py-3 text-white/60 text-sm font-mono outline-none transition-colors"
                          />
                        </div>

                        {/* Dates */}
                        <div className="bg-orange-500/5 border border-orange-500/15 rounded-2xl p-4 space-y-3">
                          <p className="text-orange-400/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <ShieldAlert size={12} /> Garantía y Fechas
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-white/20 block mb-1">Fecha Ingreso</label>
                              <input
                                type="date"
                                value={entryDate}
                                onChange={e => setEntryDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/60 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-white/20 block mb-1">Vence Garantía</label>
                              <input
                                type="date"
                                value={warrantyDate}
                                onChange={e => setWarrantyDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/60 text-xs outline-none"
                              />
                              <div className="flex gap-1.5 mt-1.5">
                                <button onClick={() => setWarrantyMonths(1)} type="button" className="text-[10px] bg-white/5 border border-orange-500/20 px-2 py-1 rounded-lg text-orange-400 hover:bg-orange-500/10">+1m</button>
                                <button onClick={() => setWarrantyMonths(3)} type="button" className="text-[10px] bg-white/5 border border-orange-500/20 px-2 py-1 rounded-lg text-orange-400 hover:bg-orange-500/10">+3m</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-1.5 block">Descripción (opcional)</label>
                          <textarea
                            value={analysis?.description || ''}
                            onChange={e => setAnalysis({ ...analysis, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 focus:border-green-500/50 rounded-2xl px-4 py-3 text-white/60 text-sm outline-none resize-none h-20 transition-colors"
                            placeholder="La IA puede generarla automáticamente..."
                          />
                        </div>
                      </div>
                    )}

                    {/* ── Main CTA — always visible ── */}
                    <div className="pt-4 pb-6 space-y-2">
                      <button
                        id="tour-save-product-btn"
                        onClick={handleSave}
                        disabled={!manualName && !analysis?.name}
                        className="w-full py-4 bg-green-500 text-black font-black text-lg rounded-2xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
                      >
                        <Check size={20} />
                        {editProduct ? 'Guardar Cambios' : 'Publicar al Catálogo'}
                      </button>
                      <p className="text-white/15 text-[10px] text-center font-bold">Los cambios se guardan de inmediato</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — just cancel (desktop) */}
        {step === 'confirm' && !isPlanLimitReached && (
          <div className="px-6 py-3 bg-[#0a0a0a] border-t border-white/5 flex justify-center z-20">
            <button onClick={onClose} className="text-white/20 text-xs font-bold hover:text-white/40 transition-colors py-2">
              Cancelar y cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
