import React, { useState, useEffect } from 'react';
import api from '../api';

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    const colors = {
        success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
        error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  text: '#ef4444' },
    };
    const c = colors[type] || colors.success;

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            background: c.bg, border: `1px solid ${c.border}`, color: c.text,
            padding: '14px 20px', borderRadius: '10px', fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            animation: 'slideUp 0.3s ease',
        }}>
            {type === 'success' ? '✅ ' : '❌ '}{message}
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}

// ─── Add Admin Modal ─────────────────────────────────────────────────────────
function AddAdminModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            await api.post('/admins', form);
            onSuccess();
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: err.response?.data?.message || 'Something went wrong.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const field = (label, key, type = 'text', placeholder = '') => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required
                style={{
                    padding: '10px 14px', borderRadius: '8px',
                    border: errors[key] ? '1px solid #ef4444' : '1px solid var(--border)',
                    background: 'var(--bg)', color: 'var(--text)',
                    fontSize: '0.95rem', outline: 'none', width: '100%',
                    boxSizing: 'border-box',
                }}
            />
            {errors[key] && (
                <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors[key][0]}</span>
            )}
        </div>
    );

    return (
        /* Overlay */
        <div
            onClick={e => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.2s ease',
            }}
        >
            <div style={{
                background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem',
                width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '1px solid var(--border)',
                animation: 'scaleIn 0.2s ease',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Add New Admin</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Grant admin access to a new user
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--bg)', border: '1px solid var(--border)',
                            borderRadius: '8px', width: '32px', height: '32px',
                            cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >✕</button>
                </div>

                {errors.general && (
                    <div style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.875rem' }}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {field('Full Name', 'name', 'text', 'e.g. Jane Doe')}
                    {field('Email Address', 'email', 'email', 'jane@company.com')}
                    {field('Password', 'password', 'password', 'Min. 6 characters')}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                        <button
                            type="button" onClick={onClose}
                            style={{
                                flex: 1, padding: '11px', borderRadius: '8px', cursor: 'pointer',
                                background: 'transparent', color: 'var(--text)',
                                border: '1px solid var(--border)', fontWeight: 600,
                            }}
                        >Cancel</button>
                        <button
                            type="submit" disabled={loading}
                            style={{
                                flex: 2, padding: '11px', borderRadius: '8px', cursor: 'pointer',
                                background: 'var(--primary)', color: 'white',
                                border: 'none', fontWeight: 700, fontSize: '0.95rem',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? 'Creating...' : '+ Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
                @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
            `}</style>
        </div>
    );
}

// ─── Admin List Panel ─────────────────────────────────────────────────────────
function AdminListPanel({ refreshTrigger, currentUserId }) {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admins');
            setAdmins(data);
        } catch (err) {
            console.error('Failed to fetch admins', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, [refreshTrigger]);

    const handleRemove = async (admin) => {
        if (!window.confirm(`Remove ${admin.name} as admin? They will become a regular user.`)) return;
        setRemovingId(admin.id);
        try {
            await api.delete(`/admins/${admin.id}`);
            setToast({ message: `${admin.name} removed from admins.`, type: 'success' });
            fetchAdmins();
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Failed to remove admin.', type: 'error' });
        } finally {
            setRemovingId(null);
        }
    };

    const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const colorFor = (id) => avatarColors[id % avatarColors.length];

    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontWeight: 700 }}>Admin Users</h3>
                    <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {admins.length} admin{admins.length !== 1 ? 's' : ''} in the system
                    </p>
                </div>
                <span style={{
                    background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                    padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
                }}>🛡 Admin Panel</span>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading admins…</div>
            ) : admins.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No admins found.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {admins.map(admin => (
                        <div key={admin.id} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '12px 14px', borderRadius: '10px',
                            background: 'var(--bg)', border: '1px solid var(--border)',
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                background: colorFor(admin.id), color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.95rem',
                            }}>
                                {initials(admin.name)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                    {admin.name}
                                    {admin.id === currentUserId && (
                                        <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '2px 8px', borderRadius: '999px' }}>You</span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{admin.email}</div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '8px', textAlign: 'right' }}>
                                {new Date(admin.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            {admin.id !== currentUserId && (
                                <button
                                    onClick={() => handleRemove(admin)}
                                    disabled={removingId === admin.id}
                                    title="Remove admin"
                                    style={{
                                        background: 'transparent', border: '1px solid var(--danger)',
                                        color: 'var(--danger)', borderRadius: '6px', padding: '5px 10px',
                                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                        flexShrink: 0, opacity: removingId === admin.id ? 0.5 : 1,
                                    }}
                                >
                                    {removingId === admin.id ? '…' : 'Remove'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export { AddAdminModal, AdminListPanel, Toast };
