import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRScanner from './QRScanner';

const Dashboard = () => {
    const [cadets, setCadets] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [activeTab, setActiveTab] = useState('1st Year');
    const [manualRegNo, setManualRegNo] = useState('');
    const [paradeName, setParadeName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/attendance/all');
            setCadets(res.data.cadets || []);
            setAttendanceRecords(res.data.attendanceRecords || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualRegNo || !paradeName) {
            alert('Please enter Regimental No and Parade Name');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/attendance/manual', {
                regimentalNo: manualRegNo,
                paradeName
            });
            alert('Manual Attendance Marked Successfully!');
            setManualRegNo('');
            setParadeName('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error marking attendance');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`http://localhost:5000/api/attendance/${id}`);
                fetchData();
            } catch (err) {
                alert('Error deleting record');
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const filteredCadets = cadets.filter(cadet => cadet.calculatedYear === activeTab);

    // Total unique parades/classes conducted overall
    const totalUniqueParades = [...new Set(attendanceRecords.map(r => r.paradeName))].length;

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e3d59', color: '#fff', padding: '15px 20px', borderRadius: '5px' }}>
                <h2>NCC Attendance Portal - SUO Dashboard</h2>
                <button onClick={handleLogout} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Manual Attendance Entry</h3>
                    <form onSubmit={handleManualSubmit} style={{ marginTop: '10px' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                placeholder="Cadet Regimental No"
                                value={manualRegNo}
                                onChange={(e) => setManualRegNo(e.target.value)}
                                style={{ width: '100%', padding: '8px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                placeholder="Parade Name (e.g., Drill, Weapon Training)"
                                value={paradeName}
                                onChange={(e) => setParadeName(e.target.value)}
                                style={{ width: '100%', padding: '8px' }}
                                required
                            />
                        </div>
                        <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>Add Present Attendance</button>
                    </form>
                </div>

                <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>QR Scanner (Live Attendance)</h3>
                    <QRScanner onScanSuccess={fetchData} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
                {['1st Year', '2nd Year', '3rd Year'].map(year => (
                    <button
                        key={year}
                        onClick={() => setActiveTab(year)}
                        style={{
                            padding: '10px 20px',
                            background: activeTab === year ? '#1e3d59' : '#e0e0e0',
                            color: activeTab === year ? '#fff' : '#333',
                            border: 'none',
                            borderRadius: '5px 5px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {year} ({cadets.filter(c => c.calculatedYear === year).length})
                    </button>
                ))}
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '0 0 8px 8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>Cadet List & Status ({activeTab}) — Total Parades Conducted: {totalUniqueParades}</h3>
                {filteredCadets.length === 0 ? (
                    <p style={{ color: '#777', marginTop: '10px' }}>No cadets registered in this year yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f1f1f1', borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '10px' }}>Regimental No</th>
                                    <th style={{ padding: '10px' }}>Name</th>
                                    <th style={{ padding: '10px' }}>Total Classes</th>
                                    <th style={{ padding: '10px' }}>Attended</th>
                                    <th style={{ padding: '10px' }}>Absent</th>
                                    <th style={{ padding: '10px' }}>Percentage (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCadets.map(cadet => {
                                    const cadetRecords = attendanceRecords.filter(r => r.regimentalNo === cadet.regimentalNo);
                                    const attendedCount = cadetRecords.length;
                                    const absentCount = Math.max(0, totalUniqueParades - attendedCount);
                                    const percentage = totalUniqueParades > 0 ? ((attendedCount / totalUniqueParades) * 100).toFixed(1) : '0.0';

                                    return (
                                        <tr key={cadet._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>{cadet.regimentalNo}</td>
                                            <td style={{ padding: '10px' }}>{cadet.name}</td>
                                            <td style={{ padding: '10px' }}>{totalUniqueParades}</td>
                                            <td style={{ padding: '10px', color: '#27ae60', fontWeight: 'bold' }}>{attendedCount}</td>
                                            <td style={{ padding: '10px', color: '#e74c3c', fontWeight: 'bold' }}>{absentCount}</td>
                                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{percentage}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '30px' }}>
                <h3>All Attendance Logs</h3>
                <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f1f1f1', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '10px' }}>Regimental No</th>
                                <th style={{ padding: '10px' }}>Name</th>
                                <th style={{ padding: '10px' }}>Parade</th>
                                <th style={{ padding: '10px' }}>Time</th>
                                <th style={{ padding: '10px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.map(record => (
                                <tr key={record._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{record.regimentalNo}</td>
                                    <td style={{ padding: '10px' }}>{record.name}</td>
                                    <td style={{ padding: '10px' }}>{record.paradeName}</td>
                                    <td style={{ padding: '10px' }}>{new Date(record.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleDelete(record._id)}
                                            style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;