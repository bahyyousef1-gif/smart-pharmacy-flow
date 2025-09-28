import React from 'react';
import { useToast } from '../../hooks/use-toast';
import { RegionSelector } from '../P2P/RegionSelector';
import { LiveTimeline } from '../P2P/LiveTimeline';
import { OrderNotification } from '../P2P/OrderNotification';
import { OrderActions } from '../P2P/OrderActions';

const NavigationMenu = () => {
    const { toast } = useToast();

    const handleOrderAlert = (message) => {
        toast({
            title: "Order Alert",
            description: message,
            status: "info",
            duration: 5000,
            isClosable: true,
        });
    };

    return (
        <div className="navigation-menu">
            <h2>Select Region</h2>
            <RegionSelector onRegionSelect={handleOrderAlert} />
            <h2>Live Order Timeline</h2>
            <LiveTimeline />
            <h2>Order Notifications</h2>
            <OrderNotification />
            <h2>Order Actions</h2>
            <OrderActions onOrderAction={handleOrderAlert} />
        </div>
    );
};

export default NavigationMenu;