
import { GoogleGenAI } from "@google/genai";
import { Ticket, TicketUpdate } from "../components/TicketTypes.ts";

export const getTicketSummary = async (ticket: Ticket, updates: TicketUpdate[]): Promise<string> => {
  // Guidelines: Assume process.env.API_KEY is pre-configured and accessible.
  // In Vite, we should use import.meta.env.VITE_GEMINI_API_KEY
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return "AI Summary service unavailable (API Key missing).";

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      As a senior project manager, summarize the progress of the following ticket.
      
      Ticket Title: ${ticket.title}
      Description: ${ticket.description}
      Current Status: ${ticket.status}
      
      Work Updates:
      ${updates.map(u => `- [${u.createdAt}] ${u.updateText}`).join('\n')}
      
      Please provide a concise 3-sentence summary of the current progress and any potential bottlenecks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200
      }
    });

    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini summary error:", error);
    return "Failed to generate AI summary.";
  }
};
