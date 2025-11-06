import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface InvitationDetails {
  brideName: string;
  groomName?: string; // Optional
  date: string;
  time: string;
  location: string;
  rsvpInfo: string;
  registryInfo?: string; // Optional
  theme: 'Floral & Romantic' | 'Modern & Minimalist' | 'Rustic Charm' | 'Vintage Elegance';
}

export enum NextDNSSettingsCategory {
  DASHBOARD = 'DASHBOARD',
  SECURITY = 'SECURITY',
  PRIVACY = 'PRIVACY',
  PARENTAL_CONTROLS = 'PARENTAL_CONTROLS',
  LISTS = 'LISTS',
  REWRITES = 'REWRITES',
  SETTINGS = 'SETTINGS',
  LOGS_ANALYTICS = 'LOGS_ANALYTICS',
  GEMINI_ASSISTANT = 'GEMINI_ASSISTANT',
  API_KEY_SETTINGS = 'API_KEY_SETTINGS',
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
    blockCategories: string[];
    safeSearch: boolean;
    youtubeRestricted: boolean;
  };
  lists: {
    denylist: string[];
    allowlist: string[];
  };
  rewrites: {
    [domain: string]: string;
  };
  general: {
    loggingEnabled: boolean;
    cacheBoost: boolean;
    blockPageEnabled: boolean;
    blockPageUrl: string;
  };
}

export interface FeatureCardProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
}

export interface DNSQueryLog {
  id: string;
  timestamp: string; // ISO string
  domain: string;
  device: string;
  status: 'allowed' | 'blocked';
  profile: string;
  blockReason?: string;
}

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

export type Theme = 'light' | 'dark';
