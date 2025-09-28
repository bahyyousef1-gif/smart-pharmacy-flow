export type Region = {
    id: string;
    name: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
};

export type Order = {
    id: string;
    pharmacyId: string;
    userId: string;
    drugId: string;
    quantity: number;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    createdAt: string;
    updatedAt: string;
};

export type Notification = {
    id: string;
    orderId: string;
    message: string;
    type: 'info' | 'success' | 'error';
    timestamp: string;
};

export type Pharmacy = {
    id: string;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    rating: number;
    isOpen: boolean;
};