import { GoogleGenAI } from "@google/genai";
import { GeminiMessage } from '../types';

class GeminiService {
  // A chave de API Gemini DEVE ser obtida exclusivamente de process.env.API_KEY,
  // conforme as diretrizes do Google GenAI.
  // Gerenciamento de chave via localStorage para Gemini API foi removido.

  constructor() {
    // Não é necessário carregar a chave de API Gemini do localStorage aqui,
    // pois ela será acessada via process.env.API_KEY no momento da inicialização do modelo.
  }

  // Métodos relacionados ao armazenamento local da chave de API Gemini foram removidos
  // para cumprir as diretrizes.

  private async getGenerativeModel() {
    // A API key deve ser acessada via process.env.API_KEY, assumindo que esteja configurada.
    const apiKey = process.env.API_KEY; 
    if (!apiKey) {
      throw new Error("Gemini API Key is not configured. It must be provided via environment variable process.env.API_KEY.");
    }
    return new GoogleGenAI({ apiKey: apiKey });
  }

  public async getNextDNSExplanation(
    messages: GeminiMessage[],
    systemInstruction: string,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const ai = await this.getGenerativeModel();

      const currentPromptMessage = messages[messages.length - 1];
      const conversationHistory = messages.slice(0, messages.length - 1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: conversationHistory,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const responseStream = await chat.sendMessageStream({
        message: currentPromptMessage.content,
      });

      for await (const chunk of responseStream) {
        onChunk(chunk.text);
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      if (error.message.includes("API Key is not configured") || error.message.includes("api_key")) {
        onError("Gemini API Key is not configured or invalid. Please ensure process.env.API_KEY is correctly set for the environment.");
      } else if (error.message.includes("Requested entity was not found.")) {
        onError("API key error: The selected API key might be invalid or not properly configured for this model. Please check your environment configuration.");
      } else {
        onError(`Failed to get response from Gemini: ${error.message || 'Unknown error'}`);
      }
    }
  }
}

export const geminiService = new GeminiService();