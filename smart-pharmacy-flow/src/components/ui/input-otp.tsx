import React, { useState } from 'react';

const InputOTP = ({ onSubmit }) => {
    const [otp, setOtp] = useState('');

    const handleChange = (e) => {
        setOtp(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp.length === 6) {
            onSubmit(otp);
        } else {
            alert('Please enter a valid 6-digit OTP');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="otp-input-form">
            <label htmlFor="otp" className="otp-label">Enter OTP:</label>
            <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleChange}
                maxLength="6"
                className="otp-input"
                placeholder="123456"
                required
            />
            <button type="submit" className="otp-submit-button">Submit</button>
        </form>
    );
};

export default InputOTP;