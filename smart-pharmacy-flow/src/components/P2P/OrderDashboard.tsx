import React, { useEffect, useState } from 'react';
import RegionSelector from './RegionSelector';
import LiveTimeline from './LiveTimeline';
import OrderNotification from './OrderNotification';
import OrderActions from './OrderActions';
import { fetchOrders, placeOrder } from '../../lib/utils';

const OrderDashboard = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const fetchedOrders = await fetchOrders(selectedRegion);
                setOrders(fetchedOrders);
            } catch (err) {
                setError('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        if (selectedRegion) {
            loadOrders();
        }
    }, [selectedRegion]);

    const handlePlaceOrder = async (orderDetails) => {
        try {
            await placeOrder(orderDetails);
            // Optionally refresh orders after placing an order
            const fetchedOrders = await fetchOrders(selectedRegion);
            setOrders(fetchedOrders);
        } catch (err) {
            setError('Failed to place order');
        }
    };

    return (
        <div className="order-dashboard">
            <h1>Order Dashboard</h1>
            <RegionSelector onSelectRegion={setSelectedRegion} />
            {loading && <p>Loading orders...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && orders.length === 0 && <p>No orders available.</p>}
            <OrderNotification orders={orders} />
            <LiveTimeline orders={orders} />
            <OrderActions onPlaceOrder={handlePlaceOrder} />
        </div>
    );
};

export default OrderDashboard;