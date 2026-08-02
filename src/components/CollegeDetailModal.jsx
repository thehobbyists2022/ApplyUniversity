import React from 'react';
import { X, MapPin, CheckCircle, AlertTriangle, Users, DollarSign, Award, BookOpen, ExternalLink } from 'lucide-react';
import { normalizeUrl } from '../utils/url';
import { getTranslation } from '../utils/i18n';

export default function CollegeDetailModal({ college, onClose, onToggleSave, isSaved, lang }) {
  if (!college) return null;

  const t = (k) => getTranslation(lang, k);
  const officialUrl = normalizeUrl(college.officialUrl);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-type">{college.type}</span>
              <span className="badge badge-rank">{college.ranking}</span>
            </div>
            {officialUrl && (
              <a 
                href={officialUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  background: '#e0e7ff',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
              >
                <span>{t('visitOfficialSite')}</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.4rem' }}>{college.name}</h2>
          <div className="college-location" style={{ marginTop: '0.35rem' }}>
            <MapPin size={16} />
            <span>{college.location.city}, {college.location.state} • {college.location.region} region ({college.location.setting} setting)</span>
          </div>
        </div>

        <div className="modal-body">
          {/* Key Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.5rem',
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{t('acceptanceRate')}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b45309' }}>{college.acceptanceRate}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{t('undergraduates')}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0369a1' }}>{college.undergradsCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{t('inStateTuition')}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{college.tuitionInState}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{t('outOfState')}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{college.tuitionOutState}</div>
            </div>
          </div>

          {/* Vibe Tags */}
          {(college.vibeTags || []).length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{t('campusVibe')}</h4>
              <div className="vibe-tags">
                {college.vibeTags.map((v, i) => (
                  <span key={i} className="vibe-tag" style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 600, padding: '0.3rem 0.7rem' }}>
                    #{v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pros & Cons (Authentic Insights) */}
          {(college.pros || []).length > 0 && (college.cons || []).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ color: '#166534', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={18} /> {t('studentPros')}
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#14532d' }}>
                  {college.pros.map((pro, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{pro}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ color: '#9f1239', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={18} /> {t('pointsToConsider')}
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#881337' }}>
                  {college.cons.map((con, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Peer Colleges */}
          {(college.peerSchools || []).length > 0 && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem' }}>{t('similarPeers')}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {college.peerSchools.map((peer, i) => (
                  <span key={i} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#334155' }}>
                    {peer}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
