import React from 'react';

interface ResizableProps {
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
}

const Resizable: React.FC<ResizableProps> = ({ children, minWidth = 100, minHeight = 100 }) => {
  const [width, setWidth] = React.useState<number>(minWidth);
  const [height, setHeight] = React.useState<number>(minHeight);
  const [isResizing, setIsResizing] = React.useState<boolean>(false);

  const startResize = () => {
    setIsResizing(true);
  };

  const stopResize = () => {
    setIsResizing(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(e.clientX - (e.target as HTMLElement).getBoundingClientRect().left, minWidth);
      const newHeight = Math.max(e.clientY - (e.target as HTMLElement).getBoundingClientRect().top, minHeight);
      setWidth(newWidth);
      setHeight(newHeight);
    }
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResize);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing]);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        border: '1px solid #ccc',
        overflow: 'hidden',
      }}
    >
      {children}
      <div
        onMouseDown={startResize}
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: '#000',
          position: 'absolute',
          bottom: '0',
          right: '0',
          cursor: 'nwse-resize',
        }}
      />
    </div>
  );
};

export default Resizable;