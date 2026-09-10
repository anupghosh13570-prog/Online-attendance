import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import CadetDashboard from './components/CadetDashboard';
import SUODashboard from './components/SUODashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cadet-dashboard" element={<CadetDashboard />} />
        <Route path="/suo-dashboard" element={<SUODashboard />} />
      </Routes>
    </Router>
  );
}

export default App;