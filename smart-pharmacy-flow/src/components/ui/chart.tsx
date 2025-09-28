import React from 'react';
import { Line } from 'react-chartjs-2';

const Chart = ({ data }) => {
    const chartData = {
        labels: data.map(item => item.time),
        datasets: [
            {
                label: 'Order Status',
                data: data.map(item => item.status),
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div>
            <h2>Order Timeline</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default Chart;