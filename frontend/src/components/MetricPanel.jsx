// src/components/MetricPanel.jsx

import React, {useState} from 'react';
import MetricServices from '../services/MetricServices';
import './MetricPanel.css';

const MetricPanel = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Set loading to true
        setIsLoading(true);

        MetricServices.getMetrics()
            .then(responseData => {
                const isSuccess = responseData.success;

                if(isSuccess){
                    console.log('Metrics generated successfully!');
                    console.log(responseData);
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

    return (
        <div className="metric-panel">
            <h2> Metric Panel </h2>
            <form className="edit-form" onSubmit={handleSubmit}>
                <button name="Generate-Button" className="Generate-Button" type="submit" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Result'}
                </button>
            </form>
        </div>
    );
}

export default MetricPanel;