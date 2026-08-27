import React, { useMemo } from 'react';
import { MapPin, Heart, ArrowRight, Users, PlusCircle } from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { computeRoiGrade, estimateSalaryRange, formatSalaryRange, findPeerColleges } from '../utils/collegeFinance';

export default function CollegeCard({ college, isSaved, onToggleSave, onViewDetails, lang, onAddToCompare }) {
  const t = (k) => getTranslation(lang, k);

  const roiGrade = useMemo(() => computeRoiGrade(college), [college]);
  const salaryRange = useMemo(() => formatSalaryRange(estimateSalaryRange(college)), [college]);
  const peers = useMemo(() => findPeerColleges(college, 3), [college]);

  return (
    <div className="college-card">
      <div className="card-header">
        <div>
          <h3 className="college-name">{college.name}</h3>
          <div className="college-location">
            <MapPin size={15} />
            <span>{college.location.city}, {college.location.state} • {college.location.region} ({college.location.setting})</span>
          </div>
        </div>
        <button 
          className={`fav-btn ${isSaved ? 'active' : ''}`}
          onClick={() => onToggleSave(college.id)}
          title={isSaved ? "Remove from saved" : "Save college"}
        >
          <Heart size={20} fill={isSaved ? "#ef4444" : "none"} />
        </button>
      </div>

      <div className="badge-row">
        <span className="badge badge-type">{college.type}</span>
        <span className="badge badge-rate">{t('acceptance')}: {college.acceptanceRate}</span>
        {college.ranking && college.ranking !== '—' && (
          <span className="badge badge-rank">{college.ranking}</span>
        )}
      </div>

      {/* ROI 性價比與起薪指標 */}
      <div className="badge-row roi-row">
        <span className={`badge roi-badge roi-grade roi-grade-${roiGrade.toLowerCase().replace('+', 'plus')}`}>
          🎓 {t('roiGrade')}: {roiGrade}
        </span>
        <span className="badge roi-badge roi-salary">
          💼 {t('medianStartingSalary')}: {salaryRange}
        </span>
      </div>

      <div className="badge-row">
        <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
          <Users size={12} style={{ verticalAlign: '-1px', marginRight: '3px' }} />{college.undergradsCount} {t('undergrads')}
        </span>
        <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
          {t('inState')} {college.tuitionInState}
        </span>
      </div>

      {/* 相似學校 — 一鍵加入對比 */}
      {peers.length > 0 && (
        <div className="card-peers">
          <span className="card-peer-label">{t('similarPeers')}:</span>
          {peers.map(peer => (
            <button
              key={peer.id}
              className="peer-chip"
              onClick={() => onAddToCompare && onAddToCompare(peer.id)}
              title={t('addToCompareHint')}
            >
              <PlusCircle size={12} />
              {peer.shortName || peer.name}
            </button>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="tuition-info">
          <div>{t('outOfStatePrivate')}</div>
          <div className="tuition-val">{college.tuitionOutState} / year</div>
        </div>
        <button className="detail-btn" onClick={() => onViewDetails(college)}>
          <span>{t('viewDetails')}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}