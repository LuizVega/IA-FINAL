
import { AIAnalysisResult, Product } from "../types";

import { supabase } from '../lib/supabase';

// Use gemini-flash-latest for better general availability and capacity
const DEFAULT_MODEL = "gemini-flash-latest";

// Robust JSON extractor helper
function extractJson(text: string): any {
  try {
    // Try direct parse first
    return JSON.parse(text.trim());
  } catch (e) {
    // Find first '{' and last '}'
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');

    if (first !== -1 && last !== -1 && last > first) {
      const potentialJson = text.substring(first, last + 1);
      try {
        return JSON.parse(potentialJson);
      } catch (innerError) {
        console.error("Failed to parse extracted JSON:", potentialJson);
        throw new Error("La respuesta de la IA contiene un JSON inválido.");
      }
    }
    throw new Error("No se encontró un formato JSON válido en la respuesta de la IA.");
  }
}

async function callGeminiApi(payload: any, model: string = DEFAULT_MODEL): Promise<any> {
  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { payload, model }
  });

  if (error) {
    console.error("Error from Edge Function:", error);
    throw new Error(error.message || "Error al comunicarse con la IA segura.");
  }

  if (data?.error) {
    throw new Error(data.error || "Error en la API de Gemini");
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Sin respuesta de la IA (Límite de cuota o filtro de seguridad)");

  return extractJson(text);
}

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<GenerativeFilePart> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.readAsDataURL(file);
  });

  return {
    data: await base64EncodedDataPromise,
    mimeType: file.type,
  };
};

// Analyze Image (Visual)
export const analyzeImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<AIAnalysisResult> => {
  const prompt = `
    Eres un experto en inventario.
    Analiza la imagen de este producto y genera un esquema JSON.
    Campos obligatorios: name, category, description, confidence, estimatedMarketPrice, suggestedTags.
    Categorías: Ferretería, Farmacia, Autopartes, Electrónica, Hogar, General.
    Responde ÚNICAMENTE con el objeto JSON.
  `;

  try {
    const payload = {
      contents: [{
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt }
        ]
      }]
    };

    return await callGeminiApi(payload);
  } catch (error) {
    console.error("Error analizando imagen:", error);
    return {
      name: "",
      category: "General",
      description: "No se pudo identificar. Ingrese nombre manualmente.",
      confidence: 0,
      suggestedTags: []
    };
  }
};

// Analyze Text
export const analyzeProductByName = async (productName: string): Promise<AIAnalysisResult> => {
  const prompt = `
    Producto: "${productName}". 
    Categorízalo y genera descripción comercial y precio de mercado en S/.
    Devuelve JSON con campos: category, description, estimatedMarketPrice.
    Responde ÚNICAMENTE con el JSON. No incluyas explicaciones.
  `;

  try {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const data = await callGeminiApi(payload);
    return { ...data, name: productName, confidence: 0.8 };
  } catch (error) {
    console.error("Error analizando texto:", error);
    return {
      name: productName,
      category: "General",
      description: "Descripción manual requerida.",
      confidence: 0,
      suggestedTags: []
    };
  }
};

export const generateSku = (category: string, name: string, count: number, customPrefix?: string): string => {
  const prefix = customPrefix ? customPrefix.toUpperCase() : category.substring(0, 3).toUpperCase();
  const sequence = (count + 1).toString().padStart(4, '0');
  if (customPrefix) return `${prefix}-${sequence}`;
  const nameCode = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || "GEN";
  return `${prefix}-${nameCode}-${sequence}`;
};

export interface GenerativeFilePart {
  data: string;
  mimeType: string;
}

export const processCopilotPrompt = async (promptText: string, files: GenerativeFilePart[] = []): Promise<Partial<Product>[]> => {
  let parts: any[] = [];
  if (files && files.length > 0) {
    files.forEach(file => {
      parts.push({ inlineData: { data: file.data, mimeType: file.mimeType } });
    });
  }

  const systemPrompt = `
    Eres un asistente de procesamiento de inventario masivo EXTREMADAMENTE DETALLISTA.
    Tu objetivo es DESCOMPONER los documentos o información recibida en una lista de productos INDIVIDUALES, sin omitir NADA.
    
    INSTRUCCIONES CRÍTICAS DE PRECISIÓN:
    1. Si el archivo es una lista, tabla o catálogo, DEBES extraer cada fila o ítem como un objeto separado.
    2. NUNCA resumas ni agrupes items con nombres similares. Si ves "Llavero A", "Llavero A (Rojo)" y "Llavero A (Azul)", DEBES generar 3 objetos JSON distintos.
    3. NO OMITAS items aunque parezcan repetidos o genéricos (ej. "LLAVERO LIMITADO"). Si aparece en el documento, es un producto válido que debe registrarse.
    4. Ignora títulos de documentos, encabezados o pies de página decorativos, pero SE TOTALMENTE INCLUSIVO con cualquier línea que parezca un producto.
    5. Si un ítem contiene múltiples unidades (ej. "3x Laptop Dell"), extrae el nombre como "Laptop Dell", el stock como 3 y el precio unitario si está disponible.
    6. Identifica categorías lógicas (Ferretería, Electrónica, etc.). Si no estás seguro, usa "General".

    Formato JSON obligatorio: 
    { 
      "products": [ 
        { 
          "name": "Nombre completo y específico del producto", 
          "brand": "Marca (si aplica)", 
          "category": "Categoría", 
          "price": 0, 
          "stock": 1, 
          "description": "Breve descripción",
          "confidence": 0.9
        } 
      ] 
    }
    
    Responde ÚNICAMENTE con el objeto JSON completo. No incluyas texto adicional fuera del JSON.
  `;

  parts.push({ text: systemPrompt + (promptText ? "\n\nInstrucción adicional: " + promptText : "") });

  try {
    const payload = { contents: [{ parts }] };
    const data = await callGeminiApi(payload);
    return data.products || [];
  } catch (error) {
    console.error("Error en processCopilotPrompt:", error);
    throw error;
  }
};
