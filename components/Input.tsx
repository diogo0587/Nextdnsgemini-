import React from 'react';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  const { theme } = useTheme(); // Use theme context

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                    dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 dark:focus:border-blue-400
                    ${props.disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}
                    ${className || ''}`}
        {...props}
      />
    </div>
  );
};

export default Input;