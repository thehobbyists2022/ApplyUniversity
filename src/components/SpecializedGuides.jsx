import React, { useState } from 'react';
import { Trophy, DollarSign, Award, CheckCircle, ExternalLink, ShieldAlert, GraduationCap, Video, Send, FileText } from 'lucide-react';
import { ATHLETIC_GUIDE, SCHOLARSHIP_GUIDE } from '../data/specializedGuides';
import { getTranslation } from '../utils/i18n';

export default function SpecializedGuides({ lang }) {
  const [activeGuideTab, setActiveGuideTab] = useState('scholarships');
  const t = (k) => getTranslation(lang, k);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Guide Switcher Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: '20px',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ background: '#f59e0b', color: '#0f172a', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800 }}>
            {t('essentialGuides')}
          </span>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('guidesTitle')}</h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.35rem', maxWidth: '680px' }}>
          {t('guidesDesc')}
        </p>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`chip-btn ${activeGuideTab === 'scholarships' ? 'active' : ''}`}
            onClick={() => setActiveGuideTab('scholarships')}
            style={{
              padding: '0.75rem 1.4rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              background: activeGuideTab === 'scholarships' ? '#4f46e5' : 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: activeGuideTab === 'scholarships' ? 'none' : '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <DollarSign size={18} style={{ marginRight: '0.4rem' }} />
            <span>{t('scholarships')}</span>
          </button>

          <button 
            className={`chip-btn ${activeGuideTab === 'athletics' ? 'active' : ''}`}
            onClick={() => setActiveGuideTab('athletics')}
            style={{
              padding: '0.75rem 1.4rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              background: activeGuideTab === 'athletics' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
              color: activeGuideTab === 'athletics' ? '#0f172a' : '#ffffff',
              border: activeGuideTab === 'athletics' ? 'none' : '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Trophy size={18} style={{ marginRight: '0.4rem' }} />
            <span>{t('athleticRecruiting')}</span>
          </button>
        </div>
      </div>

      {/* SCHOLARSHIPS & FINANCIAL AID VIEW */}
      {activeGuideTab === 'scholarships' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Aid Types Overview */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap color="#4f46e5" size={24} /> {t('financialAidTypes')}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {t('financialAidDesc')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
              {SCHOLARSHIP_GUIDE.aidTypes.map((aid, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{aid.type}</div>
                    <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {aid.form}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700, marginBottom: '0.5rem' }}>Source: {aid.source}</div>
                  <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, marginBottom: aid.url ? '0.75rem' : '0' }}>{aid.description}</p>
                  
                  {aid.url && (
                    <a href={aid.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', textDecoration: 'none' }}>
                      <span>{t('openOfficialPortal')}</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Deadlines & Platforms */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Deadlines */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={20} /> {t('aidDeadlines')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {SCHOLARSHIP_GUIDE.keyDeadlines.map((dl, i) => (
                  <div key={i} style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#14532d' }}>{dl.name}</div>
                      <div style={{ fontSize: '0.825rem', color: '#15803d', fontWeight: 800, marginTop: '0.15rem' }}>Target: {dl.date}</div>
                    </div>
                    {dl.url && (
                      <a href={dl.url} target="_blank" rel="noopener noreferrer" style={{ color: '#166534', padding: '0.3rem' }}>
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Free Scholarship Search Engines */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award color="#f59e0b" size={20} /> {t('scholarshipSearch')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {SCHOLARSHIP_GUIDE.scholarshipPlatforms.map((p, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{p.name}</div>
                      <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.15rem' }}>{p.desc}</div>
                    </div>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', padding: '0.35rem', background: '#e0e7ff', borderRadius: '6px' }}>
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATHLETIC RECRUITING VIEW */}
      {activeGuideTab === 'athletics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Division Comparison */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy color="#f59e0b" size={24} /> {t('ncaaDivisions')}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {t('ncaaDivisionsDesc')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {ATHLETIC_GUIDE.divisions.map((div, i) => (
                <div key={i} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>{div.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 800, background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.5rem' }}>
                    🏆 {div.scholarships}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.75rem', lineHeight: 1.5 }}>{div.description}</p>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Weekly Time Commitment: {div.commitment}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 6 Step Recruiting Roadmap */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send color="#4f46e5" size={22} /> {t('recruitingRoadmap')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ATHLETIC_GUIDE.recruitingSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#4f46e5', color: '#ffffff', fontWeight: 800, fontSize: '0.9rem', width: '32px', height: '32px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{step.step}</div>
                      <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.5 }}>{step.details}</div>
                    </div>
                  </div>
                  {step.url && (
                    <a href={step.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', background: '#e0e7ff', padding: '0.4rem 0.75rem', borderRadius: '6px', textDecoration: 'none', flexShrink: 0 }}>
                      <span>{t('officialLink')}</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
