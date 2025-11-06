import React, { useState, useEffect } from 'react';
import { nextDNSService } from '../services/nextdnsService';
import { logService } from '../services/logService'; // Import logService
import { NextDNSSettings, DNSQueryLog } from '../types';
import { useNotification } from '../contexts/NotificationContext'; // Import useNotification

const DashboardPage: React.FC = () => {
  const [settings, setSettings] = useState<NextDNSSettings | null>(null);
  const [logs, setLogs] = useState<DNSQueryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification(); // Use notification hook

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedSettings = await nextDNSService.getSettings();
        const fetchedLogs = await logService.getLogs();
        setSettings(fetchedSettings);
        setLogs(fetchedLogs);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // No dependencies for initial fetch

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  if (!settings) {
    return <div className="p-6 text-gray-700 text-center">No settings loaded.</div>;
  }

  // Analytics calculations using actual logs
  const totalQueries = logs.length;
  const blockedQueries = logs.filter(log => log.status === 'blocked').length;
  const percentageBlocked = totalQueries > 0 ? ((blockedQueries / totalQueries) * 100).toFixed(2) : '0.00';

  const activeFeaturesCount = Object.values(settings.security).filter(Boolean).length +
                              Object.values(settings.privacy).filter(Boolean).length +
                              (settings.parentalControls.safeSearch ? 1 : 0) +
                              (settings.parentalControls.youtubeRestricted ? 1 : 0) +
                              (settings.parentalControls.blockCategories.length > 0 ? 1 : 0) +
                              (settings.general.loggingEnabled ? 1 : 0) +
                              (settings.general.cacheBoost ? 1 : 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Total Queries */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total DNS Queries</h3>
          <p className="text-4xl font-bold text-blue-600">{totalQueries.toLocaleString()}</p>
          <p className="text-gray-600 mt-2">Processed (from logs)</p>
        </div>

        {/* Card: Blocked Queries */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Blocked Queries</h3>
          <p className="text-4xl font-bold text-red-600">{blockedQueries.toLocaleString()}</p>
          <p className="text-gray-600 mt-2">{percentageBlocked}% of total queries blocked</p>
        </div>

        {/* Card: Active Features */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Security/Privacy Features</h3>
          <p className="text-4xl font-bold text-green-600">{activeFeaturesCount}</p>
          <p className="text-gray-600 mt-2">Features enabled across your profile</p>
        </div>

        {/* Card: Logging Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Logging</h3>
          <p className={`text-4xl font-bold ${settings.general.loggingEnabled ? 'text-green-500' : 'text-orange-500'}`}>
            {settings.general.loggingEnabled ? 'Enabled' : 'Disabled'}
          </p>
          <p className="text-gray-600 mt-2">DNS query logging status</p>
        </div>

        {/* Card: Denylist Entries */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Denylist Entries</h3>
          <p className="text-4xl font-bold text-purple-600">{settings.lists.denylist.length}</p>
          <p className="text-gray-600 mt-2">Custom domains blocked</p>
        </div>

        {/* Card: Rewrite Rules */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rewrite Rules</h3>
          <p className="text-4xl font-bold text-yellow-600">{Object.keys(settings.rewrites).length}</p>
          <p className="text-gray-600 mt-2">Custom DNS rewrites</p>
        </div>
      </div>

      <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
        <ul className="list-disc list-inside text-blue-600 space-y-2">
          <li><a href="#security" className="hover:underline">Manage Security Settings</a></li>
          <li><a href="#privacy" className="hover:underline">Configure Privacy Options</a></li>
          <li><a href="#lists" className="hover:underline">Update Denylist/Allowlist</a></li>
          <li><a href="#logs-analytics" className="hover:underline">View DNS Query Logs & Analytics</a></li>
          <li><a href="#gemini-assistant" className="hover:underline">Ask Gemini for help</a></li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;