
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIHint = async (currentContext: string, lastUserResponse: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Ти - досвідчений коуч з продажів. 
      Поточний скрипт: "${currentContext}". 
      Остання фраза клієнта: "${lastUserResponse}". 
      Дай одну коротку, дієву пораду (до 15 слів), що сказати або як змінити тактику прямо зараз.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });
    return response.text?.trim() || "Продовжуйте за скриптом, фокусуючись на вигоді.";
  } catch (error) {
    console.error("AI Hint Error:", error);
    return "Спробуйте перевести розмову на наступний етап.";
  }
};
