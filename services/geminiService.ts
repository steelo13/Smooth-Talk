import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, Tone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // Strip header if present to get pure base64
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

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
    // Construct the chat history for the model
    // We only use text for the simulation to keep it simple and fast
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are roleplaying a character in a specific scenario: "${scenarioContext}". 
        Reply naturally to the user. Keep responses concise (under 30 words) like a real text message.
        If the user is awkward, be slightly hesitant but polite. If they are charming, be receptive.`,
      },
    });

    // We need to send the history. The SDK manages history in the chat object, 
    // but since we are stateless in this function, we'll just send the last message 
    // effectively or rebuild context. For simplicity in this demo, we assume the history 
    // is managed by the caller if we were using a persistent chat object, 
    // but here we will just use generateContent with the full transcript for the "next turn".
    
    // Better approach for stateless functional component usage:
    // Just prompt with the conversation log.
    
    const transcript = history.map(m => `${m.role === 'user' ? 'User' : 'Match'}: ${m.text}`).join('\n');
    const prompt = `${transcript}\nMatch:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "...";
  } catch (error) {
    console.error("Chat simulation failed:", error);
    return "Sorry, I got distracted! What did you say?";
  }
};
