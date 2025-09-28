import React, { useState, useEffect } from 'react';
import { RegionSelector } from './RegionSelector';
import { LiveTimeline } from './LiveTimeline';
import { OrderNotification } from './OrderNotification';
import { OrderActions } from './OrderActions';
import { fetchNearbyPharmacies, placeOrder } from '../../lib/utils';

const DrugSearch = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [pharmacies, setPharmacies] = useState([]);
    const [orderDetails, setOrderDetails] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (selectedRegion) {
            fetchNearbyPharmacies(selectedRegion).then(setPharmacies);
        }
    }, [selectedRegion]);

    const handleOrderPlacement = (order) => {
        placeOrder(order).then(response => {
            setOrderDetails(response);
            setNotifications(prev => [...prev, { message: 'Order placed successfully!', type: 'success' }]);
        }).catch(error => {
            setNotifications(prev => [...prev, { message: 'Failed to place order.', type: 'error' }]);
        });
    };

    return (
        <div className="drug-search">
            <h1>Drug Search</h1>
            <RegionSelector onSelectRegion={setSelectedRegion} />
            <div className="pharmacy-list">
                {pharmacies.map(pharmacy => (
                    <div key={pharmacy.id} className="pharmacy-item">
                        <h2>{pharmacy.name}</h2>
                        <OrderActions onPlaceOrder={handleOrderPlacement} pharmacyId={pharmacy.id} />
                    </div>
                ))}
            </div>
            <LiveTimeline orderDetails={orderDetails} />
            <OrderNotification notifications={notifications} />
        </div>
    );
};

export default DrugSearch;