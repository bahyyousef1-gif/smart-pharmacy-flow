import React from 'react';

const ScrollArea: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{ overflowY: 'auto', maxHeight: '100%', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            {children}
        </div>
    );
};

export default ScrollArea;