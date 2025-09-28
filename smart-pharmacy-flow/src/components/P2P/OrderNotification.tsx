import React from 'react';
import { useToast } from '../../hooks/use-toast';
import { Order } from '../../integrations/supabase/types';

interface OrderNotificationProps {
    orders: Order[];
    onOrderUpdate: (orderId: string, accepted: boolean) => void;
}

const OrderNotification: React.FC<OrderNotificationProps> = ({ orders, onOrderUpdate }) => {
    const { toast } = useToast();

    const handleOrderAction = (orderId: string, accepted: boolean) => {
        onOrderUpdate(orderId, accepted);
        toast({
            title: accepted ? 'Order Accepted' : 'Order Rejected',
            description: `Order ${orderId} has been ${accepted ? 'accepted' : 'rejected'}.`,
            status: accepted ? 'success' : 'error',
            duration: 5000,
            isClosable: true,
        });
    };

    return (
        <div className="order-notification">
            <h2>Order Notifications</h2>
            {orders.length === 0 ? (
                <p>No new orders.</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.id} className="order-item">
                            <div>
                                <p>Order ID: {order.id}</p>
                                <p>Details: {order.details}</p>
                            </div>
                            <div className="order-actions">
                                <button onClick={() => handleOrderAction(order.id, true)}>Accept</button>
                                <button onClick={() => handleOrderAction(order.id, false)}>Reject</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OrderNotification;