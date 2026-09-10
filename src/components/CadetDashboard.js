import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CadetDashboard = () => {
    const [paradeCode, setParadeCode] = useState('');
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const navigate = useNavigate();

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/attendance/cadet/mark-timed', {
                regimentalNo: user.regimentalNo,
                paradeName: paradeCode
            });
            alert(res.data.msg);
            setParadeCode('');
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to mark attendance');
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1e3c72', color: '#fff', padding: '20px', borderRadius: '8px', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Cadet Portal</h2>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Welcome, {user.name} ({user.regimentalNo} - {user.batch})</p>
                </div>
                <button onClick={() => { localStorage.removeItem('user'); navigate('/'); }} style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
            </div>

            <div style={{ background: '#fff', padding: '20px', marginTop: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0 }}>Mark Parade Attendance</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Enter the active parade code given by your SUO within the 15-minute window.</p>
                <form onSubmit={handleMarkAttendance} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <input type="text" placeholder="Enter Parade Code (e.g. DRILL-01)" value={paradeCode} onChange={e => setParadeCode(e.target.value)} required style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <button type="submit" style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Attendance</button>
                </form>
            </div>
        </div>
    );
};

export default CadetDashboard;