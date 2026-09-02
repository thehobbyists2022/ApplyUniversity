import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, RotateCcw, Award, Compass, MapPin } from 'lucide-react';
import { MAJORS } from '../data/majors';
import { FLAGSHIP_COLLEGE_IDS } from '../data/flagshipColleges';
import { getTranslation } from '../utils/i18n';

export default function SmartMatchQuizModal({ isOpen, onClose, onApplyMatchFilters, lang, collegesData = [] }) {
  const COLLEGES = collegesData;
  const [step, setStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedField, setSelectedField] = useState('All');
  const [selectedSetting, setSelectedSetting] = useState('All');
  const [results, setResults] = useState(null);

  if (!isOpen) return null;

  const t = (k) => getTranslation(lang, k);

  const handleCalculateMatch = () => {
    // Filter matching colleges
    const matchedColleges = COLLEGES.filter(col => {
      const matchReg = selectedRegion === 'All' || col.location.region === selectedRegion;
      const matchSet = selectedSetting === 'All' || col.location.setting === selectedSetting;
      return matchReg && matchSet;
    });

    // 優先排序: 旗艦/名校在前, 其餘在後; 各組內依接受率(越高越好)或保留原順序
    const isFlagship = (col) => FLAGSHIP_COLLEGE_IDS.has(col.id);
    const ranked = [...matchedColleges].sort((a, b) => {
      const fa = isFlagship(a) ? 1 : 0;
      const fb = isFlagship(b) ? 1 : 0;
      if (fa !== fb) return fb - fa; // 旗艦優先
      return 0;
    });

    // Filter matching majors
    const matchedMajors = MAJORS.filter(m => {
      return selectedField === 'All' || m.category === selectedField;
    });

    setResults({
      colleges: ranked.slice(0, 4),
      majors: matchedMajors.slice(0, 3)
    });

    setStep(4); // Results step
  };

  const handleReset = () => {
    setStep(1);
    setSelectedRegion('All');
    setSelectedField('All');
    setSelectedSetting('All');
    setResults(null);
  };

  const handleApplyToApp = () => {
    onApplyMatchFilters({
      region: selectedRegion,
      setting: selectedSetting,
      field: selectedField
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4f46e5', fontWeight: 800, fontSize: '0.825rem', textTransform: 'uppercase' }}>
            <Sparkles size={16} /> {t('quizTitle')}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('quizSubtitle')}</h2>
        </div>

        <div className="modal-body">
          {/* STEP 1: Region Preference */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem' }}>{t('step1Of3')}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>{t('qRegion')}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {['All', 'West Coast', 'East Coast', 'Midwest', 'South', 'New England', 'Pacific NW'].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: selectedRegion === r ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      background: selectedRegion === r ? '#e0e7ff' : '#f8fafc',
                      color: selectedRegion === r ? '#4338ca' : '#0f172a',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontSize: '0.9rem'
                    }}
                  >
                    {r === 'All' ? '🌎 Any Region' : r}
                  </button>
                ))}
              </div>

              <button className="detail-btn" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} onClick={() => setStep(2)}>
                <span>{t('nextAcademic')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: Field Interest */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem' }}>{t('step2Of3')}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>{t('qField')}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Any Discipline', val: 'All' },
                  { label: '💻 STEM & Tech', val: 'STEM & Tech' },
                  { label: '📈 Business & Finance', val: 'Business & Management' },
                  { label: '🩺 Healthcare & Pre-Med', val: 'Healthcare & Life Sciences' },
                  { label: '⚖️ Law & Social Sciences', val: 'Law, Policy & Social Sciences' },
                  { label: '🎨 Arts & UX Design', val: 'Arts, Humanities & Design' }
                ].map(f => (
                  <button
                    key={f.val}
                    onClick={() => setSelectedField(f.val)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: selectedField === f.val ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      background: selectedField === f.val ? '#e0e7ff' : '#f8fafc',
                      color: selectedField === f.val ? '#4338ca' : '#0f172a',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontSize: '0.875rem'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="chip-btn" onClick={() => setStep(1)}>{t('back')}</button>
                <button className="detail-btn" style={{ flex: 1, justifyContent: 'center', padding: '0.8rem' }} onClick={() => setStep(3)}>
                  <span>{t('nextCampus')}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Campus Setting */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem' }}>{t('step3Of3')}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>{t('qSetting')}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: '🏛️ Any Setting', val: 'All' },
                  { label: '🏙️ Urban City Campus', val: 'Urban' },
                  { label: '🌳 Suburban Oasis', val: 'Suburban' },
                  { label: '🎓 Classic College Town', val: 'College Town' }
                ].map(s => (
                  <button
                    key={s.val}
                    onClick={() => setSelectedSetting(s.val)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: selectedSetting === s.val ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      background: selectedSetting === s.val ? '#e0e7ff' : '#f8fafc',
                      color: selectedSetting === s.val ? '#4338ca' : '#0f172a',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontSize: '0.9rem'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="chip-btn" onClick={() => setStep(2)}>{t('back')}</button>
                <button className="detail-btn" style={{ flex: 1, justifyContent: 'center', padding: '0.8rem', background: '#16a34a', color: '#ffffff' }} onClick={handleCalculateMatch}>
                  <Sparkles size={16} />
                  <span>{t('generateResults')}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Results */}
          {step === 4 && results && (
            <div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <h4 style={{ color: '#166534', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{t('resultsTitle')}</h4>
                <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                  {t('basedOn')}: {selectedRegion === 'All' ? t('all') : selectedRegion} • {selectedField === 'All' ? t('all') : selectedField} • {selectedSetting === 'All' ? t('all') : selectedSetting}
                </p>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>{t('topMatchingUnis')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {results.colleges.map(c => (
                  <div key={c.id} style={{ background: '#ffffff', border: FLAGSHIP_COLLEGE_IDS.has(c.id) ? '2px solid #f59e0b' : '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      {FLAGSHIP_COLLEGE_IDS.has(c.id) && <span style={{ marginRight: '0.25rem' }}>⭐</span>}
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.location.city}, {c.location.state} • {c.acceptanceRate}</div>
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>{t('recommendedMajors')}</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {results.majors.map(m => (
                  <span key={m.id} style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 700, padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                    🎯 {m.name}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="chip-btn" onClick={handleReset}>
                  <RotateCcw size={14} style={{ marginRight: '0.3rem' }} /> {t('resetQuiz')}
                </button>
                <button className="detail-btn" style={{ flex: 1, justifyContent: 'center', padding: '0.8rem' }} onClick={handleApplyToApp}>
                  <span>{t('applyFilters')}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
