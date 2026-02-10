
import { GoogleGenAI, Type } from "@google/genai";
import { CodeState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIHelp = async (code: CodeState, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are an expert web developer working at Devnox IT.
        Current Codebase:
        HTML: ${code.html}
        CSS: ${code.css}
        JS: ${code.js}

        User Request: ${prompt}

        Instructions:
        1. If the user asks for code changes, provide the complete new code for the relevant parts.
        2. Format code blocks using markdown syntax: \`\`\`html for HTML, \`\`\`css for CSS, \`\`\`js or \`\`\`javascript for JavaScript.
        3. When providing code, include the full updated code for each section that changes.
        4. Format your response clearly with explanations and code blocks.
        5. Be helpful and professional.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Sorry, I couldn't process that.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to connect to AI service.";
  }
};

export const suggestImprovements = async (code: CodeState): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this web code and suggest 3 high-impact improvements for UI/UX or performance: 
      HTML: ${code.html}
      CSS: ${code.css}
      JS: ${code.js}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return response.text || "[]";
  } catch (error) {
    return "[]";
  }
};
