import React, { useState, useEffect } from 'react';
import { fetchNearbyPharmacies, placeOrder } from '../../lib/utils';
import RegionSelector from './RegionSelector';
import LiveTimeline from './LiveTimeline';
import OrderNotification from './OrderNotification';
import OrderActions from './OrderActions';

const PharmacyLocator = () => {
    const [region, setRegion] = useState('');
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (region) {
            fetchNearbyPharmacies(region).then(setPharmacies);
        }
    }, [region]);

    const handleOrderPlacement = async () => {
        if (selectedPharmacy) {
            const status = await placeOrder(selectedPharmacy);
            setOrderStatus(status);
            setNotifications(prev => [...prev, `Order placed with ${selectedPharmacy.name}`]);
        }
    };

    return (
        <div className="pharmacy-locator">
            <h1>Locate Nearby Pharmacies</h1>
            <RegionSelector onSelect={setRegion} />
            <div className="pharmacy-list">
                {pharmacies.map(pharmacy => (
                    <div key={pharmacy.id} className="pharmacy-item" onClick={() => setSelectedPharmacy(pharmacy)}>
                        <h2>{pharmacy.name}</h2>
                        <p>{pharmacy.address}</p>
                    </div>
                ))}
            </div>
            {selectedPharmacy && (
                <div className="order-section">
                    <h2>Selected Pharmacy: {selectedPharmacy.name}</h2>
                    <button onClick={handleOrderPlacement}>Place Order</button>
                </div>
            )}
            <LiveTimeline orderStatus={orderStatus} />
            <OrderNotification notifications={notifications} />
            <OrderActions selectedPharmacy={selectedPharmacy} />
        </div>
    );
};

export default PharmacyLocator;