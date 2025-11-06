import React, { useState, useEffect, useCallback } from 'react';
import FeatureCard from '../components/FeatureCard';
import Input from '../components/Input';
import { nextDNSService } from '../services/nextdnsService';
import { NextDNSSettings } from '../types';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NextDNSSettings['general']>({
    loggingEnabled: false,
    cacheBoost: false,
    blockPageEnabled: false,
    blockPageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme(); // Use theme context

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedSettings = await nextDNSService.getSettings();
      setSettings(fetchedSettings.general);
    } catch (err) {
      setError('Failed to load general settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleChange = useCallback(async (id: string, value: boolean) => {
    const key = id as 'loggingEnabled' | 'cacheBoost' | 'blockPageEnabled';
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
    try {
      await nextDNSService.updateGeneralSetting(key, value);
    } catch (err) {
      setError(`Failed to update ${key} setting.`);
      console.error(err);
      setSettings((prevSettings) => ({
        ...prevSettings,
        [key]: !value,
      }));
    }
  }, []);

  const handleBlockPageUrlChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setSettings((prevSettings) => ({
      ...prevSettings,
      blockPageUrl: newUrl,
    }));
    try {
      // Debounce or save on blur in a real app to avoid too many updates
      await nextDNSService.updateGeneralSetting('blockPageUrl', newUrl);
    } catch (err) {
      setError('Failed to update block page URL.');
      console.error(err);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span>Loading General Settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center dark:text-red-400">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">General Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeatureCard
          id="loggingEnabled"
          label="Query Logging"
          description="Enable or disable logging of DNS queries. Logs can be viewed in your NextDNS account."
          checked={settings.loggingEnabled}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="cacheBoost"
          label="Cache Boost"
          description="Improve performance by pre-fetching popular domain names from top global websites."
          checked={settings.cacheBoost}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="blockPageEnabled"
          label="Block Page"
          description="Display a custom page when a domain is blocked, instead of a DNS error."
          checked={settings.blockPageEnabled}
          onChange={handleToggleChange}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-8 dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Custom Block Page URL</h3>
        <p className="text-gray-600 mb-4 dark:text-gray-300">
          Specify a URL to redirect users to when a domain is blocked.
          This setting only applies if 'Block Page' is enabled.
        </p>
        <Input
          id="blockPageUrl"
          label="Block Page URL"
          placeholder="https://your-custom-blockpage.com"
          value={settings.blockPageUrl}
          onChange={handleBlockPageUrlChange}
          disabled={!settings.blockPageEnabled}
          className={`${!settings.blockPageEnabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  );
};

export default SettingsPage;