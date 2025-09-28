import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Sonner = () => {
    const notify = (message) => {
        toast(message, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    return (
        <div>
            <ToastContainer />
            {/* Example usage of notify function */}
            <button onClick={() => notify('Order placed successfully!')}>Place Order</button>
        </div>
    );
};

export default Sonner;