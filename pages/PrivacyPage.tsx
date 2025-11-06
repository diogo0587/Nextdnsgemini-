import React, { useState, useEffect, useCallback } from 'react';
import FeatureCard from '../components/FeatureCard';
import { nextDNSService } from '../services/nextdnsService';
import { NextDNSSettings } from '../types';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

const PrivacyPage: React.FC = () => {
  const [settings, setSettings] = useState<NextDNSSettings['privacy']>({
    blockAdsTrackers: false,
    blockAffiliateMarketing: false,
    blockNativeTracking: false,
    blockTelemetryAnalytics: false,
    blockCircumvention: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme(); // Use theme context

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedSettings = await nextDNSService.getSettings();
      setSettings(fetchedSettings.privacy);
    } catch (err) {
      setError('Failed to load privacy settings.');
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
    const key = id as keyof NextDNSSettings['privacy'];
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
    try {
      await nextDNSService.updatePrivacySetting(key, value);
    } catch (err) {
      setError(`Failed to update ${key} setting.`);
      console.error(err);
      // Revert UI on error
      setSettings((prevSettings) => ({
        ...prevSettings,
        [key]: !value,
      }));
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span>Loading Privacy Settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center dark:text-red-400">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">Privacy Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeatureCard
          id="blockAdsTrackers"
          label="Block Ads & Trackers"
          description="Block advertising and tracking domains for a cleaner, faster, and more private browsing experience."
          checked={settings.blockAdsTrackers}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="blockAffiliateMarketing"
          label="Block Affiliate & Marketing"
          description="Block domains associated with affiliate programs and various marketing trackers."
          checked={settings.blockAffiliateMarketing}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="blockNativeTracking"
          label="Block Native Tracking"
          description="Block first-party tracking on platforms to enhance privacy."
          checked={settings.blockNativeTracking}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="blockTelemetryAnalytics"
          label="Block Telemetry & Analytics"
          description="Prevent software from sending usage data and analytics to third parties."
          checked={settings.blockTelemetryAnalytics}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="blockCircumvention"
          label="Block DNS Circumvention"
          description="Block known domains and IPs used by applications to bypass DNS filtering."
          checked={settings.blockCircumvention}
          onChange={handleToggleChange}
        />
      </div>
    </div>
  );
};

export default PrivacyPage;