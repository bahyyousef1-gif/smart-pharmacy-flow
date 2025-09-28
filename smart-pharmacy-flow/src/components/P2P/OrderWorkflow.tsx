import React, { useState, useEffect } from 'react';
import RegionSelector from './RegionSelector';
import LiveTimeline from './LiveTimeline';
import OrderNotification from './OrderNotification';
import OrderActions from './OrderActions';
import { fetchOrders, placeOrder } from '../../lib/utils';

const OrderWorkflow = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [orders, setOrders] = useState([]);
    const [newOrder, setNewOrder] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (selectedRegion) {
            const fetchData = async () => {
                const fetchedOrders = await fetchOrders(selectedRegion);
                setOrders(fetchedOrders);
            };
            fetchData();
        }
    }, [selectedRegion]);

    const handlePlaceOrder = async (orderDetails) => {
        const order = await placeOrder(orderDetails);
        setNewOrder(order);
        setNotifications((prev) => [...prev, `Order ${order.id} placed successfully!`]);
    };

    return (
        <div className="order-workflow">
            <h2>Order Workflow</h2>
            <RegionSelector onSelectRegion={setSelectedRegion} />
            <OrderActions onPlaceOrder={handlePlaceOrder} />
            <LiveTimeline orders={orders} />
            <OrderNotification notifications={notifications} />
        </div>
    );
};

export default OrderWorkflow;