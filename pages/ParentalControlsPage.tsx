import React, { useState, useEffect, useCallback } from 'react';
import FeatureCard from '../components/FeatureCard';
import Button from '../components/Button';
import { nextDNSService } from '../services/nextdnsService';
import { NextDNSSettings } from '../types';
import ToggleSwitch from '../components/ToggleSwitch'; // Added missing import
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

const CATEGORIES = [
  'Social Networks', 'Gambling', 'Pornography', 'Streaming', 'Games', 'File Sharing',
  'Piracy', 'Dating', 'Forums', 'Shopping', 'VPN/Proxy'
];

const ParentalControlsPage: React.FC = () => {
  const [settings, setSettings] = useState<NextDNSSettings['parentalControls']>({
    blockCategories: [],
    safeSearch: false,
    youtubeRestricted: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme(); // Use theme context

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedSettings = await nextDNSService.getSettings();
      setSettings(fetchedSettings.parentalControls);
    } catch (err) {
      setError('Failed to load parental control settings.');
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
    const key = id as 'safeSearch' | 'youtubeRestricted';
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
    try {
      await nextDNSService.updateParentalControlSetting(key, value);
    } catch (err) {
      setError(`Failed to update ${key} setting.`);
      console.error(err);
      setSettings((prevSettings) => ({
        ...prevSettings,
        [key]: !value,
      }));
    }
  }, []);

  const handleCategoryToggle = useCallback(async (category: string, isChecked: boolean) => {
    let updatedCategories;
    if (isChecked) {
      updatedCategories = [...settings.blockCategories, category];
    } else {
      updatedCategories = settings.blockCategories.filter((c) => c !== category);
    }
    setSettings((prevSettings) => ({
      ...prevSettings,
      blockCategories: updatedCategories,
    }));
    try {
      await nextDNSService.updateParentalControlSetting('blockCategories', updatedCategories);
    } catch (err) {
      setError(`Failed to update category blocking for ${category}.`);
      console.error(err);
      // Revert UI on error
      setSettings((prevSettings) => ({
        ...prevSettings,
        blockCategories: settings.blockCategories, // Revert to original
      }));
    }
  }, [settings.blockCategories]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span>Loading Parental Control Settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center dark:text-red-400">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">Parental Controls</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <FeatureCard
          id="safeSearch"
          label="Google SafeSearch"
          description="Enforce SafeSearch for Google searches to filter explicit content."
          checked={settings.safeSearch}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="youtubeRestricted"
          label="YouTube Restricted Mode"
          description="Activate YouTube Restricted Mode to filter out potentially mature content."
          checked={settings.youtubeRestricted}
          onChange={handleToggleChange}
        />
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Block Categories</h3>
      <p className="text-gray-600 mb-4 dark:text-gray-300">Select categories of websites to block across your network.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => (
          <div key={category} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between dark:bg-gray-800">
            <span className="font-medium text-gray-900 dark:text-gray-100">{category}</span>
            <ToggleSwitch
              id={`category-${category.replace(/\s/g, '-')}`}
              checked={settings.blockCategories.includes(category)}
              onChange={(id, value) => handleCategoryToggle(category, value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentalControlsPage;