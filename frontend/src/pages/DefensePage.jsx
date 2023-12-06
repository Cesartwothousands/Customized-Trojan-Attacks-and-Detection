// src/pages/DefensePage.jsx

import './DefensePage.css'
import React from 'react';
import NavigationBar from "../components/NavigationBar";

function DefensePage() {
    return (
        <div>
            <div className="app">
                <NavigationBar />
            </div>

            <div className="DefensePage">
                <h1>Defense Page</h1>
            </div>
        </div>
    );
}

export default DefensePage;