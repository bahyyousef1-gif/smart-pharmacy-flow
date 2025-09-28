import React from 'react';

interface SelectProps {
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ options, onChange, placeholder }) => {
  return (
    <select
      onChange={(e) => onChange(e.target.value)}
      defaultValue=""
      className="border rounded-md p-2"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;