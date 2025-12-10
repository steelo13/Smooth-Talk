import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, Tone } from "../types";

// Lazy initialization prevents crash on load if process.env is undefined in browser
let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiInstance) {
    // Safe access to API Key via global process (polyfilled in index.html) or direct access
    // @ts-ignore - We are accessing the global process polyfill
    const env = (typeof window !== 'undefined' && window.process) ? window.process.env : (typeof process !== 'undefined' ? process.env : {});
    
    // NOTE: This will still fail if API_KEY is not injected by the build environment/server.
    // In the AI Studio preview, it is injected safely.
    const apiKey = env.API_KEY || '';
    
    if (!apiKey) {
      console.warn("API Key is missing. AI features will not work.");
    }
    
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    vibe: { type: Type.STRING, description: "A short description of the person's vibe based on visual cues (e.g., 'Friendly & confident')" },
    lines: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "10 personalized chat-up lines or openers",
    },
    dmDraft: { type: Type.STRING, description: "A full draft for a direct message" },
    socialComment: { type: Type.STRING, description: "A draft for a public comment (Instagram/TikTok)" },
    advice: { type: Type.STRING, description: "Brief advice on how to approach this specific person" },
  },
  required: ["vibe", "lines", "dmDraft", "socialComment", "advice"],
};

export const analyzePhoto = async (base64Image: string, tone: Tone): Promise<AnalysisResult> => {
  try {
    const ai = getAi();
    
    // Strip header if present to get pure base64 (Handles png, jpeg, webp, etc. case insensitive)
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `Analyze this image of a person. Identify their 'vibe' (style, mood, environment). 
    Generate conversation starters based on visual cues (outfit, setting, expression).
    Tone: ${tone}.
    Safety: Do not be rude, harassing, or explicit. Be respectful and engaging.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert dating coach and social skills mentor called BoldTalk.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const simulateChatResponse = async (history: { role: string; text: string }[], scenarioContext: string): Promise<string> => {
  try {
    const ai = getAi();
    
    // We construct a text transcript for the model to continue the conversation.
    const transcript = history.map(m => `${m.role === 'user' ? 'User' : 'Match'}: ${m.text}`).join('\n');
    const prompt = `${transcript}\nMatch:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are roleplaying a character in a specific scenario: "${scenarioContext}". 
        Reply naturally to the user. Keep responses concise (under 30 words) like a real text message.
        If the user is awkward, be slightly hesitant but polite. If they are charming, be receptive.`,
      },
    });

    return response.text || "...";
  } catch (error) {
    console.error("Chat simulation failed:", error);
    return "Sorry, I got distracted! What did you say?";
  }
};