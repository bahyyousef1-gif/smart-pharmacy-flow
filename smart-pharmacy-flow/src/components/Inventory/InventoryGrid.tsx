import React, { useEffect, useState } from 'react';
import { fetchInventory } from '../../lib/utils';
import OrderNotification from '../P2P/OrderNotification';
import LiveTimeline from '../P2P/LiveTimeline';
import RegionSelector from '../P2P/RegionSelector';
import OrderActions from '../P2P/OrderActions';
import './InventoryGrid.css'; // Assuming you have some CSS for styling

const InventoryGrid = () => {
    const [inventory, setInventory] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const loadInventory = async () => {
            const data = await fetchInventory();
            setInventory(data);
        };

        loadInventory();
    }, []);

    const handleRegionChange = (region) => {
        setSelectedRegion(region);
    };

    const handleOrderUpdate = (newOrder) => {
        setOrders((prevOrders) => [...prevOrders, newOrder]);
    };

    return (
        <div className="inventory-grid">
            <h1>Inventory</h1>
            <RegionSelector onRegionChange={handleRegionChange} />
            <div className="grid">
                {inventory.map((item) => (
                    <div key={item.id} className="grid-item">
                        <h2>{item.name}</h2>
                        <p>{item.description}</p>
                        <OrderActions item={item} onOrderUpdate={handleOrderUpdate} />
                    </div>
                ))}
            </div>
            <LiveTimeline orders={orders} />
            <OrderNotification />
        </div>
    );
};

export default InventoryGrid;