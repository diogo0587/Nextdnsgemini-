import React, { useState, useEffect, useCallback } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { nextDNSService } from '../services/nextdnsService';
import { NextDNSSettings } from '../types';

const ListsPage: React.FC = () => {
  const [settings, setSettings] = useState<NextDNSSettings['lists']>({ denylist: [], allowlist: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDenyDomain, setNewDenyDomain] = useState('');
  const [newAllowDomain, setNewAllowDomain] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedSettings = await nextDNSService.getSettings();
      setSettings(fetchedSettings.lists);
    } catch (err) {
      setError('Failed to load lists settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddDenyDomain = useCallback(async () => {
    const domain = newDenyDomain.trim().toLowerCase();
    if (domain && !settings.denylist.includes(domain)) {
      try {
        await nextDNSService.addDenylistDomain(domain);
        setSettings((prev) => ({ ...prev, denylist: [...prev.denylist, domain] }));
        setNewDenyDomain('');
      } catch (err) {
        setError('Failed to add domain to denylist.');
        console.error(err);
      }
    }
  }, [newDenyDomain, settings.denylist]);

  const handleRemoveDenyDomain = useCallback(async (domain: string) => {
    try {
      await nextDNSService.removeDenylistDomain(domain);
      setSettings((prev) => ({ ...prev, denylist: prev.denylist.filter((d) => d !== domain) }));
    } catch (err) {
      setError('Failed to remove domain from denylist.');
      console.error(err);
    }
  }, []);

  const handleAddAllowDomain = useCallback(async () => {
    const domain = newAllowDomain.trim().toLowerCase();
    if (domain && !settings.allowlist.includes(domain)) {
      try {
        await nextDNSService.addAllowlistDomain(domain);
        setSettings((prev) => ({ ...prev, allowlist: [...prev.allowlist, domain] }));
        setNewAllowDomain('');
      } catch (err) {
        setError('Failed to add domain to allowlist.');
        console.error(err);
      }
    }
  }, [newAllowDomain, settings.allowlist]);

  const handleRemoveAllowDomain = useCallback(async (domain: string) => {
    try {
      await nextDNSService.removeAllowlistDomain(domain);
      setSettings((prev) => ({ ...prev, allowlist: prev.allowlist.filter((d) => d !== domain) }));
    } catch (err) {
      setError('Failed to remove domain from allowlist.');
      console.error(err);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Loading Lists...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Denylist & Allowlist</h2>

      {/* Denylist Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Denylist (Blocked Domains)</h3>
        <p className="text-gray-600 mb-4">Add domains you wish to block from being accessed.</p>
        <div className="flex space-x-2 mb-4">
          <Input
            id="newDenyDomain"
            placeholder="example.com"
            value={newDenyDomain}
            onChange={(e) => setNewDenyDomain(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleAddDenyDomain(); }}
          />
          <Button onClick={handleAddDenyDomain}>Add</Button>
        </div>
        <ul className="list-disc list-inside space-y-2 max-h-60 overflow-y-auto pr-2">
          {settings.denylist.length === 0 ? (
            <li className="text-gray-500">No domains in denylist.</li>
          ) : (
            settings.denylist.map((domain) => (
              <li key={domain} className="flex items-center justify-between text-gray-800 bg-gray-50 p-2 rounded-md">
                <span>{domain}</span>
                <Button variant="danger" onClick={() => handleRemoveDenyDomain(domain)} className="text-sm py-1 px-2">
                  Remove
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Allowlist Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Allowlist (Allowed Domains)</h3>
        <p className="text-gray-600 mb-4">Add domains that should always be accessible, even if they are caught by a blocklist.</p>
        <div className="flex space-x-2 mb-4">
          <Input
            id="newAllowDomain"
            placeholder="safe-example.com"
            value={newAllowDomain}
            onChange={(e) => setNewAllowDomain(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleAddAllowDomain(); }}
          />
          <Button onClick={handleAddAllowDomain}>Add</Button>
        </div>
        <ul className="list-disc list-inside space-y-2 max-h-60 overflow-y-auto pr-2">
          {settings.allowlist.length === 0 ? (
            <li className="text-gray-500">No domains in allowlist.</li>
          ) : (
            settings.allowlist.map((domain) => (
              <li key={domain} className="flex items-center justify-between text-gray-800 bg-gray-50 p-2 rounded-md">
                <span>{domain}</span>
                <Button variant="danger" onClick={() => handleRemoveAllowDomain(domain)} className="text-sm py-1 px-2">
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

export default ListsPage;