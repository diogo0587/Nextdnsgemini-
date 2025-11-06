import React, { useState, useEffect, useCallback } from 'react';
import FeatureCard from '../components/FeatureCard';
import { nextDNSService } from '../services/nextdnsService';
import { NextDNSSettings } from '../types';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

const SecurityPage: React.FC = () => {
  const [settings, setSettings] = useState<NextDNSSettings['security']>({
    threatIntelligence: false,
    malwareProtection: false,
    phishingProtection: false,
    cryptojackingProtection: false,
    dnsRebindingProtection: false,
    googleSafeBrowsing: false,
    typoProtection: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme(); // Use theme context

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedSettings = await nextDNSService.getSettings();
      setSettings(fetchedSettings.security);
    } catch (err) {
      setError('Failed to load security settings.');
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
    const key = id as keyof NextDNSSettings['security'];
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
    try {
      await nextDNSService.updateSecuritySetting(key, value);
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
          <span>Loading Security Settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center dark:text-red-400">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">Security Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeatureCard
          id="threatIntelligence"
          label="Threat Intelligence"
          description="Block access to known malicious domains based on real-time threat intelligence feeds."
          checked={settings.threatIntelligence}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="malwareProtection"
          label="Malware Protection"
          description="Prevent connections to domains associated with malware distribution."
          checked={settings.malwareProtection}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="phishingProtection"
          label="Phishing Protection"
          description="Block domains known for phishing attempts to protect your credentials."
          checked={settings.phishingProtection}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="cryptojackingProtection"
          label="Cryptojacking Protection"
          description="Block domains that secretly use your device's resources for cryptocurrency mining."
          checked={settings.cryptojackingProtection}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="dnsRebindingProtection"
          label="DNS Rebinding Protection"
          description="Protect against DNS rebinding attacks that can bypass firewall security."
          checked={settings.dnsRebindingProtection}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="googleSafeBrowsing"
          label="Google Safe Browsing"
          description="Utilize Google's database of unsafe websites to block malicious content."
          checked={settings.googleSafeBrowsing}
          onChange={handleToggleChange}
        />
        <FeatureCard
          id="typoProtection"
          label="Typo Protection"
          description="Detect and block common typos for popular domains to prevent accessing malicious look-alikes."
          checked={settings.typoProtection}
          onChange={handleToggleChange}
        />
      </div>
    </div>
  );
};

export default SecurityPage;