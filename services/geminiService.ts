
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Product } from "../types";

// Helper to access environment variables safely
const getApiKey = (): string | undefined => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
    // @ts-ignore
    if (import.meta.env.VITE_GOOGLE_API_KEY) return import.meta.env.VITE_GOOGLE_API_KEY;
  }
  // Fallback for older setups or node environments
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
    if (process.env.API_KEY) return process.env.API_KEY;
  }
  return undefined;
};

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Analyze Image (Visual)
export const analyzeImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<AIAnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key de Google (Gemini) no encontrada. Configura VITE_GEMINI_API_KEY en Vercel o en tu .env local.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Actúa como un experto en inventario y fijación de precios.
    Analiza la imagen de este producto.
    1. Identifica el nombre exacto del producto.
    2. Categorízalo en una de estas: Ferretería, Farmacia, Autopartes, Electrónica, Hogar, General.
    3. Genera una descripción breve pero comercial en español.
    4. Estima el precio de mercado promedio (precio al público) en USD basado en tu conocimiento general.
    5. Indica tu nivel de confianza (0-1).
    Devuelve JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt + " IMPORTANTE: El precio debe ser en Soles Peruanos (S/)." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedMarketPrice: { type: Type.NUMBER, description: "Precio estimado de venta al público en S/" },
            boundingBox: {
              type: Type.OBJECT,
              description: "Posición del producto principal. Coordenadas normalizadas 0 a 1000.",
              properties: {
                x_min: { type: Type.NUMBER },
                y_min: { type: Type.NUMBER },
                x_max: { type: Type.NUMBER },
                y_max: { type: Type.NUMBER },
              },
            },
          },
          required: ["name", "category", "description", "confidence"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sin respuesta de la IA");
    return JSON.parse(text) as AIAnalysisResult;

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

// Analyze Text (Fallback when user provides name)
export const analyzeProductByName = async (productName: string): Promise<AIAnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key de Google (Gemini) no encontrada.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    El usuario tiene un producto llamado "${productName}" pero no tenemos una imagen clara.
    1. Categorízalo en una de estas: Ferretería, Farmacia, Autopartes, Electrónica, Hogar, General.
    2. Genera una descripción comercial convincente en español.
    3. Busca en tu conocimiento el precio de mercado estándar promedio (al por menor) en USD.
    4. Sugiere tags.
    Devuelve JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedMarketPrice: { type: Type.NUMBER }
          },
          required: ["category", "description", "estimatedMarketPrice"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sin respuesta de la IA");

    // Merge provided name with result
    const data = JSON.parse(text);
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
  const prefix = customPrefix
    ? customPrefix.toUpperCase()
    : category.substring(0, 3).toUpperCase();

  // If customPrefix is provided (from category config), we assume user wants a clean sequence: PREFIX-0001
  // If no custom prefix, we use the generated name hash: PREFIX-NAME-0001

  const sequence = (count + 1).toString().padStart(4, '0');

  if (customPrefix) {
    return `${prefix}-${sequence}`;
  }

  const nameCode = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || "GEN";
  return `${prefix}-${nameCode}-${sequence}`;
};

export const processCopilotPrompt = async (promptText: string, base64Images: string[]): Promise<Partial<Product>[]> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key de Google (Gemini) no encontrada.");

  const ai = new GoogleGenAI({ apiKey });

  let parts: any[] = [];
  if (base64Images && base64Images.length > 0) {
    base64Images.forEach(img => {
      parts.push({ inlineData: { data: img, mimeType: "image/jpeg" } });
    });
  }

  const systemPrompt = `
    Actúa como un asistente experto en inventario.
    El usuario te enviará instrucciones en texto y/o imágenes sobre productos que quiere agregar a su tienda.
    Extrae o deduce una lista de productos a partir de la información proporcionada.
    Para cada producto, proporciona:
    - name: Nombre claro.
    - brand: Marca (o "Genérico").
    - category: Una de estas (Ferretería, Farmacia, Autopartes, Electrónica, Hogar, Celulares, Laptops, Ropa, General).
    - price: Precio unitario estimado al público en moneda local, numérico (busca en tu conocimiento o usa lo indicado por el usuario).
    - stock: Cantidad disponible (numérico, por defecto 1 si no se especifica).
    - description: Descripción atráctiva de 1 o 2 líneas.
    - confidence: 0 a 1.
    Devuelve siempre JSON con la estructura { "products": [ ... ] }.
  `;

  if (promptText) {
    parts.push({ text: systemPrompt + "\n\nInstrucción del usuario: " + promptText });
  } else {
    parts.push({ text: systemPrompt });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  category: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  stock: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                },
                required: ["name", "category", "price", "stock", "description"]
              }
            }
          },
          required: ["products"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sin respuesta de la IA");

    const data = JSON.parse(text);
    return data.products || [];
  } catch (error) {
    console.error("Error en processCopilotPrompt:", error);
    throw error;
  }
};
