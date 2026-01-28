
import { GoogleGenAI } from "@google/genai";
import { Ticket, TicketUpdate } from "../types";

export const getTicketSummary = async (ticket: Ticket, updates: TicketUpdate[]): Promise<string> => {
  // Guidelines: Assume process.env.API_KEY is pre-configured and accessible.
  if (!process.env.API_KEY) return "API Key not configured for AI summaries.";

  try {
    // Guidelines: Use named parameter for apiKey and initialize strictly before use.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      As a senior project manager, summarize the progress of the following ticket.
      
      Ticket Title: ${ticket.title}
      Description: ${ticket.description}
      Current Status: ${ticket.status}
      
      Work Updates:
      ${updates.map(u => `- [${u.createdAt}] ${u.updateText}`).join('\n')}
      
      Please provide a concise 3-sentence summary of the current progress and any potential bottlenecks.
    `;

    // Guidelines: Use gemini-3-flash-preview for summarization tasks.
    // When setting maxOutputTokens, a thinkingBudget must be set to reserve tokens for output.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 100 },
      }
    });

    // Guidelines: Access .text property directly (not a method).
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini summary error:", error);
    return "Failed to generate AI summary.";
  }
};
