// src/pages/ComparePage/ComparePage.jsx

import './ComparePage.css';
import React, { useState, useEffect }  from 'react';
import { fetchTestApi} from "../../services/testServices";
import NavigationBar from "../../components/NavigationBar";
import UploadPanel from "../../components/UploadPanel";
import AttackPanel from "../../components/AttackPanel";
import MetricPanel from "../../components/MetricPanel";

function ComparePage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchTestApi()
            .then(data => setData(data))
            .catch(error => console.error('Error in component: ', error));
    }, []);

    return (
        <div>
            <div className="app">
                <NavigationBar />
            </div>

            <div className="three-panel-content">
                <UploadPanel />
                <AttackPanel />
                <MetricPanel />
            </div>

            <h1>
                <p> {data || "Loading..."} </p>
            </h1>
        </div>
    );
}

export default ComparePage;
