
import React, { useState, useRef } from 'react';
import { Upload, X, Check, Download, Lock, Crown, Database } from 'lucide-react';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { Product, CategoryConfig } from '../types';
import { generateSku } from '../services/geminiService';
import { addMonths } from 'date-fns';
import { DEFAULT_PRODUCT_IMAGE, FREE_PLAN_LIMIT } from '../constants';

interface InventoryImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryImporter: React.FC<InventoryImporterProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { categories, bulkAddProducts, bulkAddCategories, inventory, settings, setCurrentView, isDemoMode, generateDemoData, setTourStep } = useStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(csv|xls|xlsx)$/i)) {
        setError('Por favor sube un archivo Excel (.xlsx, .xls) o CSV.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    }
  };

  const handleDemoImport = () => {
      setIsProcessing(true);
      setTimeout(() => {
          generateDemoData();
          setIsProcessing(false);
          onClose();
          // ADVANCE TOUR STEP (To Step 9: Click First Item)
          // Steps: ... 7:ImportBtn, 8:GenerateBtn, 9:ClickItem ...
          setTourStep(9); 
      }, 1000); 
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 2) {
        setError('El archivo parece estar vacío.');
        return;
      }
      // Basic CSV parsing
      const data = lines.slice(1).filter(l => l.trim()).map(line => {
        const values: string[] = [];
        let inQuotes = false;
        let currentValue = '';
        for (let char of line) {
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
             values.push(currentValue.trim());
             currentValue = '';
          } else currentValue += char;
        }
        values.push(currentValue.trim());
        return values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
      });
      setPreview(data.slice(0, 5));
    };
    reader.readAsText(file);
  };

  // Improved Logic for Name Construction
  const constructSmartName = (row: string[]): { name: string, extractedSku: string | null } => {
    const rawName = row[0] || '';
    const brand = row[1] || '';
    const category = row[2] || '';

    const isCodeLike = (rawName.length < 8 && rawName.length > 0) || /^[A-Z0-9-]+$/.test(rawName);

    if (isCodeLike) {
        if (category && brand) {
            return { name: `${category} ${brand}`, extractedSku: rawName };
        } else if (category) {
            return { name: `${category} ${rawName}`, extractedSku: rawName };
        } else if (brand) {
            return { name: `${brand} ${rawName}`, extractedSku: rawName };
        }
    }

    return { name: rawName, extractedSku: null };
  };

  const safeDateToIso = (dateStr: string | undefined, defaultDate: Date = new Date()): string => {
    if (!dateStr) return defaultDate.toISOString();
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return defaultDate.toISOString();
      return d.toISOString();
    } catch (e) {
      return defaultDate.toISOString();
    }
  };

  const processImport = () => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const dataRows = lines.slice(1);

      // --- PLAN LIMIT CHECK ---
      if (settings.plan === 'starter' && (inventory.length + dataRows.length > FREE_PLAN_LIMIT)) {
          alert(`Error: Importar ${dataRows.length} items excedería tu límite de ${FREE_PLAN_LIMIT} items del plan Starter. Por favor actualiza tu plan.`);
          setIsProcessing(false);
          return;
      }
      
      const newProducts: Product[] = [];
      const newCategories = new Map<string, CategoryConfig>();
      const existingCategoryNames = new Set(categories.map(c => c.name.toLowerCase()));

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (row.length < 3) continue;

        let brand = row[1] || '';
        let catName = row[2] || 'General';
        let stock = parseInt(row[3]) || 0;
        let price = parseFloat(row[4]) || 0;
        let providedSku = row[5];
        let status = row[6] || ''; 
        let entryDateRaw = row[7];
        let warrantyDateRaw = row[8];
        let providedImageUrl = row[9] ? row[9].trim() : '';

        const { name, extractedSku } = constructSmartName(row);
        
        // Auto-detect Categories logic
        const nameLower = name.toLowerCase();
        if (catName === 'General') {
            if (nameLower.includes('iphone') || nameLower.includes('samsung') || nameLower.includes('xiaomi') || nameLower.includes('celular')) {
                catName = 'Celulares';
            } else if (nameLower.includes('laptop') || nameLower.includes('macbook') || nameLower.includes('dell')) {
                catName = 'Laptops';
            }
        }

        let category = catName;
        const existingCat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        
        if (existingCat) {
          category = existingCat.name;
        } else {
          if (!newCategories.has(catName.toLowerCase()) && !existingCategoryNames.has(catName.toLowerCase())) {
             const prefix = catName.substring(0, 3).toUpperCase();
             newCategories.set(catName.toLowerCase(), {
                id: crypto.randomUUID(),
                name: catName,
                prefix: prefix,
                margin: 0.30,
                color: 'bg-[#222] text-gray-300 border-gray-600',
                isInternal: false
             });
          }
        }

        let sku = providedSku || extractedSku;
        if (!sku) {
           const prefix = existingCat ? existingCat.prefix : (newCategories.get(catName.toLowerCase())?.prefix || 'GEN');
           sku = generateSku(catName, name, inventory.length + newProducts.length, prefix);
        }

        const tags: string[] = [];
        if (status.toLowerCase().includes('descontinuado')) tags.push('Descontinuado');

        // FORCE DEFAULT IMAGE IF INVALID URL
        let finalImageUrl = DEFAULT_PRODUCT_IMAGE;
        // Basic check if it looks like a URL. If it's short or empty, use default.
        if (providedImageUrl && providedImageUrl.length > 8 && (providedImageUrl.startsWith('http') || providedImageUrl.startsWith('data:'))) {
            finalImageUrl = providedImageUrl;
        }
        
        const entryDate = safeDateToIso(entryDateRaw);
        const warrantyDate = safeDateToIso(warrantyDateRaw, addMonths(new Date(), 3));

        newProducts.push({
          id: crypto.randomUUID(),
          name, 
          brand,
          category: catName,
          sku,
          cost: price * 0.7, 
          price,
          stock,
          description: `Producto importado. ${brand} ${name}.`,
          imageUrl: finalImageUrl,
          createdAt: new Date().toISOString(),
          entryDate: entryDate,
          supplierWarranty: warrantyDate,
          confidence: 1,
          folderId: null,
          tags
        });
      }

      if (newCategories.size > 0) {
        bulkAddCategories(Array.from(newCategories.values()));
      }
      bulkAddProducts(newProducts);
      
      setIsProcessing(false);
      onClose();
      setFile(null);
    };
    
    if (file) reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = "Nombre,Marca,Categoria,Stock,Precio,SKU,Estado,Fecha Ingreso,Vencimiento Garantía,URL Imagen (Opcional)";
    const example = "N020,Asus,Pantallas,50,150.00,,Activo,2024-01-01,2024-06-01,";
    const example2 = "iPhone 15 Pro Max,Apple,Celulares,10,1200.00,,Activo,2024-02-15,2025-02-15,https://example.com/img.jpg";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example + "\n" + example2;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla_importacion_exo.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="bg-[#111] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-white/10">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#161616]">
          <div>
             <h3 className="text-xl font-bold text-white">Importación Inteligente</h3>
             <p className="text-xs text-green-500 font-medium">Disponible en tu plan actual</p>
          </div>
          <button onClick={onClose} className="bg-[#222] p-2 rounded-full shadow-sm text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
           {settings.plan === 'starter' && inventory.length >= FREE_PLAN_LIMIT ? (
               <div className="text-center py-8">
                   <div className="bg-orange-900/10 p-6 rounded-full inline-block mb-4 border border-orange-500/20">
                       <Lock size={40} className="text-orange-500" />
                   </div>
                   <h4 className="text-xl font-bold text-white mb-2">Límite de Items Alcanzado</h4>
                   <p className="text-gray-400 mb-6">No puedes importar más productos con el plan Starter (Límite: {FREE_PLAN_LIMIT}).</p>
                   <Button onClick={() => { onClose(); setCurrentView('pricing'); }} icon={<Crown size={16}/>}>
                       Actualizar Plan
                   </Button>
               </div>
           ) : !file ? (
             <div className="space-y-8">
                {isDemoMode && (
                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Database size={20}/></div>
                            <div className="text-left">
                                <h4 className="text-white font-bold text-sm">Modo Demostración</h4>
                                <p className="text-gray-400 text-xs">Carga datos ficticios para probar el sistema.</p>
                            </div>
                        </div>
                        <Button id="demo-import-btn" onClick={handleDemoImport} isLoading={isProcessing}>Cargar Datos de Prueba</Button>
                    </div>
                )}
                
                <div className="border-2 border-dashed border-gray-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:border-green-500 hover:bg-green-500/5 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                   <div className="bg-[#222] p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={32} className="text-gray-400 group-hover:text-green-500" />
                   </div>
                   <p className="text-lg font-medium text-white">Sube tu archivo Excel o CSV</p>
                   <p className="text-xs text-gray-500 mt-2">
                       Detectamos automáticamente nombres, marcas y categorías.
                       <br/>Si no subes imágenes, usaremos el logo de ExO.
                   </p>
                   <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
                </div>
                <div className="flex justify-center">
                   <Button variant="ghost" size="sm" onClick={downloadTemplate} icon={<Download size={14}/>}>
                      Descargar Plantilla
                   </Button>
                </div>
             </div>
           ) : (
             <div className="flex items-center gap-3 bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                 <Check size={16} className="text-green-500"/>
                 <span className="text-white flex-1">{file.name}</span>
                 <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Cambiar</Button>
             </div>
           )}
        </div>

        {file && (
          <div className="p-6 border-t border-white/5 bg-[#161616] flex justify-end gap-3">
             <Button variant="ghost" onClick={() => setFile(null)}>Cancelar</Button>
             <Button onClick={processImport} isLoading={isProcessing}>Procesar</Button>
          </div>
        )}
      </div>
    </div>
  );
};
