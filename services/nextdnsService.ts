import { NextDNSSettings } from '../types';
import { DEFAULT_NEXTDNS_SETTINGS } from '../constants';
import { DNSQueryLog, NotificationType } from '../types';
import { logService } from './logService'; // Import the new log service

const LOCAL_STORAGE_KEY = 'nextdns_settings';
const NEXTDNS_API_KEY_LOCAL_STORAGE_KEY = 'nextdns_api_key'; // New constant for NextDNS API Key

// Utility to deep merge objects
function deepMerge<T>(target: T, source: Partial<T>): T {
  const output = { ...target } as T;
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key as keyof T];
      const targetValue = target[key as keyof T];

      if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue) &&
          typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
        output[key as keyof T] = deepMerge(targetValue, sourceValue as Partial<typeof targetValue>) as typeof targetValue;
      } else {
        output[key as keyof T] = sourceValue as typeof targetValue;
      }
    }
  }
  return output;
}

type AddNotificationFn = (message: string, type?: NotificationType) => void;

class NextDNSService {
  private settings: NextDNSSettings;
  private addNotification: AddNotificationFn = () => {}; // Default no-op
  private nextDnsApiKey: string | null; // New: Cache for NextDNS API Key

  constructor() {
    this.settings = this.loadSettings();
    this.nextDnsApiKey = this.loadNextDnsApiKey(); // Load NextDNS API key on init
  }

  public setNotificationHandler(handler: AddNotificationFn): void {
    this.addNotification = handler;
  }

