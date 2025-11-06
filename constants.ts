import { NavItem, NextDNSSettings, NextDNSSettingsCategory } from './types';
import { faTachometerAlt, faShieldAlt, faUserSecret, faChild, faListAlt, faArrowsRotate, faCogs, faGem, faChartBar, faKey } from '@fortawesome/free-solid-svg-icons';

export const NAV_ITEMS: NavItem[] = [
  { id: NextDNSSettingsCategory.DASHBOARD, label: 'Dashboard', path: '/', icon: faTachometerAlt },
  { id: NextDNSSettingsCategory.SECURITY, label: 'Security', path: '/security', icon: faShieldAlt },
  { id: NextDNSSettingsCategory.PRIVACY, label: 'Privacy', path: '/privacy', icon: faUserSecret },
  { id: NextDNSSettingsCategory.PARENTAL_CONTROLS, label: 'Parental Controls', path: '/parental-controls', icon: faChild },
  { id: NextDNSSettingsCategory.LISTS, label: 'Denylist & Allowlist', path: '/lists', icon: faListAlt },
  { id: NextDNSSettingsCategory.REWRITES, label: 'Rewrites', path: '/rewrites', icon: faArrowsRotate },
  { id: NextDNSSettingsCategory.SETTINGS, label: 'General Settings', path: '/settings', icon: faCogs },
  { id: NextDNSSettingsCategory.LOGS_ANALYTICS, label: 'Logs & Analytics', path: '/logs-analytics', icon: faChartBar },
  { id: NextDNSSettingsCategory.GEMINI_ASSISTANT, label: 'Gemini Assistant', path: '/gemini-assistant', icon: faGem },
  { id: NextDNSSettingsCategory.API_KEY_SETTINGS, label: 'API Key Settings', path: '/api-key', icon: faKey },
];

export const DEFAULT_NEXTDNS_SETTINGS: NextDNSSettings = {
  security: {
    threatIntelligence: true,
    malwareProtection: true,
    phishingProtection: true,
    cryptojackingProtection: true,
    dnsRebindingProtection: true,
    googleSafeBrowsing: true,
    typoProtection: false,
  },
  privacy: {
    blockAdsTrackers: true,
    blockAffiliateMarketing: true,
    blockNativeTracking: false,
    blockTelemetryAnalytics: false,
    blockCircumvention: true,
  },
  parentalControls: {
    blockCategories: [], // No categories blocked by default
    safeSearch: true,
    youtubeRestricted: false,
  },
  lists: {
    denylist: ['bad-domain.com'],
    allowlist: ['good-domain.com'],
  },
  rewrites: {
    'home.local': '192.168.1.100',
  },
  general: {
    loggingEnabled: true,
    cacheBoost: true,
    blockPageEnabled: false,
    blockPageUrl: '',
  },
};