import React, { useState, useEffect } from 'react';
import RegionSelector from '../P2P/RegionSelector';
import LiveTimeline from '../P2P/LiveTimeline';
import OrderNotification from '../P2P/OrderNotification';
import OrderActions from '../P2P/OrderActions';
import { fetchNearbyPharmacies, placeOrder, subscribeToOrderUpdates } from '../../lib/utils';

const SmartOrdering = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (selectedRegion) {
            const unsubscribe = subscribeToOrderUpdates(selectedRegion, (newOrder) => {
                setOrders((prevOrders) => [...prevOrders, newOrder]);
                setNotifications((prevNotifications) => [...prevNotifications, `New order from ${newOrder.pharmacy}`]);
            });

            return () => unsubscribe();
        }
    }, [selectedRegion]);

    const handleRegionChange = (region) => {
        setSelectedRegion(region);
        fetchNearbyPharmacies(region);
    };

    const handlePlaceOrder = async (orderDetails) => {
        const response = await placeOrder(orderDetails);
        if (response.success) {
            setNotifications((prev) => [...prev, 'Order placed successfully!']);
        } else {
            setNotifications((prev) => [...prev, 'Failed to place order.']);
        }
    };

    return (
        <div className="smart-ordering">
            <h1>Smart Ordering</h1>
            <RegionSelector onChange={handleRegionChange} />
            <OrderActions onPlaceOrder={handlePlaceOrder} />
            <LiveTimeline orders={orders} />
            <OrderNotification notifications={notifications} />
        </div>
    );
};

export default SmartOrdering;