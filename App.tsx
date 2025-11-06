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
import { NAV_ITEMS } from './constants';
import { NavItem } from './types';
import { nextDNSService } from './services/nextdnsService';
import { logService } from './services/logService'; // Import logService
import { NotificationProvider, useNotification } from './contexts/NotificationContext';

// Helper component to pass navigation props to children
const PageWrapper: React.FC<{ children: React.ReactNode, navItems: NavItem[] }> = ({ children, navItems }) => {
  // Fix: Use ReactRouter.useLocation() instead of useLocation()
  const location = ReactRouter.useLocation();
  // Fix: Use ReactRouter.useNavigate() instead of useNavigate()
  const navigate = ReactRouter.useNavigate();
  const [activePath, setActivePath] = useState(location.hash || '#dashboard');
  const { addNotification } = useNotification();

  useEffect(() => {
    setActivePath(location.hash || '#dashboard');
  }, [location.hash]);

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
    <div className="flex h-screen bg-gray-100">
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
            {/* Fallback for unknown routes */}
            <ReactRouter.Route path="*" element={<DashboardPage />} />
          </ReactRouter.Routes>
        </PageWrapper>
      </NotificationProvider>
    </ReactRouter.HashRouter>
  );
};

export default App;