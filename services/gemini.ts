
import { GoogleGenAI } from "@google/genai";
import { Product, Sale } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  try {
    // Using gemini-3-flash-preview for basic text tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe una descripción comercial atractiva y breve (máximo 20 palabras) para un producto llamado "${productName}" de la categoría "${category}". En español.`,
    });
    return response.text || "No se pudo generar la descripción.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error al conectar con IA.";
  }
};

export const analyzeSalesTrends = async (sales: Sale[], products: Product[]): Promise<string> => {
  try {
    // Summarize data to avoid token limits if data is huge
    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((acc, s) => acc + s.total, 0),
      recentSales: sales.slice(0, 20), // Last 20 sales
      lowStockProducts: products.filter(p => p.stock <= p.minStock).map(p => p.name)
    };

    // Using gemini-3-flash-preview for complex reasoning/analysis as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Actúa como un analista de negocios experto. Analiza los siguientes datos de ventas e inventario y dame 3 consejos estratégicos breves para mejorar la rentabilidad y gestión del inventario. Datos: ${JSON.stringify(summary)}`,
    });
    return response.text || "No se pudo realizar el análisis.";
  } catch (error) {
    console.error("Error analyzing trends:", error);
    return "Error al analizar datos.";
  }
};
