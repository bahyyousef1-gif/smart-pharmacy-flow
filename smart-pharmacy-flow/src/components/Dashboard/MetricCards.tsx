import React from 'react';
import { RegionSelector } from '../P2P/RegionSelector';
import { LiveTimeline } from '../P2P/LiveTimeline';
import { OrderNotification } from '../P2P/OrderNotification';
import { OrderActions } from '../P2P/OrderActions';

const MetricCards: React.FC = () => {
    return (
        <div className="metric-cards">
            <h2>Pharmacy Operations Metrics</h2>
            <RegionSelector />
            <LiveTimeline />
            <OrderNotification />
            <OrderActions />
        </div>
    );
};

export default MetricCards;