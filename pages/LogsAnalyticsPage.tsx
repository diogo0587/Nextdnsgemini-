import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { logService } from '../services/logService';
import { DNSQueryLog } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

const LogsAnalyticsPage: React.FC = () => {
  const [allLogs, setAllLogs] = useState<DNSQueryLog[]>([]); // Store all fetched logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const { addNotification } = useNotification();
  const { theme } = useTheme(); // Use theme context

  // Set the notification handler for logService
  useEffect(() => {
    logService.setNotificationHandler(addNotification);
    // Cleanup on unmount
    return () => logService.setNotificationHandler(() => {});
  }, [addNotification]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedLogs = await logService.getLogs();
      setAllLogs(fetchedLogs);
    } catch (err) {
      setError('Failed to load DNS query logs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    let logsToFilter = [...allLogs];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Start of the day
      logsToFilter = logsToFilter.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of the day
      logsToFilter = logsToFilter.filter(log => new Date(log.timestamp) <= end);
    }

    return logsToFilter;
  }, [allLogs, startDate, endDate]);

  const handleClearLogs = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear all DNS query logs? This action cannot be undone.')) {
      setLoading(true);
      await logService.clearLogs();
      await fetchLogs(); // Refetch to clear current view
      setLoading(false);
    }
  }, [fetchLogs]);

  const escapeCsvValue = (value: string | undefined): string => {
    if (value === undefined || value === null) return '';
    const stringValue = String(value);
    // Escape double quotes by doubling them, then wrap the whole string in double quotes if it contains a comma or double quote
    if (stringValue.includes(',') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportLogs = useCallback(() => {
    if (filteredLogs.length === 0) {
      addNotification('No logs to export in the current filter.', 'warning');
      return;
    }

    const headers = ['ID', 'Timestamp', 'Domain', 'Device', 'Status', 'Profile', 'Block Reason'];
    const csvRows = [headers.map(escapeCsvValue).join(',')];

    filteredLogs.forEach(log => {
      csvRows.push(
        [
          escapeCsvValue(log.id),
          escapeCsvValue(log.timestamp),
          escapeCsvValue(log.domain),
          escapeCsvValue(log.device),
          escapeCsvValue(log.status),
          escapeCsvValue(log.profile),
          escapeCsvValue(log.blockReason)
        ].join(',')
      );
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nextdns_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    addNotification('DNS query logs exported successfully!', 'success');
  }, [filteredLogs, addNotification]);

  const getAnalytics = useCallback(() => {
    const domainCounts: { [key: string]: number } = {};
    const blockReasonCounts: { [key: string]: number } = {};
    const dailyTrends: { [date: string]: { total: number; blocked: number } } = {};

    filteredLogs.forEach(log => {
      domainCounts[log.domain] = (domainCounts[log.domain] || 0) + 1;
      if (log.status === 'blocked' && log.blockReason) {
        blockReasonCounts[log.blockReason] = (blockReasonCounts[log.blockReason] || 0) + 1;
      }

      // For daily trends
      const logDate = new Date(log.timestamp);
      const dateKey = logDate.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailyTrends[dateKey]) {
        dailyTrends[dateKey] = { total: 0, blocked: 0 };
      }
      dailyTrends[dateKey].total++;
      if (log.status === 'blocked') {
        dailyTrends[dateKey].blocked++;
      }
    });

    const sortedDomains = Object.entries(domainCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5);

    const sortedBlockReasons = Object.entries(blockReasonCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3);

    const sortedDailyTrends = Object.entries(dailyTrends)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

    return { sortedDomains, sortedBlockReasons, sortedDailyTrends };
  }, [filteredLogs]);

  const { sortedDomains, sortedBlockReasons, sortedDailyTrends } = useMemo(() => getAnalytics(), [getAnalytics]);

  const maxGeneralQueriesForBars = Math.max(
    ...sortedDomains.map(([, count]) => count),
    ...sortedBlockReasons.map(([, count]) => count),
    1 // Ensure at least 1 to avoid division by zero if no logs
  );

  const maxDailyQueries = Math.max(
    ...sortedDailyTrends.map(([, data]) => data.total),
    1
  );

  const handleResetFilters = useCallback(() => {
    setStartDate('');
    setEndDate('');
    addNotification('Date filters reset.', 'info');
  }, [addNotification]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span>Loading Logs & Analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 text-center dark:text-red-400">
        <p>{error}</p>
        <Button onClick={fetchLogs} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">DNS Query Logs & Analytics</h2>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Filter Logs by Date</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              id="startDate"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <Input
              id="endDate"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={handleResetFilters} variant="secondary" className="w-full sm:w-auto mt-2 sm:mt-0">
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1 dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Actions</h3>
          <Button onClick={handleExportLogs} className="w-full mb-3" disabled={loading || filteredLogs.length === 0}>
            Export Filtered Logs to CSV
          </Button>
          <Button variant="danger" onClick={handleClearLogs} className="w-full" disabled={loading}>
            Clear All Logs
          </Button>
        </div>

        {/* Analytics Summary - Top Domains and Block Reasons */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1 lg:col-span-2 dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Analytics Summary (Filtered: {filteredLogs.length} queries)</h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-gray-700 mb-3 dark:text-gray-200">Top 5 Most Frequent Domains:</p>
              {sortedDomains.length > 0 ? (
                <ul className="list-none text-gray-600 space-y-3">
                  {sortedDomains.map(([domain, count]) => (
                    <li key={domain} className="flex items-center">
                      <span className="w-2/5 md:w-1/3 truncate text-sm font-medium pr-2 text-gray-700 dark:text-gray-200">{domain}:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-5 relative dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2 dark:bg-blue-700"
                          style={{ width: `${(count / maxGeneralQueriesForBars) * 100}%` }}
                          role="progressbar"
                          aria-valuenow={count}
                          aria-valuemin={0}
                          aria-valuemax={maxGeneralQueriesForBars}
                          aria-label={`${domain} had ${count} queries`}
                        >
                          <span className="text-xs text-white font-bold">{count}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm dark:text-gray-400">No data available for top domains.</p>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-3 dark:text-gray-200">Top 3 Most Common Block Reasons:</p>
              {sortedBlockReasons.length > 0 ? (
                <ul className="list-none text-gray-600 space-y-3">
                  {sortedBlockReasons.map(([reason, count]) => (
                    <li key={reason} className="flex items-center">
                      <span className="w-2/5 md:w-1/3 truncate text-sm font-medium pr-2 text-gray-700 dark:text-gray-200">{reason}:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-5 relative dark:bg-gray-700">
                        <div
                          className="bg-red-600 h-full rounded-full flex items-center justify-end pr-2 dark:bg-red-700"
                          style={{ width: `${(count / maxGeneralQueriesForBars) * 100}%` }}
                          role="progressbar"
                          aria-valuenow={count}
                          aria-valuemin={0}
                          aria-valuemax={maxGeneralQueriesForBars}
                          aria-label={`${reason} was a block reason ${count} times`}
                        >
                          <span className="text-xs text-white font-bold">{count}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm dark:text-gray-400">No blocked queries yet for block reasons.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Query Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Daily Query Trends</h3>
        <p className="text-gray-600 text-sm mb-4 dark:text-gray-300">
          Visualize the daily volume of DNS queries (Total in blue, Blocked in red) within your selected date range.
        </p>
        <div className="flex items-center space-x-4 mb-4 text-sm font-medium">
            <div className="flex items-center text-gray-700 dark:text-gray-200">
                <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2 dark:bg-blue-600"></span>
                <span>Total Queries</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-200">
                <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2 dark:bg-red-600"></span>
                <span>Blocked Queries</span>
            </div>
        </div>
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md p-3 dark:border-gray-700">
          {sortedDailyTrends.length > 0 ? (
            <div className="space-y-4">
              {sortedDailyTrends.map(([date, data]) => (
                <div key={date} className="pb-2 border-b border-gray-100 last:border-b-0 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-800 mb-1 dark:text-gray-100">{date}</p>
                  <div className="flex items-center mb-1">
                    <span className="w-16 text-xs text-gray-700 dark:text-gray-200">Total:</span>
                    <div className="flex-1 bg-blue-100 rounded-full h-4 relative dark:bg-blue-900">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-1 dark:bg-blue-600"
                        style={{ width: `${(data.total / maxDailyQueries) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={data.total}
                        aria-valuemin={0}
                        aria-valuemax={maxDailyQueries}
                        aria-label={`Total queries on ${date}: ${data.total}`}
                      >
                        <span className="text-[10px] text-white font-bold">{data.total}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-xs text-gray-700 dark:text-gray-200">Blocked:</span>
                    <div className="flex-1 bg-red-100 rounded-full h-4 relative dark:bg-red-900">
                      <div
                        className="bg-red-500 h-full rounded-full flex items-center justify-end pr-1 dark:bg-red-600"
                        style={{ width: `${(data.blocked / maxDailyQueries) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={data.blocked}
                        aria-valuemin={0}
                        aria-valuemax={maxDailyQueries}
                        aria-label={`Blocked queries on ${date}: ${data.blocked}`}
                      >
                        <span className="text-[10px] text-white font-bold">{data.blocked}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10 dark:text-gray-400">No daily query data for the selected period.</p>
          )}
        </div>
      </div>

      {/* DNS Query Log Feed */}
      <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Live Query Feed (Most Recent First)</h3>
        <div className="max-h-[600px] overflow-y-auto border border-gray-200 rounded-md p-3 space-y-3 dark:border-gray-700">
          {filteredLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-10 dark:text-gray-400">No DNS queries logged yet for the selected filters.</p>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md
                  ${log.status === 'blocked' ? 'bg-red-50 ring-1 ring-red-200 dark:bg-red-900 dark:ring-red-700' : 'bg-green-50 ring-1 ring-green-200 dark:bg-green-900 dark:ring-green-700'}
                `}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-semibold text-gray-800 truncate dark:text-gray-100">{log.domain}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{log.device}</span> / <span className="italic">{log.profile}</span>
                  </p>
                </div>
                <div className="flex-shrink-0 text-right sm:text-left">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${log.status === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' : 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'}
                    `}
                  >
                    {log.status === 'blocked' ? 'BLOCKED' : 'ALLOWED'}
                  </span>
                  {log.blockReason && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                      Reason: {log.blockReason}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1 sm:mt-0 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsAnalyticsPage;