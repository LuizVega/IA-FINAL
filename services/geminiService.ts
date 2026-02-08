import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

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
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

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
      model: "gemini-3-flash-preview", 
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt },
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
            estimatedMarketPrice: { type: Type.NUMBER, description: "Precio estimado de venta al público" }
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

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
