import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

// ─── Password Strength Meter ──────────────────────────────────────────────────
function PasswordStrength({ password }) {
    const checks = [
        { label: 'At least 8 characters', pass: password.length >= 8 },
        { label: 'Uppercase letter',       pass: /[A-Z]/.test(password) },
        { label: 'Lowercase letter',       pass: /[a-z]/.test(password) },
        { label: 'Number',                 pass: /[0-9]/.test(password) },
        { label: 'Special character',      pass: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.pass).length;
    const levels = [
        { label: 'Very Weak', color: '#ef4444' },
        { label: 'Weak',      color: '#f97316' },
        { label: 'Fair',      color: '#eab308' },
        { label: 'Good',      color: '#22c55e' },
        { label: 'Strong',    color: '#10b981' },
    ];
    const level = levels[Math.max(0, score - 1)] || levels[0];

    if (!password) return null;

    return (
        <div style={{ marginTop: '8px' }}>
            {/* Bar */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i <= score ? level.color : 'var(--border)',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </div>
            {/* Label + checks */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: level.color, fontWeight: 700 }}>
                    {level.label}
                </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {checks.map(({ label, pass }) => (
                    <span key={label} style={{
                        fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px',
                        background: pass ? 'rgba(16,185,129,0.12)' : 'var(--bg)',
                        color: pass ? '#10b981' : 'var(--text-muted)',
                        border: `1px solid ${pass ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                        transition: 'all 0.2s',
                    }}>
                        {pass ? '✓' : '○'} {label}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ─── Password Field with Toggle ───────────────────────────────────────────────
function PasswordField({ label, value, onChange, placeholder, id, error }) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label htmlFor={id} style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.875rem' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    required
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{
                        width: '100%', padding: '11px 44px 11px 14px',
                        boxSizing: 'border-box', fontSize: '0.95rem',
                        border: error ? '1px solid #ef4444' : '1px solid var(--border)',
                    }}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '1rem', padding: '2px',
                    }}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >{show ? '🙈' : '👁️'}</button>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '4px 0 0' }}>{error}</p>}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: searchParams.get('email') || '',
        token: searchParams.get('token') || '',
        password: '',
        password_confirmation: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [status, setStatus] = useState(null); // { type, message }
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(null);

    // Missing token guard
    const tokenMissing = !form.token;

    useEffect(() => {
        if (countdown === null) return;
        if (countdown <= 0) { navigate('/login?reset=success'); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, navigate]);

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = 'Email is required.';
        if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
        if (form.password !== form.password_confirmation)
            errs.password_confirmation = 'Passwords do not match.';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setStatus(null);
        try {
            const { data } = await api.post('/reset-password', form);
            setStatus({ type: 'success', message: data.message });
            setCountdown(5);
        } catch (err) {
            const msg = err.response?.data?.message || 'Reset failed. The link may have expired.';
            setStatus({ type: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', padding: '20px', background: 'var(--bg)',
        }}>
            <div className="card" style={{ maxWidth: '460px', width: '100%', animation: 'fadeUp 0.4s ease' }}>
                <style>{`
                    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                    @keyframes spin   { to { transform: rotate(360deg); } }
                `}</style>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '68px', height: '68px', borderRadius: '20px',
                        background: status?.type === 'success'
                            ? 'linear-gradient(135deg,#10b981,#22c55e)'
                            : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', margin: '0 auto 1.25rem',
                        boxShadow: '0 10px 25px rgba(59,130,246,0.3)',
                        transition: 'background 0.5s',
                    }}>
                        {status?.type === 'success' ? '✅' : '🔒'}
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.5rem' }}>
                        {status?.type === 'success' ? 'Password Updated!' : 'Set New Password'}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {status?.type === 'success'
                            ? `Redirecting to login in ${countdown}s…`
                            : 'Choose a strong password for your account.'}
                    </p>
                </div>

                {/* Invalid token state */}
                {tokenMissing && (
                    <div style={{
                        padding: '16px', borderRadius: '10px', textAlign: 'center',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', marginBottom: '1.5rem',
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⚠️</div>
                        <strong>Invalid Reset Link</strong>
                        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                            This link is missing a reset token. Please request a new one.
                        </p>
                    </div>
                )}

                {/* Status message */}
                {status && (
                    <div style={{
                        padding: '14px 16px', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem',
                        background: status.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        color: status.type === 'success' ? '#10b981' : '#ef4444',
                        border: `1px solid ${status.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                    }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                            {status.type === 'success' ? '✅' : '❌'}
                        </span>
                        <div>
                            {status.message}
                            {status.type === 'error' && (
                                <div style={{ marginTop: '6px' }}>
                                    <Link to="/forgot-password" style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                                        → Request a new reset link
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Form — hide on success or missing token */}
                {!tokenMissing && status?.type !== 'success' && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {/* Email */}
                        <div>
                            <label htmlFor="reset-email" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.875rem' }}>
                                Email Address
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                required
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="your@email.com"
                                style={{
                                    width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                                    border: fieldErrors.email ? '1px solid #ef4444' : '1px solid var(--border)',
                                }}
                            />
                            {fieldErrors.email && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '4px 0 0' }}>{fieldErrors.email}</p>}
                        </div>

                        {/* New Password with strength meter */}
                        <div>
                            <PasswordField
                                id="reset-password"
                                label="New Password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder="Min. 8 characters"
                                error={fieldErrors.password}
                            />
                            <PasswordStrength password={form.password} />
                        </div>

                        {/* Confirm Password */}
                        <PasswordField
                            id="reset-confirm"
                            label="Confirm New Password"
                            value={form.password_confirmation}
                            onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                            placeholder="Re-enter your new password"
                            error={fieldErrors.password_confirmation}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.25rem', padding: '12px', borderRadius: '8px',
                                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                background: 'var(--primary)', color: 'white',
                                fontWeight: 700, fontSize: '1rem',
                                opacity: loading ? 0.7 : 1,
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
                            {loading ? 'Resetting Password…' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* Manual redirect on success */}
                {status?.type === 'success' && (
                    <div style={{ textAlign: 'center' }}>
                        <Link
                            to="/login"
                            style={{
                                display: 'inline-block', padding: '11px 28px', borderRadius: '8px',
                                background: 'var(--primary)', color: 'white', fontWeight: 700,
                                textDecoration: 'none', fontSize: '0.95rem',
                            }}
                        >
                            Go to Login Now
                        </Link>
                    </div>
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
