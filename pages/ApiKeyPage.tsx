import React, { useState, useEffect, useCallback } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { nextDNSService } from '../services/nextdnsService'; // Import NextDNS service
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

const ApiKeyPage: React.FC = () => {
  // Gemini API Key management is removed as per Google GenAI guidelines.
  // The Gemini API key must be provided via `process.env.API_KEY`.
  
  const [currentNextDnsApiKey, setCurrentNextDnsApiKey] = useState<string>(''); // New state for NextDNS API Key
  const [inputNextDnsApiKey, setInputNextDnsApiKey] = useState<string>(''); // New state for NextDNS API Key input
  const { addNotification } = useNotification();
  const { theme } = useTheme(); // Use theme context

  useEffect(() => {
    // Load existing NextDNS API key from service on component mount
    const nextDnsKey = nextDNSService.getNextDnsApiKeyFromStorage();
    if (nextDnsKey) {
      setCurrentNextDnsApiKey(nextDnsKey);
      setInputNextDnsApiKey(nextDnsKey);
    }
  }, []);

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
      <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">API Key Settings</h2>

      {/* Gemini API Key Section (Information Only - Managed Externally) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Google Gemini API Key</h3>
        <p className="text-gray-700 mb-4 dark:text-gray-300">
          As per Google GenAI SDK guidelines, the Gemini API Key must be provided exclusively via an environment variable named <code className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">process.env.API_KEY</code>.
          Therefore, it cannot be configured directly within this application's user interface.
        </p>
        <p className="text-gray-600 mb-4 text-sm dark:text-gray-400">
          Please ensure your environment is configured with the <code className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">API_KEY</code> environment variable before running the application for Gemini AI functionality.
          Usage may incur costs; refer to the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">Google AI Studio billing documentation</a>.
        </p>
        <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">
          The Gemini AI Assistant will attempt to use the key provided in the environment.
        </p>
      </div>

      {/* NextDNS API Key Section */}
      <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">NextDNS API Key (Future Integration)</h3>
        <p className="text-gray-700 mb-4 dark:text-gray-300">
          This field is for a future integration with the actual NextDNS API.
          Currently, the application manages NextDNS settings and logs locally in your browser.
        </p>
        <p className="text-gray-600 mb-4 text-sm dark:text-gray-400">
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
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">
            NextDNS API Key is currently configured (for future use).
          </p>
        )}
        {!currentNextDnsApiKey && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            NextDNS API Key is not configured. This is fine for current local functionality.
          </p>
        )}
      </div>
    </div>
  );
};

export default ApiKeyPage;