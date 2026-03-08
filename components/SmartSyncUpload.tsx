import React, { useState, useRef } from 'react';
import { Upload, X, Check, Database, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { Product, CategoryConfig } from '../types';
import { generateSku, processCopilotPrompt, fileToGenerativePart } from '../services/geminiService';
import { addMonths } from 'date-fns';
import { DEFAULT_PRODUCT_IMAGE, getPlanLimit, getPlanName } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';

export const SmartSyncUpload: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { categories, bulkAddProducts, bulkAddCategories, inventory, settings, isDemoMode, generateDemoData, setTourStep } = useStore();
    const { t } = useTranslation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
            setError(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
            setError(null);
        }
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
        if (files.length === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            const newProducts: Product[] = [];
            const newCategoriesList: CategoryConfig[] = [];
            const newlyAddedCategories = new Set<string>();
            let imageBase64s: { data: string, mimeType: string }[] = [];
            let prompt = '';

            for (const f of files) {
                const fileName = f.name.toLowerCase();
                const isImage = f.type.startsWith('image/');
                const isPdf = f.type === 'application/pdf' || fileName.endsWith('.pdf');
                const isExcel = fileName.match(/\.(csv|xls|xlsx)$/i);
                const isDoc = fileName.match(/\.(doc|docx|odt|rtf)$/i);
                const isTxt = fileName.endsWith('.txt');

                if (isImage || isPdf) {
                    // Send as binary data (inlineData) to Gemini for advanced processing
                    const part = await fileToGenerativePart(f);
                    let mimeType = f.type;
                    if (isPdf) mimeType = 'application/pdf';
                    imageBase64s.push({ data: part.data, mimeType });
                } else if (isDoc) {
                    // Extract text locally for Word documents since Gemini doesn't support the MIME type directly
                    try {
                        const arrayBuffer = await f.arrayBuffer();
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        if (result.value.trim()) {
                            prompt += `\n\n[Contenido del archivo Word ${f.name}]:\n${result.value}`;
                        } else {
                            prompt += `\n\n[El archivo Word ${f.name} parece estar vacío o no se pudo extraer texto.]`;
                        }
                    } catch (e) {
                        console.error('Error extracting text from Word doc:', e);
                        prompt += `\n\n[Error procesando el documento Word ${f.name}. Por favor intente convertirlo a PDF.]`;
                    }
                } else if (isExcel) {
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
                } else if (isTxt) {
                    try {
                        const text = await f.text();
                        prompt += `\n\n[Contenido del archivo ${f.name}]:\n${text}`;
                    } catch (e) {
                        prompt += `\n\n[Error leyendo texto de ${f.name}]`;
                    }
                }
            }

            if (prompt.trim() || imageBase64s.length > 0) {
                const aiProducts = await processCopilotPrompt(prompt || "Analiza esta imagen y extrae el inventario", imageBase64s);
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
                throw new Error(`Se ha superado el límite de productos del plan ${getPlanName(settings.plan)}. Máximo: ${PLAN_LIMIT}.`);
            }

            if (newCategoriesList.length > 0) bulkAddCategories(newCategoriesList);
            if (newProducts.length > 0) bulkAddProducts(newProducts);

            setFiles([]);
        } catch (err: any) {
            console.error('Error importing data:', err);
            setError(err.message || 'Error al procesar la importación. Comprueba el formato de los datos.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto mt-4">
            <div
                className={`w-full max-w-lg p-10 rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden backdrop-blur-md
          ${isDragOver ? 'border-green-500 bg-green-500/10 scale-[1.02] shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 'border-white/10 bg-[#141414]/80 hover:border-green-500/50 hover:bg-[#1a1a1a]/80'}
          ${files.length > 0 ? 'border-blue-500/50 bg-blue-500/5' : ''}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => files.length === 0 && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept=".csv, .xls, .xlsx, image/*, .txt, .pdf, .doc, .docx, .odt, .rtf"
                    onChange={handleFileChange}
                />

                {/* Loading Overlay */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 bg-[#111]/90 backdrop-blur-xl flex flex-col items-center justify-center"
                        >
                            <div className="w-16 h-16 relative flex items-center justify-center mb-4">
                                <div className="absolute inset-0 border-4 border-t-green-500 border-r-green-500 border-b-[#222] border-l-[#222] rounded-full animate-spin-slow"></div>
                                <Sparkles className="text-green-500 w-6 h-6 animate-pulse" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Procesando Archivos...</h3>
                            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Nuestra IA está interpretando tus datos e inventarios.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload State / Empty State */}
                {!isProcessing && files.length === 0 && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-[#222] rounded-3xl flex items-center justify-center text-green-500 shadow-inner group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Carga Sincronizada</h2>
                            <p className="text-sm text-gray-400 mt-2">
                                Suelta tus archivos <span className="bg-[#222] text-xs px-1.5 py-0.5 rounded font-mono">Excel</span>, <span className="bg-[#222] text-xs px-1.5 py-0.5 rounded font-mono">PDF</span> o <span className="bg-[#222] text-xs px-1.5 py-0.5 rounded font-mono">Word</span> aquí.<br />Nuestra IA mapeará automáticamente el inventario.
                            </p>
                        </div>
                    </div>
                )}

                {/* Files Selected State */}
                {!isProcessing && files.length > 0 && (
                    <div className="flex flex-col w-full z-10">
                        <h3 className="text-lg font-bold text-white mb-4 text-center">Archivos Preparados</h3>
                        <div className="bg-[#0f0f0f] rounded-2xl p-4 max-h-[200px] overflow-y-auto w-full space-y-2 border border-black/50 shadow-inner">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center justify-between text-left p-2 hover:bg-white/5 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {f.type.startsWith('image/') ? <ImageIcon size={18} className="text-blue-400 shrink-0" /> : <FileText size={18} className="text-green-400 shrink-0" />}
                                        <span className="text-sm text-gray-200 truncate">{f.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFiles(files.filter((_, idx) => idx !== i)); }}
                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-left">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center mt-6">
                            <Button variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} size="sm" icon={<Upload size={14} />}>Añadir más</Button>
                            <Button variant="primary" onClick={(e) => { e.stopPropagation(); processImport(); }} size="sm" icon={<Sparkles size={14} />}>Comenzar Carga</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
