import React from 'react';
import RegionSelector from '../P2P/RegionSelector';
import LiveTimeline from '../P2P/LiveTimeline';
import OrderNotification from '../P2P/OrderNotification';
import OrderActions from '../P2P/OrderActions';

const InsuranceModule = () => {
    return (
        <div className="insurance-module">
            <h1>Insurance Management</h1>
            <RegionSelector />
            <LiveTimeline />
            <OrderNotification />
            <OrderActions />
        </div>
    );
};

export default InsuranceModule;