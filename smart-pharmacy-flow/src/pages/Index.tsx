import React from 'react';
import { RegionSelector } from '../components/P2P/RegionSelector';
import { LiveTimeline } from '../components/P2P/LiveTimeline';
import { OrderNotification } from '../components/P2P/OrderNotification';
import { OrderDashboard } from '../components/P2P/OrderDashboard';

const Index: React.FC = () => {
    return (
        <div className="index-page">
            <h1>Welcome to the Smart Pharmacy Flow</h1>
            <RegionSelector />
            <OrderDashboard />
            <LiveTimeline />
            <OrderNotification />
        </div>
    );
};

export default Index;