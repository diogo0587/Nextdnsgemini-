import { NavItem, NextDNSSettings, NextDNSSettingsCategory } from './types';
import { faTachometerAlt, faShieldAlt, faUserSecret, faChild, faListAlt, faArrowsRotate, faCogs, faGem, faChartBar } from '@fortawesome/free-solid-svg-icons';

// Using Font Awesome icons. Make sure to install it: `npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome`
// For this environment, we'll assume these icons are "virtually" available or replaced by placeholders if Font Awesome isn't loaded.
// In a real project, you would import them explicitly from '@fortawesome/free-solid-svg-icons'.
// Since we are not including node_modules, these icons will be objects.

const createMockIcon = (name: string) => ({
  prefix: 'fas',
  iconName: name,
  icon: [0, 0, [], '', ''] as [number, number, never[], string, string],
});

export const NAV_ITEMS: NavItem[] = [
  { id: NextDNSSettingsCategory.DASHBOARD, label: 'Dashboard', path: '/', icon: createMockIcon('tachometer-alt') },
  { id: NextDNSSettingsCategory.SECURITY, label: 'Security', path: '/security', icon: createMockIcon('shield-alt') },
  { id: NextDNSSettingsCategory.PRIVACY, label: 'Privacy', path: '/privacy', icon: createMockIcon('user-secret') },
  { id: NextDNSSettingsCategory.PARENTAL_CONTROLS, label: 'Parental Controls', path: '/parental-controls', icon: createMockIcon('child') },
  { id: NextDNSSettingsCategory.LISTS, label: 'Denylist & Allowlist', path: '/lists', icon: createMockIcon('list-alt') },
  { id: NextDNSSettingsCategory.REWRITES, label: 'Rewrites', path: '/rewrites', icon: createMockIcon('arrows-rotate') },
  { id: NextDNSSettingsCategory.SETTINGS, label: 'General Settings', path: '/settings', icon: createMockIcon('cogs') },
  { id: NextDNSSettingsCategory.LOGS_ANALYTICS, label: 'Logs & Analytics', path: '/logs-analytics', icon: createMockIcon('chart-bar') }, // New item
  { id: NextDNSSettingsCategory.GEMINI_ASSISTANT, label: 'Gemini Assistant', path: '/gemini-assistant', icon: createMockIcon('gem') },
  { id: NextDNSSettingsCategory.API_KEY_SETTINGS, label: 'API Key Settings', path: '/api-key', icon: createMockIcon('key') }, // New item
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