import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange }) => {
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(id, e.target.checked)}
        />
        <div
          className={`block w-14 h-8 rounded-full transition ${
            checked ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
            checked ? 'translate-x-full' : ''
          }`}
        ></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
