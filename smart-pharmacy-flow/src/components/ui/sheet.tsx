import React from 'react';

const Sheet = ({ isOpen, onClose, children }) => {
    return (
        <div className={`sheet ${isOpen ? 'open' : ''}`}>
            <div className="sheet-content">
                <button className="close-button" onClick={onClose}>
                    Close
                </button>
                {children}
            </div>
        </div>
    );
};

export default Sheet;