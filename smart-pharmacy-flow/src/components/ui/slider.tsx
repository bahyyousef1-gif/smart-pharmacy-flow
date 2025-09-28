import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label?: string;
}

const Slider: React.FC<SliderProps> = ({ min, max, value, onChange, step = 1, label }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className="slider-container">
      {label && <label className="slider-label">{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={handleChange}
        className="slider"
      />
      <div className="slider-value">{value}</div>
    </div>
  );
};

export default Slider;