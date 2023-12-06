// src/pages/ComparePage.jsx

import './ComparePage.css';
import React from 'react';
import NavigationBar from "../components/NavigationBar";
import UploadPanel from "../components/UploadPanel";
import AttackPanel from "../components/AttackPanel";
import MetricPanel from "../components/MetricPanel";

function ComparePage() {
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
        </div>
    );
}

export default ComparePage;
