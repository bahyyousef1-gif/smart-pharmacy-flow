import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px' }) => {
    return (
        <div
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: '#e0e0e0',
                animation: 'pulse 1.5s infinite',
            }}
        />
    );
};

export default Skeleton;