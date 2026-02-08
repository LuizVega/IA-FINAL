import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, Search, Tag, DollarSign, PenTool, MousePointer2, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { analyzeImage, analyzeProductByName, generateSku } from '../services/geminiService';
import { useStore } from '../store';
import { Product } from '../types';

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
  const [step, setStep] = useState<'upload' | 'crop' | 'analyzing' | 'confirm'>('upload');
  
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
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const { inventory, addProduct, updateProduct, currentFolderId, categories } = useStore();

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
      } else {
        // New Mode
        resetForm();
      }
    }
  }, [isOpen, editProduct]);

  // Recalculate suggested price whenever Cost or Category changes
  useEffect(() => {
    if (step === 'confirm' && costInput && analysis?.category) {
      const cost = parseFloat(costInput);
      const categoryConfig = categories.find(c => c.name === analysis?.category);
      
      if (!isNaN(cost) && categoryConfig) {
        const margin = categoryConfig.margin;
        const suggested = cost * (1 + margin);
        
        // Auto-fill price if empty or edit mode wasn't strictly enforcing override
        if (!priceInput || (!editProduct && priceInput)) {
             setPriceInput(suggested.toFixed(2));
        }
      }
    }
  }, [costInput, analysis?.category, step, categories]);

  // Handle SKU auto-generation when Category changes
  useEffect(() => {
     if (step === 'confirm' && analysis?.category && !editProduct) {
        // Only auto-update SKU on new products to avoid changing existing ones accidentally
        const categoryConfig = categories.find(c => c.name === analysis?.category);
        if (categoryConfig) {
           // We use the category prefix. Pass customPrefix to generateSku
           const newSku = generateSku(analysis.category, manualName, inventory.length, categoryConfig.prefix);
           setSkuInput(newSku);
        }
     }
  }, [analysis?.category, step, manualName, categories]);

  const resetForm = () => {
    setStep('upload');
    setOriginalImage(null);
    setCroppedImage(null);
    setCropBox(null);
    setAnalysis(null);
    setManualName('');
    setCostInput('');
    setPriceInput('');
    setSkuInput('');
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

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent native drag
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setCropBox({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Allow drawing in any direction by calculating min/max
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);
    const x = Math.min(currentX, startPos.x);
    const y = Math.min(currentY, startPos.y);
    
    // Boundary checks (optional but good)
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    // Simple clamp for x/y to stay inside
    const safeX = Math.max(0, Math.min(x, containerWidth - width));
    const safeY = Math.max(0, Math.min(y, containerHeight - height));

    setCropBox({ x: safeX, y: safeY, width, height });
  };

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
      ctx.drawImage(
        img,
        cropBox.x * scaleX,
        cropBox.y * scaleY,
        cropBox.width * scaleX,
        cropBox.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
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
      
      const category = result.category;
      
      setAnalysis({
        name: result.name,
        category: category,
        description: result.description,
        imageUrl: imageDataUrl,
        confidence: result.confidence
      });
      
      if (result.confidence && result.confidence < 0.4) {
         setManualName(""); 
      } else {
         setManualName(result.name);
      }

      setStep('confirm');
    } catch (error) {
      alert("Error en análisis.");
      setStep('upload');
    }
  };

  const handleNameAnalysis = async () => {
    if (!manualName) return;
    setStep('analyzing');
    
    try {
      const result = await analyzeProductByName(manualName);
      
      setAnalysis(prev => ({
        ...prev,
        name: manualName,
        category: result.category,
        description: result.description,
        confidence: 0.9 
      }));
      
      setStep('confirm');
    } catch (e) {
      setStep('confirm');
    }
  };

  const handleSave = () => {
    if (!analysis) return;

    const cost = parseFloat(costInput) || 0;
    const price = parseFloat(priceInput) || 0;

    const productData: Product = {
      id: editProduct ? editProduct.id : crypto.randomUUID(),
      name: manualName || analysis.name || 'Producto Nuevo',
      category: analysis.category || 'General',
      sku: skuInput,
      description: analysis.description,
      imageUrl: analysis.imageUrl || originalImage || '',
      confidence: analysis.confidence,
      cost: cost,
      price: price,
      supplier: '',
      createdAt: editProduct ? editProduct.createdAt : new Date().toISOString(),
      folderId: editProduct ? editProduct.folderId : currentFolderId,
      stock: editProduct ? editProduct.stock : 0,
      tags: editProduct ? editProduct.tags : [],
      abcClass: editProduct ? editProduct.abcClass : undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md transition-all">
      <div className="bg-white/90 w-full max-w-2xl rounded-2xl shadow-2xl border border-white/50 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-xl z-10">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
            {step === 'upload' && (editProduct ? 'Editar Producto' : 'Nuevo Producto')}
            {step === 'crop' && 'Seleccionar Objeto'}
            {step === 'analyzing' && 'Analizando...'}
            {step === 'confirm' && 'Confirmar Detalles'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#F5F5F7] h-full">
          {/* Upload, Crop, Analyzing Steps remain same... */}
          {step === 'upload' && (
            <div className="p-8 flex flex-col gap-8 h-full items-center justify-center">
              {!isCameraOpen ? (
                <>
                  <div 
                    className="w-full max-w-md aspect-video border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group bg-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="bg-white p-4 rounded-full shadow-sm group-hover:shadow-md transition-all">
                      <Upload className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900">Subir una foto</p>
                      <p className="text-sm text-gray-400 mt-1">Arrastra o haz clic</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                  
                  <div className="flex items-center gap-4 w-full max-w-md">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-sm text-gray-400 font-medium">O</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
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

          {step === 'crop' && originalImage && (
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-gray-900 relative overflow-hidden select-none flex items-center justify-center cursor-crosshair">
                 <div 
                   ref={containerRef}
                   className="relative inline-block"
                   onMouseDown={handleMouseDown}
                   onMouseMove={handleMouseMove}
                   onMouseUp={handleMouseUp}
                   onMouseLeave={handleMouseUp}
                 >
                   <img 
                     ref={imageRef}
                     src={originalImage} 
                     alt="To Crop" 
                     className="max-h-[60vh] object-contain pointer-events-none" 
                     draggable={false}
                   />
                   {/* Selection Overlay */}
                   {cropBox && (
                     <div 
                       className="absolute border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none"
                       style={{
                         left: cropBox.x,
                         top: cropBox.y,
                         width: cropBox.width,
                         height: cropBox.height,
                       }}
                     >
                       <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-50"></div>
                       <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white -translate-x-0.5 -translate-y-0.5"></div>
                       <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white translate-x-0.5 -translate-y-0.5"></div>
                       <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white -translate-x-0.5 translate-y-0.5"></div>
                       <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white translate-x-0.5 translate-y-0.5"></div>
                     </div>
                   )}
                 </div>
              </div>
              <div className="p-4 bg-white flex justify-end gap-3 border-t border-gray-100">
                <Button variant="ghost" onClick={() => setStep('upload')}>Atrás</Button>
                <Button variant="primary" onClick={confirmSelection}>
                  {cropBox && cropBox.width > 10 ? 'Analizar Selección' : 'Analizar Todo'}
                </Button>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-ping absolute"></div>
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin relative z-10"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-8">Analizando...</h3>
              <p className="text-gray-500 mt-2">Identificando producto y sugiriendo categorías...</p>
            </div>
          )}

          {step === 'confirm' && analysis && (
            <div className="p-6 md:p-8 space-y-8 bg-white h-full min-h-screen md:min-h-0">
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Image & Basics */}
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner relative group">
                    <img 
                      src={croppedImage || originalImage || analysis.imageUrl} 
                      alt="Product" 
                      className="w-full h-full object-contain p-4 mix-blend-multiply" 
                    />
                    {!editProduct && (
                      <button 
                         onClick={() => setStep('crop')}
                         className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full shadow-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <PenTool size={16} />
                      </button>
                    )}
                  </div>
                  
                  {/* Confidence Indicator */}
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-gray-400 uppercase">Confianza IA</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            (analysis.confidence || 0) > 0.8 ? 'bg-green-500' : 
                            (analysis.confidence || 0) > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${(analysis.confidence || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{Math.round((analysis.confidence || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Right: Form */}
                <div className="w-full md:w-2/3 space-y-5">
                  
                  {/* Name Identification Logic */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre del Producto</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="Ej. Taladro Percutor 20V"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white transition-colors"
                      />
                      {!editProduct && (!analysis.confidence || analysis.confidence < 0.6) && (
                         <button 
                           onClick={handleNameAnalysis}
                           className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-blue-100 text-blue-700 px-2 py-1.5 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                         >
                           <Search size={12} />
                           Buscar Detalles
                         </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Categoría</label>
                      <select 
                        value={analysis.category}
                        onChange={(e) => setAnalysis({...analysis, category: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">SKU</label>
                       <div className="relative">
                         <input 
                          type="text" 
                          value={skuInput}
                          onChange={(e) => setSkuInput(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:bg-white"
                        />
                         {/* Visual indicator that SKU is auto-generated */}
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" title="Generado basado en Categoría">
                           <RefreshCw size={14} />
                         </div>
                       </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</label>
                    <textarea 
                      value={analysis.description}
                      onChange={(e) => setAnalysis({...analysis, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white resize-none h-24"
                    />
                  </div>

                  {/* Pricing Section */}
                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                        <DollarSign size={16} />
                        Fijación de Precios
                      </h4>
                      {analysis.category && categories.find(c => c.name === analysis?.category) && (
                        <span className="text-xs bg-white px-2 py-1 rounded-md text-blue-600 shadow-sm border border-blue-50">
                           Margen Configurado: {(categories.find(c => c.name === analysis?.category)!.margin * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-blue-800/70 mb-1.5">Costo Unitario ($)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          value={costInput}
                          onChange={(e) => setCostInput(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:ring-blue-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-800/70 mb-1.5">Precio Sugerido ($)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 font-semibold focus:ring-blue-300"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'confirm' && (
          <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3 z-20">
             <Button variant="ghost" onClick={() => onClose()}>
               Cancelar
             </Button>
             <Button variant="primary" onClick={handleSave} icon={<Check size={18} />} className="px-8">
               Guardar
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};