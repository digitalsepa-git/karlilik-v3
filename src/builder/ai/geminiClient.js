import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Fallback to empty string to prevent crashing if key is not set yet
export const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_KEY" });

export const MODEL = "gemini-2.5-flash";
