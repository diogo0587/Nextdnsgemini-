import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiMessage } from '../types';

class GeminiService {
  private async getGenerativeModel() {
    // CRITICAL: Create a new instance right before making an API call
    // to ensure it always uses the most up-to-date API key.
    if (!process.env.API_KEY) {
      console.error("API_KEY is not defined. Please set the environment variable.");
      throw new Error("API_KEY is not defined.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async getNextDNSExplanation(
    messages: GeminiMessage[],
    systemInstruction: string,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const ai = await this.getGenerativeModel();
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const responseStream = await chat.sendMessageStream({
        message: contents[contents.length - 1].parts[0].text,
        history: contents.slice(0, contents.length - 1),
      });

      for await (const chunk of responseStream) {
        onChunk(chunk.text);
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      if (error.message.includes("Requested entity was not found.")) {
        // Specific error for Veo API key, but good to handle generally
        onError("API key error: The selected API key might be invalid or not properly configured for this model. Please select a valid API key.");
        // In a real app, you might trigger window.aistudio.openSelectKey() here
      } else {
        onError(`Failed to get response from Gemini: ${error.message || 'Unknown error'}`);
      }
    }
  }
}

export const geminiService = new GeminiService();
