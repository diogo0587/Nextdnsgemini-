import React, { useState, useEffect, useCallback } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { geminiService } from '../services/geminiService';
import { nextDNSService } from '../services/nextdnsService'; // Import NextDNS service
import { useNotification } from '../contexts/NotificationContext';

const ApiKeyPage: React.FC = () => {
  const [currentGeminiApiKey, setCurrentGeminiApiKey] = useState<string>('');
  const [inputGeminiApiKey, setInputGeminiApiKey] = useState<string>('');
  const [currentNextDnsApiKey, setCurrentNextDnsApiKey] = useState<string>(''); // New state for NextDNS API Key
  const [inputNextDnsApiKey, setInputNextDnsApiKey] = useState<string>(''); // New state for NextDNS API Key input
  const { addNotification } = useNotification();

  useEffect(() => {
    // Load existing API keys from services on component mount
    const geminiKey = geminiService.getApiKeyFromStorage();
    if (geminiKey) {
      setCurrentGeminiApiKey(geminiKey);
      setInputGeminiApiKey(geminiKey);
    }

    const nextDnsKey = nextDNSService.getNextDnsApiKeyFromStorage();
    if (nextDnsKey) {
      setCurrentNextDnsApiKey(nextDnsKey);
      setInputNextDnsApiKey(nextDnsKey);
    }
  }, []);

  const handleSaveGeminiApiKey = useCallback(() => {
    const trimmedKey = inputGeminiApiKey.trim();
    if (trimmedKey) {
      geminiService.setApiKey(trimmedKey);
      setCurrentGeminiApiKey(trimmedKey);
      addNotification('Gemini API Key saved successfully!', 'success');
      // Dispatch a storage event to notify other components (e.g., GeminiAssistantPage)
      window.dispatchEvent(new Event('storage'));
    } else {
      addNotification('Gemini API Key cannot be empty.', 'warning');
    }
  }, [inputGeminiApiKey, addNotification]);

  const handleClearGeminiApiKey = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your Gemini API Key? You will not be able to use the AI Assistant without it.')) {
      geminiService.clearApiKey();
      setCurrentGeminiApiKey('');
      setInputGeminiApiKey('');
      addNotification('Gemini API Key cleared.', 'info');
      // Dispatch a storage event to notify other components (e.g., GeminiAssistantPage)
      window.dispatchEvent(new Event('storage'));
    }
  }, [addNotification]);

  const handleSaveNextDnsApiKey = useCallback(() => {
    const trimmedKey = inputNextDnsApiKey.trim();
    if (trimmedKey) {
      nextDNSService.setNextDnsApiKey(trimmedKey);
      setCurrentNextDnsApiKey(trimmedKey);
      addNotification('NextDNS API Key saved successfully!', 'success');
      // No specific component currently listens for this, but good practice for consistency
      window.dispatchEvent(new Event('storage'));
    } else {
      addNotification('NextDNS API Key cannot be empty.', 'warning');
    }
  }, [inputNextDnsApiKey, addNotification]);

  const handleClearNextDnsApiKey = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your NextDNS API Key?')) {
      nextDNSService.clearNextDnsApiKey();
      setCurrentNextDnsApiKey('');
      setInputNextDnsApiKey('');
      addNotification('NextDNS API Key cleared.', 'info');
      window.dispatchEvent(new Event('storage'));
    }
  }, [addNotification]);


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">API Key Settings</h2>

      {/* Gemini API Key Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Google Gemini API Key</h3>
        <p className="text-gray-700 mb-4">
          To use the Gemini AI Assistant, please provide your Google Gemini API Key.
          This key is stored securely in your browser's local storage.
        </p>
        <p className="text-gray-600 mb-4 text-sm">
          You can obtain your API key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio website</a>.
          Usage may incur costs, refer to the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">billing documentation</a>.
        </p>

        <div className="mb-4">
          <Input
            id="gemini-api-key"
            label="Gemini API Key"
            type="password"
            placeholder="Enter your Gemini API Key here"
            value={inputGeminiApiKey}
            onChange={(e) => setInputGeminiApiKey(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSaveGeminiApiKey} disabled={!inputGeminiApiKey.trim()}>
            {currentGeminiApiKey === inputGeminiApiKey.trim() ? 'Key Saved' : 'Save Gemini API Key'}
          </Button>
          {currentGeminiApiKey && (
            <Button variant="danger" onClick={handleClearGeminiApiKey}>
              Clear Gemini API Key
            </Button>
          )}
        </div>

        {currentGeminiApiKey && (
          <p className="mt-4 text-sm text-green-600">
            Gemini API Key is currently configured.
          </p>
        )}
        {!currentGeminiApiKey && (
          <p className="mt-4 text-sm text-red-600">
            Gemini API Key is not configured. Gemini AI Assistant will not function.
          </p>
        )}
      </div>

      {/* NextDNS API Key Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">NextDNS API Key (Future Integration)</h3>
        <p className="text-gray-700 mb-4">
          This field is for a future integration with the actual NextDNS API.
          Currently, the application manages NextDNS settings and logs locally in your browser.
        </p>
        <p className="text-gray-600 mb-4 text-sm">
          In a future version, an API Key from NextDNS could allow direct management
          of your NextDNS profile settings and retrieval of real-time logs.
          (You would typically find this in your NextDNS dashboard settings once available).
        </p>

        <div className="mb-4">
          <Input
            id="nextdns-api-key"
            label="NextDNS API Key"
            type="password"
            placeholder="Enter your NextDNS API Key here"
            value={inputNextDnsApiKey}
            onChange={(e) => setInputNextDnsApiKey(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSaveNextDnsApiKey} disabled={!inputNextDnsApiKey.trim()}>
            {currentNextDnsApiKey === inputNextDnsApiKey.trim() ? 'Key Saved' : 'Save NextDNS API Key'}
          </Button>
          {currentNextDnsApiKey && (
            <Button variant="danger" onClick={handleClearNextDnsApiKey}>
              Clear NextDNS API Key
            </Button>
          )}
        </div>

        {currentNextDnsApiKey && (
          <p className="mt-4 text-sm text-green-600">
            NextDNS API Key is currently configured (for future use).
          </p>
        )}
        {!currentNextDnsApiKey && (
          <p className="mt-4 text-sm text-gray-600">
            NextDNS API Key is not configured. This is fine for current local functionality.
          </p>
        )}
      </div>
    </div>
  );
};

export default ApiKeyPage;