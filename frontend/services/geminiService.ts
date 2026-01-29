
import { GoogleGenAI } from "@google/genai";

class GeminiService {
  private ai: any = null;
  private initialized: boolean = false;

  constructor() { }

  private init() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      // In Vite, use import.meta.env. Using 'as any' to bypass TS check.
      const key = (import.meta as any).env?.VITE_GEMINI_API_KEY;

      console.log("Initializing Gemini... Key present:", !!key);

      // Only initialize if we have a real-looking key
      if (key && key !== 'undefined' && key !== 'null' && key.length > 10) {
        try {
          // New SDK uses object
          this.ai = new GoogleGenAI({ apiKey: key });
        } catch (e) {
          console.error("Gemini init failed:", e);
        }
      } else {
        console.warn("Gemini API Key missing or invalid.");
      }
    } catch (e) {
      console.warn("Gemini AI initialization ignored:", e);
    }
  }

  createChat() {
    this.init();
    if (!this.ai) {
      return {
        isMock: true,
        sendMessageStream: async function* () {
          yield "AI Assistant is currently offline. Please set VITE_GEMINI_API_KEY in your environment variables to enable it.";
        }
      };
    }

    try {
      // Check for OLD SDK (google-generative-ai)
      if (typeof this.ai.getGenerativeModel === 'function') {
        const model = this.ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        return model.startChat();
      }
      // Check for NEW SDK (@google/genai)
      else if (this.ai.chats && typeof this.ai.chats.create === 'function') {
        const chat = this.ai.chats.create({
          model: 'gemini-1.5-flash',
          config: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
          history: [
            { role: 'user', parts: [{ text: 'Hello' }] },
            { role: 'model', parts: [{ text: 'Hello! How can I help you today?' }] }
          ]
        });
        return chat;
      }
    } catch (e) {
      console.error("Chat creation failed", e);
    }
    return null;
  }

  async *streamChat(chat: any, message: string) {
    if (!chat) {
      yield "AI Connection Error.";
      return;
    }
    if (chat.isMock) {
      yield* chat.sendMessageStream();
      return;
    }

    try {
      const stream = await chat.sendMessageStream({ message });
      for await (const chunk of stream) {
        // Handle different response structures
        if (chunk.text) yield chunk.text;
        else if (chunk.response) yield await chunk.response.text();
      }
    } catch (e) {
      yield "Error: AI service is currently overloaded or unavailable.";
    }
  }
}

export const gemini = new GeminiService();
