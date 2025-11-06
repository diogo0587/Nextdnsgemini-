import React from 'react';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook
import Button from './Button'; // Assuming you have a Button component

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { theme, toggleTheme } = useTheme(); // Use the theme context

  return (
    <header className="bg-white p-4 shadow-md flex items-center justify-between dark:bg-gray-800">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      <Button
        onClick={toggleTheme}
        variant="secondary"
        className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      </Button>
    </header>
  );
};

export default Header;