
import { GoogleGenAI } from "@google/genai";

// Standardizing initialization according to Google GenAI SDK guidelines
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  createChat() {
    // Using recommended model 'gemini-3-pro-preview' for complex reasoning and professional assistance
    return this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are InfiniteAI Assistant v4.2.0, the specialized internal companion for InfiniteTech. You assist users like John Doe (Senior Software Engineer) with platform settings, attendance data, and project workload management. Be professional, concise, and helpful.",
      }
    });
  }

  async *streamChat(chat: any, message: string) {
    const stream = await chat.sendMessageStream({ message });
    for await (const chunk of stream) {
      // The GenerateContentResponse object features a .text property (not a method).
      yield chunk.text;
    }
  }
}

export const gemini = new GeminiService();
