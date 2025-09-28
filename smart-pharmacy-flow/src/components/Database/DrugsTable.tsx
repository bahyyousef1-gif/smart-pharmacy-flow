import React from 'react';
import { useState, useEffect } from 'react';
import { fetchDrugs } from '../../lib/utils'; // Assuming a utility function to fetch drugs
import OrderNotification from '../P2P/OrderNotification';
import LiveTimeline from '../P2P/LiveTimeline';
import RegionSelector from '../P2P/RegionSelector';
import OrderActions from '../P2P/OrderActions';

const DrugsTable = () => {
    const [drugs, setDrugs] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [orderStatus, setOrderStatus] = useState([]);

    useEffect(() => {
        const loadDrugs = async () => {
            const drugData = await fetchDrugs();
            setDrugs(drugData);
        };
        loadDrugs();
    }, []);

    const handleRegionChange = (region) => {
        setSelectedRegion(region);
    };

    const handleOrderUpdate = (orderId, status) => {
        setOrderStatus((prevStatus) => {
            return prevStatus.map(order => 
                order.id === orderId ? { ...order, status } : order
            );
        });
    };

    return (
        <div className="drugs-table">
            <h2>Available Drugs</h2>
            <RegionSelector onRegionChange={handleRegionChange} />
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Dosage</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {drugs.map(drug => (
                        <tr key={drug.id}>
                            <td>{drug.name}</td>
                            <td>{drug.dosage}</td>
                            <td>{drug.price}</td>
                            <td>
                                <OrderActions 
                                    drugId={drug.id} 
                                    onOrderUpdate={handleOrderUpdate} 
                                    selectedRegion={selectedRegion} 
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <OrderNotification orders={orderStatus} />
            <LiveTimeline orders={orderStatus} />
        </div>
    );
};

export default DrugsTable;