import React from 'react';
import { NavItem } from '../types';

interface SidebarProps {
  navItems: NavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, activePath, onNavigate }) => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col h-full shadow-lg">
      <div className="text-2xl font-bold text-center mb-8">
        NextDNS Manager
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.id} className="mb-2">
              <a
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path);
                }}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200
                  ${activePath === item.path
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'hover:bg-gray-700'}
                `}
              >
                {/* Placeholder for icon as we're not loading FontAwesome explicitly */}
                <span className="mr-3 text-lg">{item.icon.iconName.charAt(0).toUpperCase()}</span>
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
