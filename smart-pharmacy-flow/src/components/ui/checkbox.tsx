import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  const handleCheckboxChange = () => {
    onChange(!checked);
  };

  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleCheckboxChange}
        className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
      />
      <span className="ml-2 text-gray-700">{label}</span>
    </label>
  );
};

export default Checkbox;