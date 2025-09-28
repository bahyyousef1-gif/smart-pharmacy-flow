import React from 'react';

interface CommandProps {
  title: string;
  description?: string;
  onClick: () => void;
}

const Command: React.FC<CommandProps> = ({ title, description, onClick }) => {
  return (
    <div className="command" onClick={onClick}>
      <h3 className="command-title">{title}</h3>
      {description && <p className="command-description">{description}</p>}
    </div>
  );
};

export default Command;