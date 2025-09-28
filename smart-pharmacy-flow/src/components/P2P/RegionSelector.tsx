import React, { useState, useEffect } from 'react';
import { fetchRegions, placeOrder } from '../../lib/utils';
import OrderNotification from './OrderNotification';
import LiveTimeline from './LiveTimeline';

const RegionSelector = () => {
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [orderStatus, setOrderStatus] = useState(null);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const loadRegions = async () => {
            const data = await fetchRegions();
            setRegions(data);
        };
        loadRegions();
    }, []);

    const handleRegionChange = (event) => {
        setSelectedRegion(event.target.value);
    };

    const handleOrderPlacement = async () => {
        if (selectedRegion) {
            const response = await placeOrder(selectedRegion);
            setOrderStatus(response.status);
            setNotification(`Order ${response.status}: ${response.message}`);
        }
    };

    return (
        <div className="region-selector">
            <h2>Select Your Region</h2>
            <select value={selectedRegion} onChange={handleRegionChange}>
                <option value="">Select a region</option>
                {regions.map((region) => (
                    <option key={region.id} value={region.name}>
                        {region.name}
                    </option>
                ))}
            </select>
            <button onClick={handleOrderPlacement}>Place Order</button>
            {notification && <OrderNotification message={notification} />}
            <LiveTimeline orderStatus={orderStatus} />
        </div>
    );
};

export default RegionSelector;