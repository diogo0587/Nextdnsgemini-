import { DNSQueryLog, NotificationType } from '../types';

const LOCAL_STORAGE_LOGS_KEY = 'nextdns_logs';

class LogService {
  private logs: DNSQueryLog[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs(): void {
    try {
      const storedLogs = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs).sort((a: DNSQueryLog, b: DNSQueryLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    } catch (error) {
      console.error('Failed to load logs from local storage:', error);
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs to local storage:', error);
    }
  }

  public async getLogs(): Promise<DNSQueryLog[]> {
    return [...this.logs]; // Return a copy
  }

  public async addLog(log: DNSQueryLog): Promise<void> {
    this.logs.unshift(log); // Add to the beginning for chronological order
    this.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Ensure always sorted
    this.saveLogs();
  }

  public async clearLogs(): Promise<void> {
    this.logs = [];
    this.saveLogs();
    this.addNotification?.('All DNS query logs cleared.', 'info');
  }

  // Allow setting notification handler for internal notifications
  private addNotification: (message: string, type?: NotificationType) => void = () => {};
  public setNotificationHandler(handler: (message: string, type?: NotificationType) => void): void {
    this.addNotification = handler;
  }
}

export const logService = new LogService();