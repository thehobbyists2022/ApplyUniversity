import React, { useState, useMemo } from 'react';
import { X, MapPin, CheckCircle, AlertTriangle, Calculator, ChevronDown, PlusCircle, ExternalLink } from 'lucide-react';
import { normalizeUrl } from '../utils/url';
import { getTranslation } from '../utils/i18n';
import { COLLEGES } from '../data/colleges';
import { INCOME_BANDS, estimateNetPrice, getFinancialRisk, findPeerColleges } from '../utils/collegeFinance';

export default function CollegeDetailModal({ college, onClose, onToggleSave, isSaved, lang, onAddToCompare }) {
  const [estimatorOpen, setEstimatorOpen] = useState(true);
  const [incomeBandId, setIncomeBandId] = useState('40-80');
  const [residency, setResidency] = useState(
    college && college.type && college.type.toLowerCase().includes('public') ? 'inState' : 'outState'
  );

  const t = (k, vars) => getTranslation(lang, k, vars);
  const officialUrl = normalizeUrl(college && college.officialUrl);

  // 相似學校 (Peer): 資料有 peerSchools 時優先, 否則由演算法從全美資料庫推導
  const derivedPeers = useMemo(() => findPeerColleges(college, 4), [college]);
  const peerList = useMemo(() => {
    const raw = college && college.peerSchools && college.peerSchools.length ? college.peerSchools : [];
    if (raw.length) {
      const resolved = raw
        .map(name => COLLEGES.find(c => c.name === name || c.shortName === name))
        .filter(Boolean);
      if (resolved.length) return resolved;
    }
    return derivedPeers;
  }, [college, derivedPeers]);

  // 網頁環境: 用 <a target="_blank">; Capacitor App: 用 Browser.open() 開外部瀏覽器
  const isCapacitor = typeof window !== 'undefined' && !!window.Capacitor;
  const openOfficialUrl = (e) => {
    if (isCapacitor) {
      e.preventDefault();
      import('@capacitor/browser').then(({ Browser }) => {
        Browser.open({ url: officialUrl });
      });
    }
  };

  if (!college) return null;

  // Net Price 估算
  const band = INCOME_BANDS.find(b => b.id === incomeBandId) || INCOME_BANDS[1];
  const netEst = estimateNetPrice(college, band, residency);
  const risk = getFinancialRisk(netEst.net);

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
                onClick={openOfficialUrl}
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

          {/* Net Price & Aid Estimator */}
          <div className={`net-price-card ${estimatorOpen ? 'open' : ''}`}>
            <div className="net-price-header" onClick={() => setEstimatorOpen(o => !o)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setEstimatorOpen(o => !o)}>
              <div className="net-price-title">
                <Calculator size={18} />
                <span>{t('netPriceTitle')}</span>
              </div>
              <ChevronDown size={18} className={`net-price-chevron ${estimatorOpen ? 'open' : ''}`} />
            </div>

            {estimatorOpen && (
              <div className="net-price-body">
                <p className="net-price-subtitle">{t('netPriceSubtitle')}</p>

                <div className="np-controls">
                  <div className="np-control-group">
                    <div className="np-label">{t('residency')}</div>
                    <div className="segmented">
                      <button
                        className={`seg ${residency === 'inState' ? 'active' : ''}`}
                        onClick={() => setResidency('inState')}
                      >
                        {t('inStateResident')}
                      </button>
                      <button
                        className={`seg ${residency === 'outState' ? 'active' : ''}`}
                        onClick={() => setResidency('outState')}
                      >
                        {t('outStateResident')}
                      </button>
                    </div>
                  </div>

                  <div className="np-control-group">
                    <div className="np-label">{t('familyIncome')}</div>
                    <div className="income-pills">
                      {INCOME_BANDS.map(b => (
                        <button
                          key={b.id}
                          className={`chip-btn ${b.id === incomeBandId ? 'active' : ''}`}
                          onClick={() => setIncomeBandId(b.id)}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="np-result">
                  <div className="np-result-left">
                    <div className="np-est-label">{t('estimatedNetPrice')}</div>
                    <div className="np-est-value">${netEst.net.toLocaleString()}</div>
                    <div className="np-per-year">{t('netPricePerYear')}</div>
                  </div>
                  <div className={`np-risk np-risk-${risk.level}`}>{risk.label}</div>
                </div>

                <div className="np-breakdown">
                  <div><span>{t('stickerTuition')}</span><span>${netEst.tuition.toLocaleString()}</span></div>
                  <div><span>{t('grantAidEst')}</span><span>−${netEst.aidOffered.toLocaleString()}</span></div>
                  <div><span>{t('roomBoard')}</span><span>${netEst.roomBoard.toLocaleString()}</span></div>
                </div>

                <p className="np-disclaimer">{t('netPriceDisclaimer')}</p>
              </div>
            )}
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

          {/* Peer Colleges — 一鍵直接對比 */}
          {peerList.length > 0 && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>{t('similarPeers')}</div>
              <div className="peer-buttons">
                {peerList.map(peer => (
                  <button
                    key={peer.id}
                    className="peer-btn"
                    onClick={() => onAddToCompare && onAddToCompare(peer.id)}
                    title={t('addToCompareHint')}
                  >
                    <span className="peer-name">{peer.shortName || peer.name}</span>
                    <PlusCircle size={14} className="peer-plus" />
                    <span className="peer-add-label">{t('compareBtn')}</span>
                  </button>
                ))}
              </div>
              <p className="peer-hint">{t('addToCompareHint')} → {t('savedCompare')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}