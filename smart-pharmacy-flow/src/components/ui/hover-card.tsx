import React from 'react';

interface HoverCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const HoverCard: React.FC<HoverCardProps> = ({ title, description, children }) => {
  return (
    <div className="hover-card">
      <div className="hover-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {children}
      </div>
    </div>
  );
};

export default HoverCard;