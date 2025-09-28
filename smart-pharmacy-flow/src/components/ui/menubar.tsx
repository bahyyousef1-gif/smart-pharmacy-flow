import React from 'react';

const MenuBar: React.FC = () => {
    return (
        <div className="menubar">
            <h1>Pharmacy P2P Ordering</h1>
            <nav>
                <ul>
                    <li><a href="/p2p/drug-search">Drug Search</a></li>
                    <li><a href="/p2p/order-dashboard">Order Dashboard</a></li>
                    <li><a href="/p2p/pharmacy-locator">Pharmacy Locator</a></li>
                    <li><a href="/p2p/live-timeline">Live Timeline</a></li>
                    <li><a href="/p2p/region-selector">Select Region</a></li>
                </ul>
            </nav>
        </div>
    );
};

export default MenuBar;