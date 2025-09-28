import React, { useState, useEffect } from 'react';
import RegionSelector from './RegionSelector';
import LiveTimeline from './LiveTimeline';
import OrderNotification from './OrderNotification';
import OrderActions from './OrderActions';
import { fetchNearbyPharmacies, placeOrder, subscribeToOrderUpdates } from '../../lib/utils';

const P2POrderingModule = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [pharmacies, setPharmacies] = useState([]);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (selectedRegion) {
            fetchNearbyPharmacies(selectedRegion).then(setPharmacies);
        }
    }, [selectedRegion]);

    useEffect(() => {
        const unsubscribe = subscribeToOrderUpdates((newOrder) => {
            setOrders((prevOrders) => [...prevOrders, newOrder]);
            setNotifications((prevNotifications) => [...prevNotifications, `New order from ${newOrder.pharmacyName}`]);
        });

        return () => unsubscribe();
    }, []);

    const handlePlaceOrder = (orderDetails) => {
        placeOrder(orderDetails).then((response) => {
            if (response.success) {
                setNotifications((prevNotifications) => [...prevNotifications, 'Order placed successfully!']);
            } else {
                setNotifications((prevNotifications) => [...prevNotifications, 'Failed to place order.']);
            }
        });
    };

    return (
        <div className="p2p-ordering-module">
            <h2>P2P Ordering Module</h2>
            <RegionSelector onSelectRegion={setSelectedRegion} />
            <OrderActions onPlaceOrder={handlePlaceOrder} pharmacies={pharmacies} />
            <LiveTimeline orders={orders} />
            <OrderNotification notifications={notifications} />
        </div>
    );
};

export default P2POrderingModule;