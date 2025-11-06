import React, { useState, useEffect, useCallback } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { nextDNSService } from '../services/nextdnsService';
import { NextDNSSettings } from '../types';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

const RewritesPage: React.FC = () => {
  const [settings, setSettings] = useState<NextDNSSettings['rewrites']>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRewriteDomain, setNewRewriteDomain] = useState('');
  const [newRewriteIp, setNewRewriteIp] = useState('');
  const { theme } = useTheme(); // Use theme context

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedSettings = await nextDNSService.getSettings();
      setSettings(fetchedSettings.rewrites);
    } catch (err) {
      setError('Failed to load rewrite rules.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidIp = (ip: string) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$|^((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)::((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const handleAddRewriteRule = useCallback(async () => {
    const domain = newRewriteDomain.trim().toLowerCase();
    const ip = newRewriteIp.trim();
    if (domain && ip && isValidIp(ip)) {
      try {
        await nextDNSService.addRewriteRule(domain, ip);
        setSettings((prev) => ({ ...prev, [domain]: ip }));
        setNewRewriteDomain('');
        setNewRewriteIp('');
      } catch (err) {
        setError('Failed to add rewrite rule.');
        console.error(err);
      }
    } else {
      alert('Please enter a valid domain and IP address.');
    }
  }, [newRewriteDomain, newRewriteIp, settings]);

  const handleRemoveRewriteRule = useCallback(async (domain: string) => {
    try {
      await nextDNSService.removeRewriteRule(domain);
      setSettings((prev) => {
        const newSettings = { ...prev };
        delete newSettings[domain];
        return newSettings;
      });
    } catch (err) {
      setError('Failed to remove rewrite rule.');
      console.error(err);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span>Loading Rewrite Rules...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center dark:text-red-400">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">DNS Rewrites</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Add New Rewrite Rule</h3>
        <p className="text-gray-600 mb-4 dark:text-gray-300">Map a domain to a specific IP address on your network.</p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
          <div className="flex-1">
            <Input
              id="rewriteDomain"
              placeholder="myprinter.local"
              value={newRewriteDomain}
              onChange={(e) => setNewRewriteDomain(e.target.value)}
              label="Domain"
            />
          </div>
          <div className="flex-1">
            <Input
              id="rewriteIp"
              placeholder="192.168.1.150"
              value={newRewriteIp}
              onChange={(e) => setNewRewriteIp(e.target.value)}
              label="IP Address"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddRewriteRule} className="w-full sm:w-auto">Add Rule</Button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Existing Rewrite Rules</h3>
        <ul className="list-inside space-y-2 max-h-96 overflow-y-auto pr-2">
          {Object.keys(settings).length === 0 ? (
            <li className="text-gray-500 dark:text-gray-400">No rewrite rules configured.</li>
          ) : (
            Object.entries(settings).map(([domain, ip]) => (
              <li key={domain} className="flex items-center justify-between text-gray-800 bg-gray-50 p-2 rounded-md dark:text-gray-100 dark:bg-gray-700">
                <span>
                  <strong>{domain}</strong> &rarr; {ip}
                </span>
                <Button variant="danger" onClick={() => handleRemoveRewriteRule(domain)} className="text-sm py-1 px-2">
                  Remove
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default RewritesPage;