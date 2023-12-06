// src/pages/AboutPage.jsx

import './AboutPage.css';
import React from "react";
import NavigationBar from "../components/NavigationBar";

function AboutPage() {
    return (
        <div>
            <div className="app">
                <NavigationBar />
            </div>

            <div className="AboutPage">
                <h1>About Page</h1>
            </div>
        </div>
    );
}

export default AboutPage;