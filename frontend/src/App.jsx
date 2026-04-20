import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import LeaveForm from './components/LeaveForm';
import CalendarView from './components/CalendarView';
import PendingApprovals from './components/PendingApprovals';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { AddAdminModal, AdminListPanel, Toast } from './components/AdminPanel';
import api from './api';

function Dashboard({ user, onLogout }) {
    const [leaves, setLeaves] = useState([]);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [adminRefresh, setAdminRefresh] = useState(0);
    const [toast, setToast] = useState(null);

    const fetchLeaves = async () => {
        try {
            const { data } = await api.get('/leaves');
            setLeaves(data);
        } catch (err) {
            console.error('Failed to fetch leaves', err);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleAdminCreated = () => {
        setShowAddAdmin(false);
        setAdminRefresh(r => r + 1);
        setToast({ message: 'Admin created successfully!', type: 'success' });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {showAddAdmin && (
                <AddAdminModal
                    onClose={() => setShowAddAdmin(false)}
                    onSuccess={handleAdminCreated}
                />
            )}

            <header style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '8px', fontWeight: 800, fontSize: '1.2rem' }}>LM</div>
                        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>LeavePortal</h1>
                        {user?.role === 'admin' && (
                            <button
                                id="add-admin-btn"
                                onClick={() => setShowAddAdmin(true)}
                                style={{
                                    marginLeft: '8px',
                                    padding: '7px 14px',
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: 'white', border: 'none', borderRadius: '8px',
                                    cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                }}
                                onMouseOver={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(99,102,241,0.45)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(99,102,241,0.35)'; }}
                            >
                                <span style={{ fontSize: '1rem' }}>+</span> Add Admin
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role} Account</div>
                        </div>
                        <button onClick={onLogout} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ marginBottom: '0.25rem' }}>Dashboard Overview</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name.split(' ')[0]}. Here is what's happening today.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                             <LeaveForm user={user} onLeaveSubmitted={fetchLeaves} />
                             {user?.role === 'admin' && <PendingApprovals leaves={leaves} onStatusUpdate={fetchLeaves} />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                             <CalendarView leaves={leaves} user={user} />
                             {user?.role === 'admin' && (
                                 <AdminListPanel refreshTrigger={adminRefresh} currentUserId={user.id} />
                             )}
                        </div>
                    </div>
                </div>
            </main>
            
            <footer style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                &copy; 2026 Leave Management System. Built with React & Laravel.
            </footer>
        </div>
    );
}

function VerificationRequired({ onLogout }) {
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState(null);

    const handleResend = async () => {
        setResending(true);
        try {
            const { data } = await api.post('/email/verification-notification');
            setMessage(data.message);
        } catch (err) {
            setMessage('Failed to resend. Please try again later.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                <h2 style={{ marginBottom: '1rem' }}>Verify Your Email</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    You're almost there! We've sent a verification link to your email. 
                    Please click the link to verify your account and access the system.
                </p>
                {message && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {message}
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                        onClick={handleResend} 
                        disabled={resending}
                        style={{ padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        {resending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    <button 
                        onClick={onLogout} 
                        style={{ padding: '12px', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Sign Out / Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Set default header from stored token first
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const { data } = await api.get('/user');
                setUser(data);
            } catch (err) {
                console.error('Auth verification failed', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete api.defaults.headers.common['Authorization'];
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
        document.body.style.overflow = 'auto';
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Loading System...</div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/login" element={!user ? <Auth onLogin={setUser} /> : <Navigate to="/" />} />
                <Route path="/" element={
                    user ? (
                        user.email_verified_at ? (
                            <Dashboard user={user} onLogout={handleLogout} />
                        ) : (
                            <VerificationRequired onLogout={handleLogout} />
                        )
                    ) : (
                        <Navigate to="/login" />
                    )
                } />
            </Routes>
        </BrowserRouter>
    );
}



export default App;
