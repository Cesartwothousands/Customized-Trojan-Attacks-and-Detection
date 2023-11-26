import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ComparePage from './pages/ComparePage/ComparePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ComparePage />} />
            </Routes>
        </Router>
    );
}

export default App;