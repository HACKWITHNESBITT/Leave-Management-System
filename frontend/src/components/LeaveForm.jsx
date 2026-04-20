import React, { useState } from 'react';
import api from '../api';

export default function LeaveForm({ user, onLeaveSubmitted }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        start_date: '',
        end_date: '',
        reason: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setError('End date cannot be before start date.');
            setIsLoading(false);
            return;
        }

        try {
            await api.post('/leaves', formData);
            setSuccess('Your leave request has been submitted successfully.');
            setFormData({ ...formData, start_date: '', end_date: '', reason: '' });
            if (onLeaveSubmitted) onLeaveSubmitted();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem' }}>+</span>
                Request New Leave
            </h3>
            
            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {success}
                </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>Name</label>
                        <input type="text" value={formData.name} disabled style={{ width: '100%', opacity: 0.7, background: 'var(--bg)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email</label>
                        <input type="email" value={formData.email} disabled style={{ width: '100%', opacity: 0.7, background: 'var(--bg)' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Start Date</label>
                        <input type="date" required value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>End Date</label>
                        <input type="date" required value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} style={{ width: '100%' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Reason for Leave</label>
                    <textarea required placeholder="Briefly describe why you are taking leave..." value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}></textarea>
                </div>

                <button type="submit" disabled={isLoading} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', alignSelf: 'flex-start', fontWeight: 600 }}>
                    {isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
}
