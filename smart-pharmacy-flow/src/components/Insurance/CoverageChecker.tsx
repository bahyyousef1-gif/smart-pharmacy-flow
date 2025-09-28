import React, { useState, useEffect } from 'react';
import { fetchCoverage } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';
import RegionSelector from '../P2P/RegionSelector';
import OrderNotification from '../P2P/OrderNotification';

const CoverageChecker = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [coverageData, setCoverageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (selectedRegion) {
            setLoading(true);
            fetchCoverage(selectedRegion)
                .then(data => {
                    setCoverageData(data);
                    toast({ title: 'Coverage data fetched successfully!', status: 'success' });
                })
                .catch(error => {
                    console.error(error);
                    toast({ title: 'Failed to fetch coverage data.', status: 'error' });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [selectedRegion, toast]);

    return (
        <div className="coverage-checker">
            <h2>Check Insurance Coverage</h2>
            <RegionSelector onSelect={setSelectedRegion} />
            {loading && <p>Loading coverage data...</p>}
            {coverageData && (
                <div className="coverage-results">
                    <h3>Coverage Results for {selectedRegion}</h3>
                    <pre>{JSON.stringify(coverageData, null, 2)}</pre>
                </div>
            )}
            <OrderNotification />
        </div>
    );
};

export default CoverageChecker;