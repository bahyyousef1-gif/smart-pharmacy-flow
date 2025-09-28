import React from 'react';
import { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import OrderNotification from './OrderNotification';

const OrderActions = ({ orderId, onOrderUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAcceptOrder = async () => {
        setIsLoading(true);
        try {
            // Simulate API call to accept the order
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast({ title: 'Order Accepted', description: `Order ${orderId} has been accepted.`, status: 'success' });
            onOrderUpdate(orderId, 'accepted');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to accept the order.', status: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectOrder = async () => {
        setIsLoading(true);
        try {
            // Simulate API call to reject the order
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast({ title: 'Order Rejected', description: `Order ${orderId} has been rejected.`, status: 'error' });
            onOrderUpdate(orderId, 'rejected');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to reject the order.', status: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="order-actions">
            <button onClick={handleAcceptOrder} disabled={isLoading}>
                {isLoading ? 'Accepting...' : 'Accept Order'}
            </button>
            <button onClick={handleRejectOrder} disabled={isLoading}>
                {isLoading ? 'Rejecting...' : 'Reject Order'}
            </button>
            <OrderNotification />
        </div>
    );
};

export default OrderActions;