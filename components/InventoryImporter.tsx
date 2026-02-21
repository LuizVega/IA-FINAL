
import React, { useState, useRef } from 'react';
import { Upload, X, Check, Download, Lock, Crown, Database } from 'lucide-react';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { Product, CategoryConfig } from '../types';
import { generateSku } from '../services/geminiService';
import { addMonths } from 'date-fns';
import { DEFAULT_PRODUCT_IMAGE, getPlanLimit, getPlanName } from '../constants';
import * as XLSX from 'xlsx';

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
  const { t } = useTranslation();

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
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet) {
          setError('No se pudo encontrar ninguna hoja en el archivo Excel.');
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 1) {
          setError('El archivo parece estar vacío.');
          return;
        }

        if (jsonData.length < 2) {
          setPreview([]);
          return;
        }

        setPreview(jsonData.slice(1, 6));
      } catch (err) {
        console.error('Error parsing file preview:', err);
        setError('Error al procesar el archivo. Comprueba que sea un archivo Excel o CSV válido.');
      }
    };
    reader.readAsArrayBuffer(file);
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

  const processImport = () => {
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          throw new Error('No valid sheet found');
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

        if (jsonData.length < 2) {
          setError('El archivo no contiene suficientes datos.');
          setIsProcessing(false);
          return;
        }

        const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

        const PLAN_LIMIT = getPlanLimit(settings.plan);
        if (inventory.length + dataRows.length > PLAN_LIMIT) {
          const limitMsg = t('addProduct.limitDesc')
            .replace('{limit}', PLAN_LIMIT.toString())
            .replace('Starter', getPlanName(settings.plan));
          alert(`Error: ${limitMsg}`);
          setIsProcessing(false);
          return;
        }

        const newProducts: Product[] = [];
        const newCategoriesList: CategoryConfig[] = [];
        const existingCategoryNames = new Set(categories.map(c => c.name.toLowerCase()));
        const newlyAddedCategories = new Set<string>();

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          if (!row[0]) continue;

          let brand = String(row[1] || '').trim();
          let catName = String(row[2] || 'General').trim();
          let stock = parseInt(String(row[3])) || 0;
          let price = parseFloat(String(row[4])) || 0;
          let providedSku = String(row[5] || '').trim();
          let status = String(row[6] || '').trim();
          let entryDateRaw = row[7];
          let warrantyDateRaw = row[8];
          let providedImageUrl = row[9] ? String(row[9]).trim() : '';

          const { name, extractedSku } = constructSmartName(row);

          const nameLower = name.toLowerCase();
          if (catName === 'General') {
            if (nameLower.includes('iphone') || nameLower.includes('samsung') || nameLower.includes('xiaomi') || nameLower.includes('celular')) {
              catName = 'Celulares';
            } else if (nameLower.includes('laptop') || nameLower.includes('macbook') || nameLower.includes('dell')) {
              catName = 'Laptops';
            }
          }

          const existingCat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
          const alreadyAdded = newlyAddedCategories.has(catName.toLowerCase());

          if (!existingCat && !alreadyAdded && catName !== 'General') {
            const prefix = catName.substring(0, 3).toUpperCase();
            newCategoriesList.push({
              id: crypto.randomUUID(),
              name: catName,
              prefix: prefix,
              margin: 0.30,
              color: 'bg-[#222] text-gray-300 border-gray-600',
              isInternal: false
            });
            newlyAddedCategories.add(catName.toLowerCase());
          }

          let sku = providedSku || extractedSku;
          if (!sku) {
            const prefix = existingCat ? existingCat.prefix : (newCategoriesList.find(c => c.name.toLowerCase() === catName.toLowerCase())?.prefix || 'GEN');
            sku = generateSku(catName, name, inventory.length + newProducts.length, prefix);
          }

          const tags: string[] = [];
          if (status.toLowerCase().includes('descontinuado')) tags.push('Descontinuado');

          let finalImageUrl = DEFAULT_PRODUCT_IMAGE;
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

        if (newCategoriesList.length > 0) {
          bulkAddCategories(newCategoriesList);
        }
        bulkAddProducts(newProducts);

        setIsProcessing(false);
        onClose();
        setFile(null);
      } catch (err) {
        console.error('Error importing data:', err);
        setError('Error al procesar la importación. Comprueba el formato del archivo.');
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
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
          ) : !file ? (
            <div className="space-y-8">
              {isDemoMode && (
                <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Database size={20} /></div>
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
                  <br />Formatos soportados: .xlsx, .xls, .csv
                </p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xls, .xlsx" onChange={handleFileChange} />
              </div>
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={downloadTemplate} icon={<Download size={14} />}>
                  Descargar Plantilla Excel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                <Check size={16} className="text-green-500" />
                <div className="flex-1">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-xs text-gray-400">Archivo listo para procesar</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview([]); setError(null); }}>Cambiar</Button>
              </div>

              {preview.length > 0 && (
                <div className="bg-[#161616] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-3 border-b border-white/5 bg-white/5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vista Previa</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-400">
                      <thead className="bg-[#222]">
                        <tr>
                          <th className="p-2 border-r border-white/5">Producto</th>
                          <th className="p-2 border-r border-white/5">Marca</th>
                          <th className="p-2">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, idx) => (
                          <tr key={idx} className="border-t border-white/5">
                            <td className="p-2 border-r border-white/5 truncate max-w-[150px]">{row[0]}</td>
                            <td className="p-2 border-r border-white/5 truncate max-w-[100px]">{row[1]}</td>
                            <td className="p-2">{row[3]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {file && (
          <div className="p-6 border-t border-white/5 bg-[#161616] flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setFile(null); setPreview([]); setError(null); }}>Cancelar</Button>
            <Button onClick={processImport} isLoading={isProcessing}>Comenzar Importación</Button>
          </div>
        )}
      </div>
    </div>
  );
};
