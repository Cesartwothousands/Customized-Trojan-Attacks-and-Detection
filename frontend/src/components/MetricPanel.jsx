// src/components/MetricPanel.jsx

import React, { useState } from 'react';
import MetricServices from '../services/MetricServices';
import './MetricPanel.css';

const MetricPanel = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiData, setApiData] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();

        // Set loading to true
        setIsLoading(true);

        MetricServices.getMetrics()
            .then(responseData => {
                const isSuccess = responseData.success;

                if(isSuccess){
                    console.log('Metrics generated successfully!');

                    // Update the state
                    const newApiData = {
                        1: responseData[0],
                        2: responseData[1],
                        3: responseData[2],
                        4: responseData[3],
                        5: responseData[4],
                    };
                    setApiData(newApiData);

                } else{
                    console.error('Error during metrics generation process:', responseData);
                }
            })
            .catch(error => {
                console.error('Error during metrics generation process:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const blockString = "Waiting...";

    return (
        <div className="metric-panel">
            <h2> Metric Panel </h2>
            <form className="edit-form" onSubmit={handleSubmit}>
                <button name="Generate-Button" className="Generate-Button" type="submit" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Result'}
                </button>
            </form>

            <div>
                EvasiveTrojan-1: <span>{apiData[1] ? apiData[1] : blockString}</span>
            </div>
            <div>
                EvasiveTrojan-2: <span>{apiData[2] ? apiData[2] : blockString}</span>
            </div>
            <div>
                EvasiveTrojan-3: <span>{apiData[3] ? apiData[3] : blockString}</span>
            </div>
            <div>
                EvasiveTrojan-4: <span>{apiData[4] ? apiData[4] : blockString}</span>
            </div>
            <div>
                EvasiveTrojan-5: <span>{apiData[5] ? apiData[5] : blockString}</span>
            </div>
        </div>
    );
}

export default MetricPanel;