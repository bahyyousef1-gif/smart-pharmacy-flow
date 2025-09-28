import React from 'react';

interface RadioGroupProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  name: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ options, selectedValue, onChange, name }) => {
  return (
    <div className="radio-group">
      {options.map(option => (
        <label key={option.value} className="radio-label">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
            className="radio-input"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;