import { GoogleGenAI } from "@google/genai";
import { InvitationDetails, GeminiMessage } from '../types';

class GeminiService {
  private async getGenerativeModel() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is not configured. It must be provided via environment variable process.env.API_KEY.");
    }
    return new GoogleGenAI({ apiKey: apiKey });
  }

  public async createInvitation(details: InvitationDetails): Promise<string> {
    const ai = await this.getGenerativeModel();
    const model = 'gemini-2.5-flash';

    const prompt = `
      Act as a creative graphic designer specializing in elegant event invitations.
      Your task is to generate a complete, self-contained HTML for a beautiful bridal shower invitation card.

      **CRITICAL INSTRUCTIONS:**
      1.  **Output Format:** Generate ONLY a single block of HTML code. Do not include any markdown fences (\`\`\`html), explanations, or any text outside of the HTML code itself. The output must be ready to be directly rendered in a browser.
      2.  **Styling:** All CSS must be included within a single \`<style>\` tag in the \`<head>\` of the HTML. Do NOT use inline styles on individual elements. Use classes for styling.
      3.  **Fonts:** Use elegant, web-safe fonts or import a suitable free font from Google Fonts (e.g., 'Playfair Display' for headings, 'Poppins' for body text).
      4.  **Content:** The invitation must include all the details provided below.
      5.  **Design Theme:** The overall design (colors, imagery, layout) must strictly adhere to the specified theme.
      6.  **Imagery:** Do not use \`<img>\` tags. Instead, create visual elements using CSS (gradients, borders, shapes) or subtle SVG backgrounds if necessary.

      **Invitation Details:**
      - **Event:** Bridal Shower
      - **Honoring:** ${details.brideName} ${details.groomName ? `& ${details.groomName}` : ''}
      - **Date:** ${details.date}
      - **Time:** ${details.time}
      - **Location/Address:** ${details.location}
      - **RSVP Information:** ${details.rsvpInfo}
      - **Gift Registry:** ${details.registryInfo || 'Your presence is the only gift we need!'}
      - **Design Theme:** ${details.theme}

      Now, generate the complete HTML code for the invitation.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        // Clean up the response to remove markdown fences if Gemini accidentally adds them
        let htmlContent = response.text.trim();
        if (htmlContent.startsWith('```html')) {
            htmlContent = htmlContent.substring(7);
        }
        if (htmlContent.endsWith('```')) {
            htmlContent = htmlContent.substring(0, htmlContent.length - 3);
        }
        return htmlContent.trim();
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        if (error.message.includes("API Key is not configured") || error.message.includes("api_key")) {
            throw new Error("Gemini API Key is not configured or invalid. Please ensure process.env.API_KEY is correctly set.");
        }
        throw new Error(`Failed to generate invitation: ${error.message || 'Unknown error'}`);
    }
  }

  public async getNextDNSExplanation(
    chatHistory: GeminiMessage[],
    systemInstruction: string,
    onChunk: (chunk: string) => void,
    onError: (errorMsg: string) => void
  ): Promise<void> {
    try {
      const ai = await this.getGenerativeModel();
      const model = 'gemini-2.5-flash';

      const contents = chatHistory
        .filter(msg => msg.content.trim() !== '')
        .map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));

      const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      for await (const chunk of responseStream) {
        onChunk(chunk.text);
      }
    } catch (error: any) {
      console.error('Gemini API Error in getNextDNSExplanation:', error);
      let errorMessage = `Failed to get explanation: ${error.message || 'Unknown error'}`;
      if (error.message.includes("API Key is not configured") || error.message.includes("api_key")) {
        errorMessage = "Gemini API Key is not configured or invalid. Please ensure process.env.API_KEY is correctly set.";
      }
      onError(errorMessage);
    }
  }
}

export const geminiService = new GeminiService();
