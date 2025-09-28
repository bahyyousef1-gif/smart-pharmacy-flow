import React from 'react';

const AspectRatio: React.FC<{ ratio: number }> = ({ ratio, children }) => {
    const aspectRatioStyle = {
        position: 'relative',
        width: '100%',
        paddingBottom: `${(1 / ratio) * 100}%`,
        overflow: 'hidden',
    };

    const childStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    };

    return (
        <div style={aspectRatioStyle}>
            <div style={childStyle}>
                {children}
            </div>
        </div>
    );
};

export default AspectRatio;