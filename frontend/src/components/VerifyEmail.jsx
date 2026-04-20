import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

export default function VerifyEmail() {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email address...');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            const queryParams = new URLSearchParams(location.search);
            const id = queryParams.get('id');
            const hash = queryParams.get('hash');
            
            // We need the parameters from the signed URL
            // The signed URL includes things like expires and signature
            const signature = queryParams.get('signature');
            const expires = queryParams.get('expires');

            if (!id || !hash || !signature || !expires) {
                setStatus('error');
                setMessage('Invalid or expired verification link.');
                return;
            }

            try {
                const { data } = await api.get(`/verify-email/${id}/${hash}?expires=${expires}&signature=${signature}`);
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');
                setTimeout(() => navigate('/'), 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
            }
        };

        verify();
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {status === 'verifying' && <div style={{ width: '50px', height: '50px', border: '5px solid var(--border)', borderTop: '5px solid var(--primary)', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>}
                    {status === 'success' && '✅'}
                    {status === 'error' && '❌'}
                </div>
                <h2 style={{ marginBottom: '1rem' }}>
                    {status === 'verifying' && 'Checking Link...'}
                    {status === 'success' && 'Verification Successful!'}
                    {status === 'error' && 'Verification Failed'}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>{message}</p>
                {status === 'success' && <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Redirecting to login in 3 seconds...</p>}
                {(status === 'error' || status === 'success') && (
                    <button 
                        onClick={() => navigate('/')} 
                        style={{ marginTop: '2rem', padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Go to Login
                    </button>
                )}
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}
