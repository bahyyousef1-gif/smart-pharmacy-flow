import React, { useEffect, useState } from 'react';
import RegionSelector from '../P2P/RegionSelector';
import LiveTimeline from '../P2P/LiveTimeline';
import OrderNotification from '../P2P/OrderNotification';
import OrderActions from '../P2P/OrderActions';
import { fetchOrders, placeOrder } from '../../lib/utils';

const ForecastingDashboard = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            const fetchedOrders = await fetchOrders(selectedRegion);
            setOrders(fetchedOrders);
            setLoading(false);
        };

        if (selectedRegion) {
            loadOrders();
        }
    }, [selectedRegion]);

    const handlePlaceOrder = async (orderDetails) => {
        await placeOrder(orderDetails);
        const fetchedOrders = await fetchOrders(selectedRegion);
        setOrders(fetchedOrders);
    };

    return (
        <div className="forecasting-dashboard">
            <h1>Forecasting Dashboard</h1>
            <RegionSelector onSelectRegion={setSelectedRegion} />
            {loading ? (
                <p>Loading orders...</p>
            ) : (
                <LiveTimeline orders={orders} />
            )}
            <OrderNotification orders={orders} />
            <OrderActions onPlaceOrder={handlePlaceOrder} />
        </div>
    );
};

export default ForecastingDashboard;