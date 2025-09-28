import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Assuming you have a CSS file for styling

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Pharmacy Navigation</h2>
            <ul>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/orders">Orders</Link>
                </li>
                <li>
                    <Link to="/p2p">P2P Ordering</Link>
                </li>
                <li>
                    <Link to="/inventory">Inventory</Link>
                </li>
                <li>
                    <Link to="/insurance">Insurance</Link>
                </li>
                <li>
                    <Link to="/database">Database</Link>
                </li>
                <li>
                    <Link to="/forecasting">Forecasting</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;