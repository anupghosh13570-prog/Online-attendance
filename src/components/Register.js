import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [regimentalNo, setRegimentalNo] = useState('');
    const [name, setName] = useState('');
    const [batch, setBatch] = useState('1st Year');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/register', { regimentalNo, name, batch, password });
            setMsg(res.data.msg);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setMsg(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '380px' }}>
                <h2 style={{ textAlign: 'center', color: '#1e3c72', marginBottom: '20px' }}>Cadet Registration</h2>
                {msg && <div style={{ color: 'green', marginBottom: '15px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>{msg}</div>}
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" placeholder="Regimental No (e.g. MH22SDA123)" value={regimentalNo} onChange={e => setRegimentalNo(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <select value={batch} onChange={e => setBatch(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                    </select>
                    <input type="password" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <button type="submit" style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Register</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                    Already registered? <Link to="/" style={{ color: '#1e3c72', fontWeight: 'bold' }}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;