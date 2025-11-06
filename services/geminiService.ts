import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiMessage } from '../types';

const GEMINI_API_KEY_LOCAL_STORAGE_KEY = 'gemini_api_key';

class GeminiService {
  private apiKey: string | null;

  constructor() {
    this.apiKey = this.getApiKeyFromStorage();
  }

  public getApiKeyFromStorage(): string | null {
    if (this.apiKey) return this.apiKey; // Return cached key if available
    try {
      const storedKey = localStorage.getItem(GEMINI_API_KEY_LOCAL_STORAGE_KEY);
      this.apiKey = storedKey; // Cache the key
      return storedKey;
    } catch (error) {
      console.error('Failed to retrieve Gemini API key from local storage:', error);
      return null;
    }
  }

  public setApiKey(key: string): void {
    try {
      localStorage.setItem(GEMINI_API_KEY_LOCAL_STORAGE_KEY, key);
      this.apiKey = key; // Update cached key
    } catch (error) {
      console.error('Failed to save Gemini API key to local storage:', error);
    }
  }

  public clearApiKey(): void {
    try {
      localStorage.removeItem(GEMINI_API_KEY_LOCAL_STORAGE_KEY);
      this.apiKey = null; // Clear cached key
    } catch (error) {
      console.error('Failed to clear Gemini API key from local storage:', error);
    }
  }

  private async getGenerativeModel() {
    const key = this.getApiKeyFromStorage();
    if (!key) {
      throw new Error("Gemini API Key is not configured. Please go to API Key Settings to set it.");
    }
    return new GoogleGenAI({ apiKey: key });
  }

  public async getNextDNSExplanation(
    messages: GeminiMessage[],
    systemInstruction: string,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const ai = await this.getGenerativeModel();

      // The last message in the array is the current user's prompt.
      // All preceding messages form the conversation history.
      const currentPromptMessage = messages[messages.length - 1];
      const conversationHistory = messages.slice(0, messages.length - 1).map(msg => ({
        role: msg.role, // 'user' or 'model' roles are already correct
        parts: [{ text: msg.content }],
      }));

      // Initialize the chat session with the conversation history
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: conversationHistory,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      // Send only the current user message to the chat session
      const responseStream = await chat.sendMessageStream({
        message: currentPromptMessage.content,
      });

      for await (const chunk of responseStream) {
        onChunk(chunk.text);
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      if (error.message.includes("API Key is not configured")) {
        onError(error.message); // Pass the specific message for API key
      } else if (error.message.includes("Requested entity was not found.")) {
        onError("API key error: The selected API key might be invalid or not properly configured for this model. Please check your API Key Settings.");
      } else {
        onError(`Failed to get response from Gemini: ${error.message || 'Unknown error'}`);
      }
    }
  }
}

export const geminiService = new GeminiService();