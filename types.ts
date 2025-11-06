import { IconDefinition } from '@fortawesome/fontawesome-svg-core'; // Assuming Font Awesome is used for icons

export enum NextDNSSettingsCategory {
  DASHBOARD = 'Dashboard',
  SECURITY = 'Security',
  PRIVACY = 'Privacy',
  PARENTAL_CONTROLS = 'Parental Controls',
  LISTS = 'Lists',
  REWRITES = 'Rewrites',
  SETTINGS = 'Settings',
  LOGS_ANALYTICS = 'Logs & Analytics', // New category
  GEMINI_ASSISTANT = 'Gemini Assistant',
  API_KEY_SETTINGS = 'API Key Settings', // New category for API Key
}

export interface NavItem {
  id: NextDNSSettingsCategory;
  label: string;
  path: string;
  icon: IconDefinition;
}

export interface NextDNSSettings {
  security: {
    threatIntelligence: boolean;
    malwareProtection: boolean;
    phishingProtection: boolean;
    cryptojackingProtection: boolean;
    dnsRebindingProtection: boolean;
    googleSafeBrowsing: boolean;
    typoProtection: boolean;
  };
  privacy: {
    blockAdsTrackers: boolean;
    blockAffiliateMarketing: boolean;
    blockNativeTracking: boolean;
    blockTelemetryAnalytics: boolean;
    blockCircumvention: boolean;
  };
  parentalControls: {
    blockCategories: string[]; // e.g., ['Social Media', 'Gambling']
    safeSearch: boolean;
    youtubeRestricted: boolean;
  };
  lists: {
    denylist: string[];
    allowlist: string[];
  };
  rewrites: {
    [domain: string]: string; // { 'example.com': '192.168.1.1' }
  };
  general: {
    loggingEnabled: boolean;
    cacheBoost: boolean;
    blockPageEnabled: boolean;
    blockPageUrl: string;
  };
}

export interface DNSQueryLog {
  id: string;
  timestamp: string; // ISO 8601 string
  domain: string;
  device: string; // e.g., 'Home Network', 'Mobile', 'Work PC'
  status: 'allowed' | 'blocked';
  profile: string; // e.g., 'Default Profile', 'Kids Profile'
  blockReason?: string; // e.g., 'Malware', 'Ads', 'Pornography', 'Denylist'
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

export interface FeatureToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (id: string, value: boolean) => void;
}

export interface FeatureCardProps extends FeatureToggleProps {
  // Can extend for other input types if needed, for now just toggle
}