import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [statusMessage, setStatusMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setStatusMessage(null);
        setIsLoading(true);
        try {
            const endpoint = isLogin ? '/login' : '/register';
            const { data } = await api.post(endpoint, formData);
            
            if (isLogin) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    onLogin(data.user);
                }
            } else {
                setStatusMessage(data.message || 'Registration successful! Please check your email to verify your account.');
                setIsLogin(true);
            }
        } catch (err) {
            console.error('Auth Error:', err);
            if (err.response?.status === 403) {
                setError('Your email is not verified. Please check your inbox for the verification link.');
            } else if (err.response?.data?.errors) {
                const messages = Object.values(err.response.data.errors).flat();
                setError(messages.join(' '));
            } else {
                setError(err.response?.data?.message || 'Authentication failed. Please check your connection to the server.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isLogin ? 'Manage your leave requests effortlessly' : 'Join the system to start planning your time off'}
                    </p>
                </div>
                
                {statusMessage && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        {statusMessage}
                    </div>
                )}

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%' }} placeholder="John Doe" />
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%' }} placeholder="john@example.com" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 500 }}>Password</label>
                            {isLogin && (
                                <Link
                                    to="/forgot-password"
                                    style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>
                        <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%' }} placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={isLoading} style={{ padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' }}>
                        {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, marginLeft: '0.5rem' }}>
                            {isLogin ? 'Register Now' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

