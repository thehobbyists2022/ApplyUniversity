import React from 'react';
import { X, Briefcase, BookOpen, Award, DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function MajorDetailModal({ major, onClose, collegesMap, lang }) {
  if (!major) return null;
  const t = (k) => getTranslation(lang, k);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
            {major.category}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{major.name}</h2>
          <p style={{ fontSize: '0.925rem', color: '#64748b', marginTop: '0.35rem' }}>
            {major.description}
          </p>
        </div>

        <div className="modal-body">
          {/* Salary & Job Growth Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #bbf7d0'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>{t('startingSalaryRange')}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#14532d' }}>{major.avgStartingSalary}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>{t('projectedJobGrowth')}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <TrendingUp size={18} /> {major.growthRate}
              </div>
            </div>
          </div>

          {/* Career Paths Breakdown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <Briefcase size={18} color="#4f46e5" /> {t('topCareerPaths')}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {major.careerPaths.map((career, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{career.title}</div>
                  <div style={{ fontSize: '0.825rem', color: '#4f46e5', fontWeight: 700, marginTop: '0.15rem' }}>
                    Avg {career.avgSalary}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typical College Coursework */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <BookOpen size={18} color="#4f46e5" /> {t('coreCoursework')}
            </h4>
            <div className="coursework-list">
              {major.coursework.map((course, idx) => (
                <span key={idx} className="course-chip" style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 600, padding: '0.35rem 0.75rem' }}>
                  {course}
                </span>
              ))}
            </div>
          </div>

          {/* Top Renowned Universities for this Major */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={18} color="#f59e0b" /> Renowned US Colleges for {major.name}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {major.topColleges.map((colId) => {
                const col = collegesMap[colId];
                return (
                  <span key={colId} style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    🎓 {col ? col.name : colId.toUpperCase()}
                  </span>
                );
              })}
            </div>
          </div>

          {/* StepOne Career Bridge Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('futureCareerAssistant')}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '0.15rem' }}>
                {getTranslation(lang, 'careerAssistantIn', { major: major.name })}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#c7d2fe', marginTop: '0.15rem' }}>
                {t('careerAssistantDesc')}
              </div>
            </div>
            <a 
              href={`https://steponecareer.com/?search=${encodeURIComponent(major.name)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="major-career-link"
              style={{ alignSelf: 'flex-end', width: 'auto', marginTop: 0 }}
            >
              🚀 <span>{t('exploreMajorCareers')}</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
