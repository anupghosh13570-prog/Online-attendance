import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [regimentalNo, setRegimentalNo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { regimentalNo, password });
            localStorage.setItem('user', JSON.stringify(res.data.user));

            if (res.data.user.role === 'SUO') {
                navigate('/suo-dashboard');
            } else {
                navigate('/cadet-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px' }}>
                <h2 style={{ textAlign: 'center', color: '#1e3c72', marginBottom: '20px' }}>NCC Portal Login</h2>
                {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" placeholder="Regimental No (e.g. SUO001)" value={regimentalNo} onChange={e => setRegimentalNo(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                    New Cadet? <Link to="/register" style={{ color: '#1e3c72', fontWeight: 'bold' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;