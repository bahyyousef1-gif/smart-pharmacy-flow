import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <Link to="/">Pharmachain</Link>
            </div>
            <nav className="navigation">
                <ul>
                    <li>
                        <Link to="/orders">Orders</Link>
                    </li>
                    <li>
                        <Link to="/p2p">P2P</Link>
                    </li>
                    <li>
                        <Link to="/inventory">Inventory</Link>
                    </li>
                    <li>
                        <Link to="/insurance">Insurance</Link>
                    </li>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;