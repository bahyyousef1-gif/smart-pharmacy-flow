import React, { useState, useEffect } from 'react';
import { fetchPatientData, verifyPatient } from '../../lib/utils';
import Notification from '../P2P/OrderNotification';

const PatientVerification = () => {
    const [patientId, setPatientId] = useState('');
    const [patientData, setPatientData] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [notification, setNotification] = useState('');

    const handleVerify = async () => {
        const data = await verifyPatient(patientId);
        setVerificationStatus(data.status);
        setNotification(data.message);
    };

    useEffect(() => {
        const loadPatientData = async () => {
            if (patientId) {
                const data = await fetchPatientData(patientId);
                setPatientData(data);
            }
        };
        loadPatientData();
    }, [patientId]);

    return (
        <div className="patient-verification">
            <h2>Patient Verification</h2>
            <input
                type="text"
                placeholder="Enter Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
            />
            <button onClick={handleVerify}>Verify Patient</button>
            {patientData && (
                <div>
                    <h3>Patient Details</h3>
                    <p>Name: {patientData.name}</p>
                    <p>Insurance: {patientData.insurance}</p>
                </div>
            )}
            {verificationStatus && (
                <div>
                    <h3>Verification Status: {verificationStatus}</h3>
                </div>
            )}
            {notification && <Notification message={notification} />}
        </div>
    );
};

export default PatientVerification;