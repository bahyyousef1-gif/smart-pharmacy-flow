import React, { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import RegionSelector from '../P2P/RegionSelector';
import LiveTimeline from '../P2P/LiveTimeline';
import OrderNotification from '../P2P/OrderNotification';
import OrderActions from '../P2P/OrderActions';

const ClaimSubmission = () => {
    const { toast } = useToast();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);

    const handleOrderPlacement = (details) => {
        // Logic to place the order
        setOrderDetails(details);
        toast({
            title: 'Order Placed',
            description: 'Your order has been successfully placed.',
            status: 'success',
        });
    };

    const handleRegionChange = (region) => {
        setSelectedRegion(region);
        toast({
            title: 'Region Selected',
            description: `You have selected ${region}.`,
            status: 'info',
        });
    };

    return (
        <div className="claim-submission">
            <h1>Claim Submission</h1>
            <RegionSelector onRegionChange={handleRegionChange} />
            <OrderActions onOrderPlacement={handleOrderPlacement} />
            {orderDetails && <LiveTimeline orderDetails={orderDetails} />}
            <OrderNotification />
        </div>
    );
};

export default ClaimSubmission;