import React from 'react';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  options: Array<{ label: string; onClick: () => void }>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, position, options }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <ul style={{ listStyle: 'none', padding: '10px', margin: 0 }}>
        {options.map((option, index) => (
          <li key={index} style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={option.onClick}>
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;