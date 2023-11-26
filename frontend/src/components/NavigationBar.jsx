// src/components/NavigationBar.jsx

import './NavigationBar.css';
import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const NavigationBar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-logo">
                    <img src="/trojanHorse.webp" alt="Logo" />
                </Link>
                <Link className="nav-item" to="/">Home</Link>
                <Link className="nav-item" to="/compare">Compare</Link>
                <Link className="nav-item" to="/search">Search</Link>
                <Link className="nav-item" to="/add">Add</Link>
                <Link className="nav-item" to="/edit">Edit</Link>
                <Link className="nav-item" to="/delete">Delete</Link>
                <Link className="nav-item" to="/about">About</Link>
            </div>
        </nav>
    );
};

export default NavigationBar;
