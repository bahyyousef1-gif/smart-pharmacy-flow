import React from 'react';

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="popover-overlay" onClick={onClose}>
      <div className="popover-content" onClick={(e) => e.stopPropagation()}>
        <button className="popover-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Popover;