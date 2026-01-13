
import { GoogleGenAI } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  createChat() {
    // gemini-3-pro-preview is preferred for technical architectural advice and precise solutions.
    return this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are InfiniteAI Assistant v4.2.0, a highly advanced technical assistant for InfiniteTech. You provide optimized, memory-efficient code solutions and technical architectural advice. Your tone is professional, technical, and precise.",
      }
    });
  }

  async *streamChat(chat, message) {
    const stream = await chat.sendMessageStream({ message });
    for await (const chunk of stream) {
      // Accessing the .text property directly as it returns the extracted string output.
      yield chunk.text;
    }
  }
}

export const gemini = new GeminiService();
