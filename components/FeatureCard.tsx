import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { FeatureCardProps } from '../types';

const FeatureCard: React.FC<FeatureCardProps> = ({ id, label, description, checked, onChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <ToggleSwitch id={id} checked={checked} onChange={onChange} />
    </div>
  );
};

export default FeatureCard;
