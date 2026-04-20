import React from 'react';
import api from '../api';

export default function PendingApprovals({ leaves, onStatusUpdate }) {
    const unapprovedLeaves = leaves.filter(l => l.status === 'pending');

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`/leaves/${id}`, { status });
            onStatusUpdate();
        } catch (err) {
            alert('Failed to update status: ' + (err.response?.data?.message || err.message));
        }
    };

    if (unapprovedLeaves.length === 0) return null;

    return (
        <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'var(--warning)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem' }}>!</span>
                Pending Approvals
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {unapprovedLeaves.map(leave => (
                    <div key={leave.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border)', padding: '16px', borderRadius: '10px', alignItems: 'center', background: 'var(--bg)' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{leave.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{leave.start_date} to {leave.end_date}</div>
                            <div style={{ marginTop: '4px', fontSize: '0.95rem' }}>"{leave.reason}"</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleUpdateStatus(leave.id, 'approved')} style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                            <button onClick={() => handleUpdateStatus(leave.id, 'rejected')} style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
