import React, { useState, useRef, useEffect, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { GeminiMessage } from '../types';
import Input from '../components/Input';
import Button from '../components/Button';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

const systemInstruction = `You are a helpful AI assistant specialized in NextDNS configuration and troubleshooting. Provide concise, accurate, and actionable advice based on NextDNS features. When asked about settings, assume the user is asking about the options available in a NextDNS management panel. Do not mention external APIs unless explicitly asked to. Do not provide information outside the scope of NextDNS.`;

const GeminiAssistantPage: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<GeminiMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  // isApiKeyConfigured state removed as Gemini API Key is now expected from environment variables.
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme(); // Use theme context

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    // Removed isApiKeyConfigured check, as API key is now assumed from environment.
    if (!currentMessage.trim() || isLoading) return; 

    const userMessage: GeminiMessage = { role: 'user', content: currentMessage };
    setChatHistory((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setApiError(null);

    // Placeholder for Gemini's response while streaming
    const modelMessagePlaceholder: GeminiMessage = { role: 'model', content: '' };
    setChatHistory((prev) => [...prev, modelMessagePlaceholder]);

    try {
      await geminiService.getNextDNSExplanation(
        [...chatHistory, userMessage], // Send full history for context
        systemInstruction,
        (chunk) => {
          setChatHistory((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'model' && lastMessage.content === '') {
                // If it's the placeholder, update its content
                return [...prev.slice(0, prev.length - 1), { ...lastMessage, content: chunk }];
            } else if (lastMessage.role === 'model') {
                // Append to the last model message
                return [...prev.slice(0, prev.length - 1), { ...lastMessage, content: lastMessage.content + chunk }];
            }
            // Should not happen if placeholder logic is correct, but as fallback
            return [...prev, { role: 'model', content: chunk }];
          });
        },
        (errorMsg) => {
          setApiError(errorMsg);
          // Remove or mark the placeholder if an error occurs
          setChatHistory((prev) => {
            if (prev[prev.length - 1]?.content === '') {
              return prev.slice(0, prev.length - 1); // Remove empty placeholder
            }
            return prev;
          });
        }
      );
    } catch (err: any) {
      console.error('Error during Gemini interaction:', err);
      // Specific error handling for API Key not configured (now from environment)
      if (err.message.includes("API Key is not configured") || err.message.includes("api_key")) {
        setApiError("Gemini API Key is not configured in the environment. Please ensure process.env.API_KEY is set.");
      } else {
        setApiError(`An unexpected error occurred while contacting Gemini: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, isLoading, chatHistory]); // Removed isApiKeyConfigured from dependencies

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold text-gray-800 p-6 pb-0 dark:text-gray-100">Gemini AI Assistant</h2>
      <p className="text-gray-600 p-6 pt-2 pb-4 border-b border-gray-200 dark:text-gray-300 dark:border-gray-700">
        Ask Gemini anything about NextDNS features, settings, or best practices.
      </p>

      {/* Chat History */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {chatHistory.length === 0 && !apiError && (
          <div className="text-center text-gray-500 py-10 dark:text-gray-400">
            Start a conversation! Ask me about NextDNS.
          </div>
        )}
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl p-3 rounded-lg shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white dark:bg-blue-700'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
              }`}
            >
              {msg.content.split('\n').map((line, lineIndex) => (
                <p key={lineIndex}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.role === 'model' && chatHistory[chatHistory.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="max-w-xl p-3 rounded-lg shadow-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        {apiError && (
          <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-md text-sm dark:bg-red-900 dark:text-red-300 dark:border-red-700">
            <strong>Error:</strong> {apiError}
            {apiError.includes("API Key is not configured") && (
              <p className="mt-2">
                Please ensure your <code className="font-mono bg-red-200 dark:bg-red-800 p-1 rounded">process.env.API_KEY</code> environment variable is correctly set.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-200 sticky bottom-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex space-x-3">
          <Input
            id="chat-input"
            placeholder="Type your question about NextDNS..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!currentMessage.trim() || isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GeminiAssistantPage;