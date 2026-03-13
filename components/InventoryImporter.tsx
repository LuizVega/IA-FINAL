
import React, { useState, useRef } from 'react';
import { Upload, X, Check, Download, Lock, Crown, Database } from 'lucide-react';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { Product, CategoryConfig } from '../types';
import { generateSku, processCopilotPrompt, fileToGenerativePart } from '../services/geminiService';
import { addMonths } from 'date-fns';
import { DEFAULT_PRODUCT_IMAGE, getPlanLimit, getPlanName } from '../constants';
import { Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

interface InventoryImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryImporter: React.FC<InventoryImporterProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { categories, bulkAddProducts, bulkAddCategories, inventory, settings, setCurrentView, isDemoMode, generateDemoData, setTourStep } = useStore();
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
      setError(null);
    }
  };

  const handleDemoImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      generateDemoData();
      setIsProcessing(false);
      onClose();
      setTourStep(9);
    }, 1000);
  };

  const constructSmartName = (row: any[]): { name: string, extractedSku: string | null } => {
    const rawName = String(row[0] || '').trim();
    const brand = String(row[1] || '').trim();
    const category = String(row[2] || '').trim();

    const isCodeLike = (rawName.length < 8 && rawName.length > 0) || /^[A-Z0-9.-]+$/.test(rawName);

    if (isCodeLike) {
      if (category && brand) {
        return { name: `${category} ${brand} (${rawName})`, extractedSku: rawName };
      } else if (category) {
        return { name: `${category} ${rawName}`, extractedSku: rawName };
      } else if (brand) {
        return { name: `${brand} ${rawName}`, extractedSku: rawName };
      }
    }

    return { name: rawName, extractedSku: null };
  };

  const safeDateToIso = (dateStr: any, defaultDate: Date = new Date()): string => {
    if (!dateStr) return defaultDate.toISOString();
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return defaultDate.toISOString();
      return d.toISOString();
    } catch (e) {
      return defaultDate.toISOString();
    }
  };

  const processImport = async () => {
    if (!prompt.trim() && files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const newProducts: Product[] = [];
      const newCategoriesList: CategoryConfig[] = [];
      const existingCategoryNames = new Set(categories.map(c => c.name.toLowerCase()));
      const newlyAddedCategories = new Set<string>();
      let fileParts: import('../services/geminiService').GenerativeFilePart[] = [];

      // Process Files (Identify Spreadsheets vs Images/Other)
      for (const f of files) {
        if (f.type.startsWith('image/')) {
          const part = await fileToGenerativePart(f);
          fileParts.push(part);
        } else if (f.name.match(/\.(csv|xls|xlsx)$/i)) {
          // Spreadsheets -> bypass AI and parse directly
          const data = await f.arrayBuffer();
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) continue;

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
          const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

          for (let row of dataRows) {
            if (!row[0]) continue;
            const brand = String(row[1] || '').trim();
            let catName = String(row[2] || 'General').trim();
            const stock = parseInt(String(row[3])) || 1;
            const price = parseFloat(String(row[4])) || 0;
            const providedSku = String(row[5] || '').trim();
            const status = String(row[6] || '').trim();
            const entryDateRaw = row[7];
            const warrantyDateRaw = row[8];
            const providedImageUrl = row[9] ? String(row[9]).trim() : '';

            const { name, extractedSku } = constructSmartName(row);
            const nameLower = name.toLowerCase();

            if (catName === 'General') {
              if (nameLower.includes('iphone') || nameLower.includes('samsung') || nameLower.includes('xiaomi') || nameLower.includes('celular')) catName = 'Celulares';
              else if (nameLower.includes('laptop') || nameLower.includes('macbook') || nameLower.includes('dell')) catName = 'Laptops';
            }

            const existingCat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
            const alreadyAdded = newlyAddedCategories.has(catName.toLowerCase());

            if (!existingCat && !alreadyAdded && catName !== 'General') {
              const prefix = catName.substring(0, 3).toUpperCase();
              newCategoriesList.push({
                id: crypto.randomUUID(), name: catName, prefix: prefix, margin: 0.30, color: 'bg-[#222] text-gray-300 border-gray-600', isInternal: false
              });
              newlyAddedCategories.add(catName.toLowerCase());
            }

            let sku = providedSku || extractedSku || generateSku(catName, name, inventory.length + newProducts.length);
            const tags: string[] = status.toLowerCase().includes('descontinuado') ? ['Descontinuado'] : [];
            let finalImageUrl = (providedImageUrl && providedImageUrl.length > 8) ? providedImageUrl : DEFAULT_PRODUCT_IMAGE;

            newProducts.push({
              id: crypto.randomUUID(), name, brand, category: catName, sku, cost: price * 0.7, price, stock,
              description: `Importado de Excel. ${brand} ${name}.`, imageUrl: finalImageUrl,
              createdAt: new Date().toISOString(), entryDate: safeDateToIso(entryDateRaw), supplierWarranty: safeDateToIso(warrantyDateRaw, addMonths(new Date(), 3)),
              confidence: 1, folderId: null, tags
            });
          }
        } else {
          // PDF or Text File - Read as text and append to AI prompt
          const text = await f.text();
          setPrompt(prev => prev + `\n\n[Contenido del archivo ${f.name}]:\n${text}`);
        }
      }

      // Process Prompt & Images with AI if provided
      if (prompt.trim() || fileParts.length > 0) {
        const aiProducts = await processCopilotPrompt(prompt, fileParts);
        aiProducts.forEach((p: Partial<Product>) => {
          if (!p.name) return;
          newProducts.push({
            id: crypto.randomUUID(),
            name: p.name,
            brand: p.brand || 'Genérico',
            category: p.category || 'General',
            sku: generateSku(p.category || 'Gen', p.name, inventory.length + newProducts.length),
            cost: (p.price || 0) * 0.7,
            price: p.price || 0,
            stock: p.stock || 1,
            description: p.description || p.name,
            imageUrl: DEFAULT_PRODUCT_IMAGE,
            createdAt: new Date().toISOString(),
            entryDate: new Date().toISOString(),
            supplierWarranty: addMonths(new Date(), 3).toISOString(),
            confidence: p.confidence || 0.8,
            folderId: null,
            tags: []
          });
        });
      }

      const PLAN_LIMIT = getPlanLimit(settings.plan);
      if (inventory.length + newProducts.length > PLAN_LIMIT) {
        throw new Error(t('addProduct.limitDesc').replace('{limit}', PLAN_LIMIT.toString()).replace('Starter', getPlanName(settings.plan)));
      }

      if (newCategoriesList.length > 0) bulkAddCategories(newCategoriesList);
      if (newProducts.length > 0) bulkAddProducts(newProducts);

      setIsProcessing(false);
      onClose();
      setFiles([]);
      setPrompt('');
    } catch (err: any) {
      console.error('Error importing data:', err);
      // Bulletproof error message extraction - never show [object Object]
      let errorMsg = 'Error al procesar la importación. Comprueba el formato de los datos.';
      if (typeof err === 'string') {
        errorMsg = err;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      } else if (err?.message && typeof err.message === 'string') {
        errorMsg = err.message;
      } else if (err) {
        try { errorMsg = JSON.stringify(err); } catch (_) {}
      }
      if (errorMsg.includes('[object Object]')) {
        errorMsg = 'Error al comunicarse con la IA. Revisa tu conexión o intenta más tarde.';
      }
      setError(errorMsg);
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [["Nombre", "Marca", "Categoria", "Stock", "Precio", "SKU", "Estado", "Fecha Ingreso", "Vencimiento Garantía", "URL Imagen (Opcional)"]];
    const examples = [
      ["iPhone 15 Pro", "Apple", "Celulares", 10, 1200.00, "IPH15P", "Activo", "2024-01-15", "2025-01-15", ""],
      ["N020", "Asus", "Pantallas", 50, 150.00, "", "Activo", "2024-01-01", "2024-06-01", ""]
    ];

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...examples]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla Importación");

    const colWidths = headers[0].map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, "plantilla_importacion_mymorez.xlsx");
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
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2">
              <X size={16} />
              {error}
            </div>
          )}

          {inventory.length >= getPlanLimit(settings.plan) ? (
            <div className="text-center py-8">
              <div className="bg-orange-900/10 p-6 rounded-full inline-block mb-4 border border-orange-500/20">
                <Lock size={40} className="text-orange-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">{t('addProduct.limitReached')}</h4>
              <p className="text-gray-400 mb-6">
                {t('addProduct.limitDesc').replace('{limit}', getPlanLimit(settings.plan).toString()).replace('Starter', getPlanName(settings.plan))}
              </p>
              <Button onClick={() => { onClose(); setCurrentView('pricing'); }} icon={<Crown size={16} />}>
                {t('addProduct.viewPlans')}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {isDemoMode && (
                <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Database size={20} /></div>
                    <div className="text-left">
                      <h4 className="text-white font-bold text-sm">Modo Demostración</h4>
                      <p className="text-gray-400 text-xs">Carga datos ficticios para probar el sistema.</p>
                    </div>
                  </div>
                  <Button id="demo-import-btn" onClick={handleDemoImport} isLoading={isProcessing}>Cargar Prueba</Button>
                </div>
              )}

              {/* Text Input Area */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Instrucciones o Detalles</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ej: Agrega 5 Laptops Dell Inspirón a $800 y 3 iPhones 15 Pro..."
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-white placeholder-gray-500 h-32 resize-none outline-none focus:border-green-500/50 transition-colors"
                />
              </div>

              {/* Dropzone */}
              <div className="border-2 border-dashed border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-green-500 hover:bg-green-500/5 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <div className="bg-[#222] p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={28} className="text-gray-400 group-hover:text-green-500" />
                </div>
                <p className="text-sm font-medium text-white">Adjunta Archivos Adicionales</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Excels, Fotos (.jpg, .png), Texto o PDFs
                </p>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept=".csv, .xls, .xlsx, image/*, .txt, .pdf" onChange={handleFileChange} />
              </div>

              {/* File Pill Previews */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <div key={i} className="bg-[#2a2b2f] border border-white/10 text-gray-200 text-xs font-medium px-3 py-1.5 rounded-xl flex items-center gap-2 group">
                        {f.type.startsWith('image/') ? <ImageIcon size={14} className="text-blue-400" /> : <FileText size={14} className="text-green-400" />}
                        <span className="truncate max-w-[120px]">{f.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setFiles(files.filter((_, idx) => idx !== i)); }} className="text-gray-400 hover:text-white transition-colors bg-black/20 rounded-full p-0.5 ml-1">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-center mt-2">
                <Button variant="ghost" size="sm" onClick={downloadTemplate} icon={<Download size={14} />}>
                  Descargar Plantilla Excel
                </Button>
              </div>

              {/* Processing Overlay inside Modal */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] bg-[#111]/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl"
                  >
                    <div className="w-20 h-20 relative mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-t-green-500 border-r-green-500 border-b-[#222] border-l-[#222] rounded-full animate-spin-slow"></div>
                      <div className="w-14 h-14 bg-green-500/10 rounded-full animate-pulse flex items-center justify-center">
                        <Sparkles className="text-green-500 w-6 h-6" />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Procesando...</h2>
                    <p className="text-gray-400 text-xs text-center max-w-[200px]">Interpretando datos e insertando en el inventario.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-white/5 bg-[#161616] flex justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={() => { onClose(); setFiles([]); setPrompt(''); setError(null); }}>Cancelar</Button>
          <Button onClick={processImport} isLoading={isProcessing} disabled={files.length === 0 && prompt.trim() === ''}>Comenzar Importación</Button>
        </div>
      </div>
    </div>
  );
};
