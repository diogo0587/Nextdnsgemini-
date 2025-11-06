import React, { useState, useEffect, useCallback } from 'react';
// Fix: Changed named imports for react-router-dom to a namespace import to resolve 'Module has no exported member' errors.
import * as ReactRouter from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import SecurityPage from './pages/SecurityPage';
import PrivacyPage from './pages/PrivacyPage';
import ParentalControlsPage from './pages/ParentalControlsPage';
import ListsPage from './pages/ListsPage';
import RewritesPage from './pages/RewritesPage';
import SettingsPage from './pages/SettingsPage';
import LogsAnalyticsPage from './pages/LogsAnalyticsPage';
import GeminiAssistantPage from './pages/GeminiAssistantPage';
import ApiKeyPage from './pages/ApiKeyPage'; // Import the new API Key page
import { NAV_ITEMS } from './constants';
import { NavItem } from './types';
import { nextDNSService } from './services/nextdnsService';
import { logService } from './services/logService'; // Import logService
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext'; // Import ThemeProvider and useTheme

// Helper component to pass navigation props to children
const PageWrapper: React.FC<{ children: React.ReactNode, navItems: NavItem[] }> = ({ children, navItems }) => {
  // Fix: Use ReactRouter.useLocation() instead of useLocation()
  const location = ReactRouter.useLocation();
  // Fix: Use ReactRouter.useNavigate() instead of useNavigate()
  const navigate = ReactRouter.useNavigate();
  // Initialize activePath with the pathname from HashRouter, defaulting to '/'
  const [activePath, setActivePath] = useState(location.pathname || '/');
  const { addNotification } = useNotification();
  const { theme } = useTheme(); // Use theme context to update body class

  useEffect(() => {
    // Update activePath when the location.pathname changes (after the hash)
    setActivePath(location.pathname || '/');
  }, [location.pathname]);

  // Apply theme class to document.documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Set the notification handler for the service
  useEffect(() => {
    nextDNSService.setNotificationHandler(addNotification);
    logService.setNotificationHandler(addNotification); // Connect logService to notifications
    // Cleanup on unmount (optional, but good practice)
    return () => {
      nextDNSService.setNotificationHandler(() => {});
      logService.setNotificationHandler(() => {}); // Cleanup for logService
    }
  }, [addNotification]);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const currentNavItem = navItems.find(item => item.path === activePath);
  const pageTitle = currentNavItem ? currentNavItem.label : 'NextDNS Manager';

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar navItems={navItems} activePath={activePath} onNavigate={handleNavigate} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    // Fix: Use ReactRouter.HashRouter instead of Router
    <ReactRouter.HashRouter>
      <NotificationProvider>
        <ThemeProvider> {/* Wrap with ThemeProvider */}
          <PageWrapper navItems={NAV_ITEMS}>
            {/* Fix: Use ReactRouter.Routes instead of Routes */}
            <ReactRouter.Routes>
              {/* Fix: Use ReactRouter.Route instead of Route */}
              <ReactRouter.Route path="/" element={<DashboardPage />} />
              <ReactRouter.Route path="/dashboard" element={<DashboardPage />} />
              <ReactRouter.Route path="/security" element={<SecurityPage />} />
              <ReactRouter.Route path="/privacy" element={<PrivacyPage />} />
              <ReactRouter.Route path="/parental-controls" element={<ParentalControlsPage />} />
              <ReactRouter.Route path="/lists" element={<ListsPage />} />
              <ReactRouter.Route path="/rewrites" element={<RewritesPage />} />
              <ReactRouter.Route path="/settings" element={<SettingsPage />} />
              <ReactRouter.Route path="/logs-analytics" element={<LogsAnalyticsPage />} />
              <ReactRouter.Route path="/gemini-assistant" element={<GeminiAssistantPage />} />
              <ReactRouter.Route path="/api-key" element={<ApiKeyPage />} /> {/* New API Key Route */}
              {/* Fallback for unknown routes */}
              <ReactRouter.Route path="*" element={<DashboardPage />} />
            </ReactRouter.Routes>
          </PageWrapper>
        </ThemeProvider>
      </NotificationProvider>
    </ReactRouter.HashRouter>
  );
};

export default App;