import React from 'react';
import { Drawer, Button } from 'your-ui-library'; // Replace with your actual UI library imports
import OrderNotification from '../P2P/OrderNotification';
import LiveTimeline from '../P2P/LiveTimeline';

const OrderDrawer = ({ isOpen, onClose }) => {
    return (
        <Drawer isOpen={isOpen} onClose={onClose}>
            <Drawer.Header>
                <h2>Order Management</h2>
            </Drawer.Header>
            <Drawer.Body>
                <OrderNotification />
                <LiveTimeline />
            </Drawer.Body>
            <Drawer.Footer>
                <Button onClick={onClose}>Close</Button>
            </Drawer.Footer>
        </Drawer>
    );
};

export default OrderDrawer;