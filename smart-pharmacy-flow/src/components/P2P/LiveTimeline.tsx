import React, { useEffect, useState } from 'react';
import { OrderNotification } from './OrderNotification';
import { OrderActions } from './OrderActions';
import { fetchOrders, subscribeToOrderUpdates } from '../../lib/utils'; // Assuming these functions are defined in utils.ts

const LiveTimeline = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            const initialOrders = await fetchOrders();
            setOrders(initialOrders);
            setLoading(false);
        };

        loadOrders();

        const unsubscribe = subscribeToOrderUpdates((newOrder) => {
            setOrders((prevOrders) => [...prevOrders, newOrder]);
        });

        return () => unsubscribe();
    }, []);

    const handleOrderAction = (orderId, action) => {
        // Logic to handle order acceptance or rejection
        // This could involve calling an API to update the order status
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="live-timeline">
            <h2>Live Order Timeline</h2>
            <ul>
                {orders.map((order) => (
                    <li key={order.id}>
                        <div>
                            <span>Order ID: {order.id}</span>
                            <span>Status: {order.status}</span>
                        </div>
                        <OrderActions orderId={order.id} onAction={handleOrderAction} />
                    </li>
                ))}
            </ul>
            <OrderNotification />
        </div>
    );
};

export default LiveTimeline;