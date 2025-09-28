import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Pharmacy Navigation</h2>
            <ul>
                <li>
                    <Link to="/p2p/drug-search">Drug Search</Link>
                </li>
                <li>
                    <Link to="/p2p/order-dashboard">Order Dashboard</Link>
                </li>
                <li>
                    <Link to="/p2p/order-workflow">Order Workflow</Link>
                </li>
                <li>
                    <Link to="/p2p/pharmacy-locator">Pharmacy Locator</Link>
                </li>
                <li>
                    <Link to="/p2p/region-selector">Select Region</Link>
                </li>
                <li>
                    <Link to="/p2p/live-timeline">Live Order Timeline</Link>
                </li>
                <li>
                    <Link to="/p2p/order-notifications">Order Notifications</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;