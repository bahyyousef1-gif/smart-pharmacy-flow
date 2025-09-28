import React from 'react';

interface ProgressProps {
  progress: number; // Progress percentage (0-100)
  label?: string; // Optional label for the progress bar
}

const Progress: React.FC<ProgressProps> = ({ progress, label }) => {
  return (
    <div className="relative pt-1">
      {label && <div className="flex justify-between mb-1"><span className="text-sm font-medium">{label}</span><span className="text-sm font-medium">{progress}%</span></div>}
      <div className="flex h-2 bg-gray-200 rounded">
        <div
          className="bg-blue-600 h-full rounded"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;