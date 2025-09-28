import React, { useEffect, useState } from 'react';
import { OrderNotification } from '../P2P/OrderNotification';
import { OrderActions } from '../P2P/OrderActions';
import { LiveTimeline } from '../P2P/LiveTimeline';
import { RegionSelector } from '../P2P/RegionSelector';

const ClaimsDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);

    useEffect(() => {
        // Fetch orders based on selected region
        if (selectedRegion) {
            fetchOrders(selectedRegion);
        }
    }, [selectedRegion]);

    const fetchOrders = async (region) => {
        // Fetch orders from the API based on the selected region
        // This is a placeholder for the actual API call
        const response = await fetch(`/api/orders?region=${region}`);
        const data = await response.json();
        setOrders(data);
    };

    return (
        <div className="claims-dashboard">
            <h1>Claims Dashboard</h1>
            <RegionSelector onSelectRegion={setSelectedRegion} />
            <OrderNotification orders={orders} />
            <LiveTimeline orders={orders} />
            <OrderActions orders={orders} />
        </div>
    );
};

export default ClaimsDashboard;