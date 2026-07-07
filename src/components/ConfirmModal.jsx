import React from 'react';

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem 2rem' }}>

                <div style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '50%' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                </div>

                <h2 id="confirm-modal-title" style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                    {title}
                </h2>

                <p style={{ color: '#475569', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {message}
                </p>

                <div className="confirm-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button type="button" className="btn-outline" onClick={onCancel}>Cancelar</button>
                    <button type="button" className="btn-danger" style={{ backgroundColor: '#ef4444', margin: 0 }} onClick={onConfirm}>
                        Sim, Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}