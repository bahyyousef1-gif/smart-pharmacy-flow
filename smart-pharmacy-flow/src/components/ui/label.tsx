import React from 'react';

interface LabelProps {
    text: string;
    htmlFor?: string;
    className?: string;
}

const Label: React.FC<LabelProps> = ({ text, htmlFor, className }) => {
    return (
        <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 ${className}`}>
            {text}
        </label>
    );
};

export default Label;