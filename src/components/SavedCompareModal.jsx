import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Heart, MapPin, DollarSign, Award, Trash2 } from 'lucide-react';
import { COLLEGES } from '../data/colleges';
import { getTranslation } from '../utils/i18n';

export default function SavedCompareModal({ isOpen, onClose, savedIds, onRemoveSave, lang }) {
  if (!isOpen) return null;
  const t = (k, vars) => getTranslation(lang, k, vars);

  const savedColleges = COLLEGES.filter(c => savedIds.includes(c.id));

  const handlePrint = () => {
    window.print();
  };

  const reportDate = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 列印專用品牌報告 (portal 到 body, 於 @media print 單獨顯示)
  const printReport = savedColleges.length > 0 && createPortal(
    <div className="print-report">
      <div className="print-band">
        <div className="print-brand">
          <span className="print-brand-emoji">🎓</span>
          <span>StepOne College</span>
          <span className="print-kicker">{t('printReportKicker')}</span>
        </div>
        <div className="print-domain">{t('printDomain')}</div>
      </div>

      <div className="print-head">
        <h1 className="print-title">{t('printReportTitle')}</h1>
        <p className="print-meta">
          {t('printGeneratedOn', { date: reportDate })} · {t('printCollegesLabel', { count: savedColleges.length })}
        </p>
      </div>

      <div className="print-shortlist">
        <div className="print-shortlist-title">{t('printShortlist')}</div>
        <div className="print-shortlist-grid">
          {savedColleges.map(c => (
            <div className="print-shortlist-item" key={c.id}>
              <span className="print-rank">{c.ranking && c.ranking !== '—' ? c.ranking : 'NR'}</span>
              <div>
                <div className="print-shortlist-name">{c.name}</div>
                <div className="print-shortlist-meta">{c.type} · {c.acceptanceRate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <table className="print-matrix">
        <thead>
          <tr>
            <th>{t('colCollege')}</th>
            <th>{t('colLocation')}</th>
            <th>{t('colType')}</th>
            <th>{t('colAcceptance')}</th>
            <th>{t('colRanking')}</th>
            <th>{t('colTuition')}</th>
          </tr>
        </thead>
        <tbody>
          {savedColleges.map(c => (
            <tr key={c.id}>
              <td className="print-cell-name">{c.name}</td>
              <td>{c.location.city}, {c.location.state} ({c.location.setting})</td>
              <td>{c.type}</td>
              <td>{c.acceptanceRate}</td>
              <td>{c.ranking}</td>
              <td>{c.tuitionOutState}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-foot">
        <span>{t('printReportFooter')}</span>
        <span>{t('printDomain')}</span>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      {printReport}
      <div className="modal-card" style={{ maxWidth: '900px', width: '95%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingRight: '2rem' }}>
            <div>
              <div style={{ color: '#b45309', fontWeight: 800, fontSize: '0.825rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Heart size={15} fill="#b45309" /> {t('savedList')} ({savedColleges.length})
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('compareMatrix')}</h2>
            </div>

            {savedColleges.length > 0 && (
              <button
                onClick={handlePrint}
                className="detail-btn"
                style={{ background: '#0f172a', color: '#ffffff', padding: '0.5rem 1rem' }}
              >
                <Printer size={16} />
                <span>{t('printPdf')}</span>
              </button>
            )}
          </div>
        </div>

        <div className="modal-body">
          {savedColleges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Heart size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#64748b' }}>{t('savedEmpty')}</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.35rem' }}>{t('savedEmptyHint')}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc' }}>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>{t('colCollege')}</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>{t('colLocation')}</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>{t('colAcceptance')}</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>{t('colRanking')}</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>{t('colTuition')}</th>
                    <th style={{ padding: '0.75rem', fontWeight: 800, color: '#475569' }}>{t('colAction')}</th>
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