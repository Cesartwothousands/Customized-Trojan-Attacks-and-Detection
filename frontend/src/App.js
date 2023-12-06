import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ComparePage from './pages/ComparePage';
import DefensePage from './pages/DefensePage';
import AboutPage from "./pages/AboutPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ComparePage />} />
                <Route path="/attack" element={<ComparePage />} />
                <Route path="/defense" element={<DefensePage />} />
                <Route path="/about" element={<AboutPage />} />
            </Routes>
        </Router>
    );
}

export default App;