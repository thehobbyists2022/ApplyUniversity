import React from 'react';
import { X, Printer, Heart, MapPin, DollarSign, Award, Trash2 } from 'lucide-react';
import { COLLEGES } from '../data/colleges';

export default function SavedCompareModal({ isOpen, onClose, savedIds, onRemoveSave }) {
  if (!isOpen) return null;

  const savedColleges = COLLEGES.filter(c => savedIds.includes(c.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '900px', width: '95%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingRight: '2rem' }}>
            <div>
              <div style={{ color: '#b45309', fontWeight: 800, fontSize: '0.825rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Heart size={15} fill="#b45309" /> Saved List ({savedColleges.length})
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>College Comparison Matrix</h2>
            </div>

            {savedColleges.length > 0 && (
              <button 
                onClick={handlePrint}
                className="detail-btn"
                style={{ background: '#0f172a', color: '#ffffff', padding: '0.5rem 1rem' }}
              >
                <Printer size={16} />
                <span>Print / Save as PDF</span>
              </button>
            )}
          </div>
        </div>

        <div className="modal-body">
          {savedColleges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Heart size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#64748b' }}>Your saved list is empty</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.35rem' }}>Click the heart icon on any college card to bookmark it here for side-by-side comparison.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc' }}>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>College</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>Location & Setting</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>Acceptance</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>Ranking</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>Tuition (Out-of-State)</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedColleges.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#0f172a' }}>
                        <div>{c.name}</div>
                        <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {c.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>
                        {c.location.city}, {c.location.state} <br />
                        <span style={{ fontSize: '0.775rem', color: '#64748b' }}>{c.location.setting}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#b45309' }}>{c.acceptanceRate}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#6b21a8' }}>{c.ranking}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>{c.tuitionOutState} / yr</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <button 
                          onClick={() => onRemoveSave(c.id)}
                          style={{ color: '#ef4444', padding: '0.35rem', borderRadius: '4px' }}
                          title="Remove from saved"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
