import React from 'react';

interface ToggleGroupProps {
  options: string[];
  selectedOption: string;
  onChange: (option: string) => void;
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({ options, selectedOption, onChange }) => {
  return (
    <div className="toggle-group">
      {options.map((option) => (
        <button
          key={option}
          className={`toggle-button ${selectedOption === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default ToggleGroup;