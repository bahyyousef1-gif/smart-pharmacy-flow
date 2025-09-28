import React from 'react';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="tabs">
            <ul className="tab-list">
                {tabs.map((tab, index) => (
                    <li
                        key={index}
                        className={`tab-item ${activeTab === index ? 'active' : ''}`}
                        onClick={() => onTabChange(index)}
                    >
                        {tab.label}
                    </li>
                ))}
            </ul>
            <div className="tab-content">
                {tabs[activeTab].content}
            </div>
        </div>
    );
};

export default Tabs;