  // --- NextDNS Settings Management (Local Storage) ---
  private loadSettings(): NextDNSSettings {
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSettings) {
        // Merge with defaults to ensure all keys are present even if new ones are added
        return deepMerge(DEFAULT_NEXTDNS_SETTINGS, JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from local storage:', error);
    }
    return DEFAULT_NEXTDNS_SETTINGS;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings to local storage:', error);
    }
  }

  public async getSettings(): Promise<NextDNSSettings> {
    return JSON.parse(JSON.stringify(this.settings)); // Return a deep copy
  }

  public async updateSecuritySetting(key: keyof NextDNSSettings['security'], value: boolean): Promise<void> {
    this.settings.security[key] = value;
    this.saveSettings();
    const statusText = value ? 'enabled' : 'disabled';
    // FIX: Explicitly convert 'key' to a string to prevent runtime errors with template literals.
    this.addNotification(`Security feature "${String(key)}" ${statusText}.`, 'info');

    if (value && (key === 'malwareProtection' || key === 'phishingProtection')) {
      this.addNotification(`Critical threat protection active: ${key} enabled.`, 'success');
      // In a real app, this would log actual blocked queries from NextDNS API
    }
  }

  public async updatePrivacySetting(key: keyof NextDNSSettings['privacy'], value: boolean): Promise<void> {
    this.settings.privacy[key] = value;
    this.saveSettings();
    const statusText = value ? 'enabled' : 'disabled';
    // FIX: Explicitly convert 'key' to a string to prevent runtime errors with template literals.
    this.addNotification(`Privacy feature "${String(key)}" ${statusText}.`, 'info');
    // In a real app, this would log actual blocked queries from NextDNS API
  }

  public async updateParentalControlSetting(key: keyof NextDNSSettings['parentalControls'], value: boolean | string[]): Promise<void> {
    // Refine type checking to ensure correct assignment
    if (key === 'blockCategories' && Array.isArray(value)) {
      this.settings.parentalControls.blockCategories = value;
      this.addNotification(`Parental control categories updated.`, 'info');
    } else if (key === 'safeSearch' && typeof value === 'boolean') {
      this.settings.parentalControls.safeSearch = value;
      this.addNotification(`SafeSearch ${value ? 'enabled' : 'disabled'}.`, 'info');
    } else if (key === 'youtubeRestricted' && typeof value === 'boolean') {
      this.settings.parentalControls.youtubeRestricted = value;
      this.addNotification(`YouTube Restricted Mode ${value ? 'enabled' : 'disabled'}.`, 'info');
    }
    this.saveSettings();
  }

  public async addDenylistDomain(domain: string): Promise<void> {
    if (!this.settings.lists.denylist.includes(domain)) {
      this.settings.lists.denylist.push(domain);
      this.saveSettings();
      this.addNotification(`'${domain}' added to denylist.`, 'warning');
    }
  }

  public async removeDenylistDomain(domain: string): Promise<void> {
    this.settings.lists.denylist = this.settings.lists.denylist.filter(d => d !== domain);
    this.saveSettings();
    this.addNotification(`'${domain}' removed from denylist.`, 'info');
  }

  public async addAllowlistDomain(domain: string): Promise<void> {
    if (!this.settings.lists.allowlist.includes(domain)) {
      this.settings.lists.allowlist.push(domain);
      this.saveSettings();
      this.addNotification(`'${domain}' added to allowlist.`, 'success');
    }
  }

  public async removeAllowlistDomain(domain: string): Promise<void> {
    this.settings.lists.allowlist = this.settings.lists.allowlist.filter(d => d !== domain);
    this.saveSettings();
    this.addNotification(`'${domain}' removed from allowlist.`, 'info');
  }

  public async addRewriteRule(domain: string, ip: string): Promise<void> {
    this.settings.rewrites[domain] = ip;
    this.saveSettings();
    this.addNotification(`Rewrite rule for '${domain}' added.`, 'info');
  }

  public async removeRewriteRule(domain: string): Promise<void> {
    delete this.settings.rewrites[domain];
    this.saveSettings();
    this.addNotification(`Rewrite rule for '${domain}' removed.`, 'info');
  }

  public async updateGeneralSetting(key: keyof NextDNSSettings['general'], value: boolean | string): Promise<void> {
    // Refine type checking
    if (key === 'loggingEnabled') {
      if (typeof value === 'boolean') {
        this.settings.general.loggingEnabled = value;
        this.addNotification(`Query logging ${value ? 'enabled' : 'disabled'}.`, 'info');
      }
    } else if (key === 'cacheBoost') {
      if (typeof value === 'boolean') {
        this.settings.general.cacheBoost = value;
        this.addNotification(`Cache boost ${value ? 'enabled' : 'disabled'}.`, 'info');
      }
    } else if (key === 'blockPageEnabled') {
      if (typeof value === 'boolean') {
        this.settings.general.blockPageEnabled = value;
        this.addNotification(`Block page ${value ? 'enabled' : 'disabled'}.`, 'info');
      }
    } else if (key === 'blockPageUrl') {
      if (typeof value === 'string') {
        this.settings.general.blockPageUrl = value;
        this.addNotification(`Block page URL updated.`, 'info');
      }
    }
    this.saveSettings();
  }

  // --- NextDNS API Key Management (Local Storage) ---
  private loadNextDnsApiKey(): string | null {
    try {
      return localStorage.getItem(NEXTDNS_API_KEY_LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to load NextDNS API key from local storage:', error);
      return null;
    }
  }

  public getNextDnsApiKeyFromStorage(): string | null {
    if (this.nextDnsApiKey) return this.nextDnsApiKey; // Return cached key if available
    const key = this.loadNextDnsApiKey();
    this.nextDnsApiKey = key; // Cache it
    return key;
  }

  public setNextDnsApiKey(key: string): void {
    try {
      localStorage.setItem(NEXTDNS_API_KEY_LOCAL_STORAGE_KEY, key);
      this.nextDnsApiKey = key; // Update cached key
    } catch (error) {
      console.error('Failed to save NextDNS API key to local storage:', error);
    }
  }

  public clearNextDnsApiKey(): void {
    try {
      localStorage.removeItem(NEXTDNS_API_KEY_LOCAL_STORAGE_KEY);
      this.nextDnsApiKey = null; // Clear cached key
    } catch (error) {
      console.error('Failed to clear NextDNS API key from local storage:', error);
    }
  }
}

export const nextDNSService = new NextDNSService();
