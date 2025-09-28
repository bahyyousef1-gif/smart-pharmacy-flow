import React from 'react';

interface ToggleProps {
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
  label: string;
}

const Toggle: React.FC<ToggleProps> = ({ isChecked, onToggle, label }) => {
  const handleToggle = () => {
    onToggle(!isChecked);
  };

  return (
    <div className="flex items-center">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          className="sr-only"
        />
        <div className={`w-10 h-4 rounded-full ${isChecked ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-200 ease-in-out`}>
          <span className={`absolute left-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${isChecked ? 'translate-x-6' : ''}`}></span>
        </div>
        <span className="ml-3 text-gray-700">{label}</span>
      </label>
    </div>
  );
};

export default Toggle;