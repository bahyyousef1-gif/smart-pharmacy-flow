import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <div className="flex items-center">
      {label && <span className="mr-2">{label}</span>}
      <div
        onClick={handleToggle}
        className={`relative inline-flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );
};

export default Switch;