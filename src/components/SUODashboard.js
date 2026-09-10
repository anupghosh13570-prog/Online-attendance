import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SUODashboard = () => {
    const [cadets, setCadets] = useState([]);
    const [paradeName, setParadeName] = useState('');
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const navigate = useNavigate();

    useEffect(() => {
        fetchCadets();
    }, []);

    const fetchCadets = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cadets');
            setCadets(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/cadet/approve/${id}`);
            alert('Cadet approved!');
            fetchCadets();
        } catch (err) {
            alert('Approval failed');
        }
    };

    // 1-Click Batch Change Function
    const handleBatchChange = async (id, newBatch) => {
        try {
            await axios.put(`http://localhost:5000/api/cadet/update-batch/${id}`, { batch: newBatch });
            fetchCadets();
        } catch (err) {
            alert('Failed to update batch');
        }
    };

    const handleStartSession = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/attendance/suo/start-session', { paradeName, suoRegNo: user.regimentalNo });
            alert(res.data.msg);
            setParadeName('');
        } catch (err) {
            alert('Failed to start session');
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/export-attendance', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'NCC_Monthly_Attendance.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download excel report');
        }
    };

    const pendingCadets = cadets.filter(c => c.status === 'Pending');
    const approvedCadets = cadets.filter(c => c.status === 'Approved');

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', background: '#f0f2f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#001529', color: '#fff', padding: '20px', borderRadius: '8px', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>SUO Admin Panel (Official NIS NCC Portal)</h2>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>Welcome, {user.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleDownloadExcel} style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📥 Download Excel Report</button>
                    <button onClick={() => { localStorage.removeItem('user'); navigate('/'); }} style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                </div>
            </div>

            {/* Start Parade Window */}
            <div style={{ background: '#fff', padding: '20px', marginTop: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0 }}>Start 15-Minute Attendance Window</h3>
                <form onSubmit={handleStartSession} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input type="text" placeholder="Enter Parade Code (e.g. DRILL-01)" value={paradeName} onChange={e => setParadeName(e.target.value)} required style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <button type="submit" style={{ background: '#1890ff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Start 15-Min Session</button>
                </form>
            </div>

            {/* Pending Approvals */}
            {pendingCadets.length > 0 && (
                <div style={{ background: '#fff', padding: '20px', marginTop: '20px', borderRadius: '8px', borderLeft: '5px solid #faad14' }}>
                    <h3 style={{ marginTop: 0, color: '#d46b08' }}>Pending Registrations ({pendingCadets.length})</h3>
                    <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '10px' }}>Regimental No</th>
                                <th style={{ padding: '10px' }}>Name</th>
                                <th style={{ padding: '10px' }}>Father's Name</th>
                                <th style={{ padding: '10px' }}>Mobile</th>
                                <th style={{ padding: '10px' }}>Batch</th>
                                <th style={{ padding: '10px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCadets.map(cadet => (
                                <tr key={cadet._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{cadet.regimentalNo}</td>
                                    <td style={{ padding: '10px' }}>{cadet.name}</td>
                                    <td style={{ padding: '10px' }}>{cadet.fatherName}</td>
                                    <td style={{ padding: '10px' }}>{cadet.mobileNo}</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#1890ff' }}>{cadet.batch}</td>
                                    <td style={{ padding: '10px' }}>
                                        <button onClick={() => handleApprove(cadet._id)} style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Approved Directory with 1-Click Batch Manager */}
            <div style={{ background: '#fff', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Approved Cadets Directory ({approvedCadets.length})</h3>
                <p style={{ fontSize: '13px', color: '#666' }}>* Jab bhi saal ya exam complete ho, aap yahan dropdown se manually 1st Year ko 2nd Year ya 3rd Year me shift kar sakte hain.</p>
                <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#001529', color: '#fff' }}>
                            <th style={{ padding: '10px' }}>Regimental No</th>
                            <th style={{ padding: '10px' }}>Name</th>
                            <th style={{ padding: '10px' }}>Father's Name</th>
                            <th style={{ padding: '10px' }}>Mobile No</th>
                            <th style={{ padding: '10px' }}>Batch Management (1-Click Update)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvedCadets.length > 0 ? (
                            approvedCadets.map(cadet => (
                                <tr key={cadet._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{cadet.regimentalNo}</td>
                                    <td style={{ padding: '10px' }}>{cadet.name}</td>
                                    <td style={{ padding: '10px' }}>{cadet.fatherName}</td>
                                    <td style={{ padding: '10px' }}>{cadet.mobileNo}</td>
                                    <td style={{ padding: '10px' }}>
                                        <select 
                                            value={cadet.batch} 
                                            onChange={(e) => handleBatchChange(cadet._id, e.target.value)}
                                            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #1890ff', fontWeight: 'bold', color: '#1890ff', background: '#f0f5ff', cursor: 'pointer' }}
                                        >
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No approved cadets found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SUODashboard;