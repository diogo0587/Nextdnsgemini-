import React from 'react';
import { NavItem } from '../types';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon

interface SidebarProps {
  navItems: NavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, activePath, onNavigate }) => {
  const { theme } = useTheme(); // Use theme context

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col h-full shadow-lg dark:bg-gray-950">
      <div className="text-2xl font-bold text-center mb-8">
        NextDNS Manager
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.id} className="mb-2">
              <a
                href={item.path === '/' ? '#/' : `#${item.path}`} // Adjust href for HashRouter, '/' maps to '#/'
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path);
                }}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200
                  ${activePath === item.path
                    ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                    : 'hover:bg-gray-700 dark:hover:bg-gray-800'}
                `}
              >
                <FontAwesomeIcon icon={item.icon} className="mr-3 text-lg" aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;