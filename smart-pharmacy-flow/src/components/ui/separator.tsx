import React from 'react';

const Separator: React.FC<{ className?: string }> = ({ className }) => {
    return <div className={`my-4 border-t border-gray-300 ${className}`} />;
};

export default Separator;