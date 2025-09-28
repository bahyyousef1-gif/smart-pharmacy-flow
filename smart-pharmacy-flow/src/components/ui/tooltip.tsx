import React from 'react';

interface TooltipProps {
  message: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ message, children }) => {
  const [visible, setVisible] = React.useState(false);

  const handleMouseEnter = () => {
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: '#fff',
          padding: '5px 10px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Tooltip;