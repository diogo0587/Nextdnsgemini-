import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { FeatureCardProps } from '../types';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

const FeatureCard: React.FC<FeatureCardProps> = ({ id, label, description, checked, onChange }) => {
  const { theme } = useTheme(); // Use theme context

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between mb-4 dark:bg-gray-800">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{label}</h3>
        <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">{description}</p>
      </div>
      <ToggleSwitch id={id} checked={checked} onChange={onChange} />
    </div>
  );
};

export default FeatureCard;