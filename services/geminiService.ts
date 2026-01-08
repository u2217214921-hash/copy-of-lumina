
import { GoogleGenAI, Type } from "@google/genai";
import { AIParsedEvent, CalendarEvent } from "../types";

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Parses natural language input into a structured event object using Gemini 1.5 Pro.
 * Uses gemini-1.5-pro-preview for complex reasoning and data extraction tasks.
 */
export const parseNaturalLanguageEvent = async (input: string, referenceDate: string): Promise<AIParsedEvent | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro-preview",
      contents: `Analizza l'input dell'utente per creare un evento. Data di riferimento: ${referenceDate}. 
      Se l'utente cita un codice turno (es. 401, 819, RIP), impostalo come titolo.
      Rispondi esclusivamente in formato JSON.
      
      Input dell'utente: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            start: { type: Type.STRING, description: "Formato ISO 8601" },
            end: { type: Type.STRING, description: "Formato ISO 8601" },
            category: { 
              type: Type.STRING, 
              enum: ['work', 'personal', 'health', 'other', 'shift'] 
            }
          },
          required: ["title", "start", "end", "category"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    // Robust JSON extraction to handle cases where the model might include surrounding text.
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) return null;
    
    const cleanJson = text.substring(startIdx, endIdx + 1);
    const parsed = JSON.parse(cleanJson);
    return {
        ...parsed,
        category: parsed.category || 'shift'
    } as AIParsedEvent;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};
