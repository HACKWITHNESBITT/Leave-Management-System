import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef(null);

    const startCooldown = () => {
        setCooldown(60);
        timerRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('/forgot-password', { email });
            setSent(true);
            startCooldown();
        } catch (err) {
            // Always treat as success to not leak user enumeration info
            // (backend already returns 200 always, but guard here too)
            if (err.response?.status === 422) {
                setError(err.response.data?.message || 'Invalid email address.');
            } else {
                setSent(true); // Don't reveal server errors to prevent enumeration
                startCooldown();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || loading) return;
        setError(null);
        setLoading(true);
        try {
            await api.post('/forgot-password', { email });
            startCooldown();
        } catch {
            startCooldown(); // Still start cooldown
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', padding: '20px', background: 'var(--bg)',
        }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%', animation: 'fadeUp 0.4s ease' }}>
                <style>{`
                    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '68px', height: '68px', borderRadius: '20px',
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', margin: '0 auto 1.25rem',
                        boxShadow: '0 10px 25px rgba(99,102,241,0.35)',
                    }}>🔑</div>
                    <h2 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.5rem' }}>
                        {sent ? 'Check Your Inbox' : 'Forgot Password?'}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        {sent
                            ? `We've sent a reset link to ${email}. Check your spam folder too.`
                            : "Enter your registered email and we'll send you a secure reset link."}
                    </p>
                </div>

                {/* Success state */}
                {sent && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{
                            padding: '14px 16px', borderRadius: '10px', fontSize: '0.9rem',
                            background: 'rgba(16,185,129,0.08)', color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.2)',
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                        }}>
                            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>✅</span>
                            <div>
                                <strong>Reset link sent!</strong>
                                <div style={{ marginTop: '3px', fontSize: '0.83rem', opacity: 0.85 }}>
                                    The link expires in 60 minutes. Click it to choose a new password.
                                </div>
                            </div>
                        </div>

                        {/* Resend button with cooldown */}
                        <button
                            onClick={handleResend}
                            disabled={cooldown > 0 || loading}
                            style={{
                                padding: '11px', borderRadius: '8px', cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                                background: 'transparent', color: cooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                                border: `1px solid ${cooldown > 0 ? 'var(--border)' : 'var(--primary)'}`,
                                fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                            }}
                        >
                            {loading ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : '↩ Resend Reset Link'}
                        </button>
                    </div>
                )}

                {/* Error */}
                {error && !sent && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem',
                        background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.2)',
                    }}>
                        ❌ {error}
                    </div>
                )}

                {/* Form — only shown before success */}
                {!sent && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.875rem' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoFocus
                                style={{ width: '100%', padding: '11px 14px', boxSizing: 'border-box', fontSize: '0.95rem' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            style={{
                                padding: '12px', borderRadius: '8px', border: 'none',
                                cursor: loading || !email ? 'not-allowed' : 'pointer',
                                background: 'var(--primary)', color: 'white', fontWeight: 700,
                                fontSize: '1rem', opacity: loading || !email ? 0.65 : 1,
                                transition: 'opacity 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}
                        >
                            {loading && (
                                <div style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff', animation: 'spin 0.7s linear infinite',
                                }} />
                            )}
                            {loading ? 'Sending Link…' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
