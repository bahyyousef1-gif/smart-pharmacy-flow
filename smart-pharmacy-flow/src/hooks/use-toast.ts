import { useState, useEffect } from 'react';

const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = new Date().getTime();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (toasts.length > 0) {
                removeToast(toasts[0].id);
            }
        }, 5000); // Auto-remove toast after 5 seconds

        return () => clearTimeout(timer);
    }, [toasts]);

    return { toasts, addToast, removeToast };
};

export default useToast;