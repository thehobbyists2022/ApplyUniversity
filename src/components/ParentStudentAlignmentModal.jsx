import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Sparkles, Users, Wallet, DollarSign, TrendingUp, MapPin, Scale, Check, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { COLLEGES } from '../data/colleges';
import { FLAGSHIP_COLLEGE_IDS } from '../data/flagshipColleges';
import { getTranslation } from '../utils/i18n';
import { buildAlignmentReport, formatMoney } from '../utils/alignmentEngine';

const REGIONS = ['All', 'West Coast', 'East Coast', 'Midwest', 'South', 'New England', 'Pacific NW'];
const BUDGETS = [
  { value: 25000, label: '$25k' },
  { value: 45000, label: '$45k' },
  { value: 65000, label: '$65k' },
  { value: 85000, label: '$85k+' }
];
const RATING_VALUES = [1, 2, 3, 4, 5];

const STATUS_KEY = { high: 'alignmentStatusHigh', alignment: 'alignmentStatusAlignment', highRisk: 'alignmentStatusHighRisk' };

export default function ParentStudentAlignmentModal({ isOpen, onClose, lang, savedIds }) {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState({
    preferredRegion: 'All',
    vibeImportance: 3,
    locationImportance: 3,
    maxBudget: 65000,
    rankImportance: 4,
    roiImportance: 4
  });
  const [report, setReport] = useState(null);

  if (!isOpen) return null;
  const t = (k, vars) => getTranslation(lang, k, vars);

  // 優先取已收藏 2–4 所; 不足 2 所時以旗艦校補足 (避免全空)
  const targetColleges = useMemo(() => {
    const saved = COLLEGES.filter(c => savedIds && savedIds.includes(c.id));
    const result = [...saved];
    if (result.length < 2) {
      for (const c of COLLEGES) {
        if (FLAGSHIP_COLLEGE_IDS.has(c.id) && !result.some(x => x.id === c.id)) {
          result.push(c);
          if (result.length >= 3) break;
        }
      }
    }
    return result.slice(0, 4);
  }, [savedIds]);

  const usingDefaults = !(savedIds && savedIds.length >= 2);

  const setPref = (key, val) => setPrefs(prev => ({ ...prev, [key]: val }));

  const handleGenerate = () => {
    setReport(buildAlignmentReport(
      targetColleges,
      { preferredRegion: prefs.preferredRegion, vibeImportance: prefs.vibeImportance, locationImportance: prefs.locationImportance },
      { maxBudget: prefs.maxBudget, rankImportance: prefs.rankImportance, roiImportance: prefs.roiImportance }
    ));
    setStep(2);
  };

  const handleReset = () => {
    setStep(1);
    setReport(null);
  };

  const renderRating = (label, hint, value, onChange) => (
    <div className="align-field">
      <div className="align-label-row">
        <span className="align-label">{label}</span>
        <span className="align-rating-note">
          {value <= 2 ? t('alignmentRatingLow') : value >= 4 ? t('alignmentRatingHigh') : '·'}
        </span>
      </div>
      <p className="align-hint">{hint}</p>
      <div className="align-rating">
        {RATING_VALUES.map(n => (
          <button
            key={n}
            type="button"
            className={`align-rating-btn ${value === n ? 'active' : ''}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  const overallTone = report ? (report.overall >= 75 ? 'good' : report.overall >= 50 ? 'warn' : 'bad') : 'good';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card alignment-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
          <div className="align-kicker"><Users size={13} /><span>{t('alignmentKicker')}</span></div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.45rem' }}>{t('alignmentTitle')}</h2>
          <p className="align-subtitle">{t('alignmentSubtitle')}</p>
        </div>

        <div className="modal-body align-body">
          {/* 步驟指示器 */}
          <div className="align-steps">
            <div className={`align-step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
              <span className="align-step-dot">{step > 1 ? <Check size={12} /> : 1}</span>
              <span className="align-step-name">{t('alignmentStepPrefs')}</span>
            </div>
            <div className={`align-step-item ${step === 2 ? 'active' : ''}`}>
              <span className="align-step-dot">2</span>
              <span className="align-step-name">{t('alignmentStepReport')}</span>
            </div>
          </div>

          {/* 步驟 1: 家庭偏好參數設定 */}
          {step === 1 && (
            <div className="align-step-panel">
              {usingDefaults && (
                <div className="align-note"><Sparkles size={14} /><span>{t('alignmentNoteDefaults')}</span></div>
              )}

              <div className="align-pref-grid">
                {/* 左欄: 學生視角 */}
                <div className="align-panel student">
                  <div className="align-panel-title">
                    <span className="align-panel-emoji">🎓</span>
                    <div>
                      <span className="align-panel-name">{t('alignmentStudentPerspective')}</span>
                      <span className="align-panel-sub">{t('alignmentAnalyzingCount', { count: targetColleges.length })}</span>
                    </div>
                  </div>

                  <div className="align-field">
                    <span className="align-label">{t('alignmentPreferredRegion')}</span>
                    <select
                      className="align-select"
                      value={prefs.preferredRegion}
                      onChange={(e) => setPref('preferredRegion', e.target.value)}
                    >
                      {REGIONS.map(r => (
                        <option key={r} value={r}>{r === 'All' ? '🌎 Any Region' : r}</option>
                      ))}
                    </select>
                  </div>

                  {renderRating(t('alignmentVibeImportance'), t('alignmentVibeImportanceHint'), prefs.vibeImportance, v => setPref('vibeImportance', v))}
                  {renderRating(t('alignmentLocationImportance'), t('alignmentLocationImportanceHint'), prefs.locationImportance, v => setPref('locationImportance', v))}
                </div>

                {/* 右欄: 家長視角 */}
                <div className="align-panel parent">
                  <div className="align-panel-title">
                    <span className="align-panel-emoji">👨‍👩‍👧</span>
                    <div>
                      <span className="align-panel-name">{t('alignmentParentPerspective')}</span>
                      <span className="align-panel-sub">{t('alignmentMaxBudgetHint')}</span>
                    </div>
                  </div>

                  <div className="align-field">
                    <div className="align-label-row">
                      <span className="align-label">{t('alignmentMaxBudget')}</span>
                      <span className="align-budget-val">{formatMoney(prefs.maxBudget)}</span>
                    </div>
                    <div className="align-budget">
                      {BUDGETS.map(b => (
                        <button
                          key={b.value}
                          type="button"
                          className={`align-budget-btn ${prefs.maxBudget === b.value ? 'active' : ''}`}
                          onClick={() => setPref('maxBudget', b.value)}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {renderRating(t('alignmentRankImportance'), t('alignmentRankImportanceHint'), prefs.rankImportance, v => setPref('rankImportance', v))}
                  {renderRating(t('alignmentRoiImportance'), t('alignmentRoiImportanceHint'), prefs.roiImportance, v => setPref('roiImportance', v))}
                </div>
              </div>

              <p className="align-legend">{t('alignmentLegend')}</p>
            </div>
          )}

          {/* 步驟 2: 家庭選校對齊報告 */}
          {step === 2 && report && (
            <div className="align-report">
              {/* 總體共識指數 */}
              <div className="align-overall">
                <div className="align-overall-score">
                  <div className="align-overall-num">{report.overall}%</div>
                  <div className="align-overall-label">{t('alignmentFamilyAlignment')}</div>
                  <div className={`align-overall-meter ${overallTone}`}>
                    <span style={{ width: `${report.overall}%` }} />
                  </div>
                  <div className="align-overall-sub">{t('alignmentConsensusAverage', { count: report.results.length })}</div>
                </div>
                <div className="align-overall-chips">
                  <span className="align-chip high">{t('alignmentHighCount', { count: report.counts.high })}</span>
                  <span className="align-chip alignment">{t('alignmentAlignmentCount', { count: report.counts.alignment })}</span>
                  <span className="align-chip risk">{t('alignmentRiskCount', { count: report.counts.highRisk })}</span>
                </div>
              </div>

              {/* 逐校診斷 */}
              <div className="align-schools">
                {report.results.map(r => (
                  <div key={r.college.id} className={`align-school-card ${r.status}`}>
                    <div className="align-school-head">
                      <div className="align-school-id">
                        <span className="align-school-emoji">{r.emoji}</span>
                        <div>
                          <div className="align-school-name">{r.college.name}</div>
                          <div className="align-school-meta">
                            <MapPin size={11} style={{ verticalAlign: '-1px' }} />{' '}
                            {r.college.type} • {t('acceptance')}: {r.college.acceptanceRate} •{' '}
                            {r.college.ranking && r.college.ranking !== '—' ? `${r.college.ranking} • ` : ''}
                            {r.college.location.city}, {r.college.location.state} ({r.college.location.region})
                          </div>
                        </div>
                      </div>
                      <span className={`align-status-badge ${r.status}`}>{r.emoji} {t(STATUS_KEY[r.status])}</span>
                    </div>

                    {/* 學生 vs 家長 對比條 */}
                    <div className="align-score-compare">
                      <div className="align-score-line">
                        <span className="align-score-label">🎓 {t('alignmentStudentScore')}</span>
                        <div className="align-score-track"><span className="align-score-fill student" style={{ width: `${r.studentScore}%` }} /></div>
                        <span className="align-score-val">{r.studentScore}</span>
                      </div>
                      <div className="align-score-line">
                        <span className="align-score-label">👨‍👩‍👧 {t('alignmentParentScore')}</span>
                        <div className="align-score-track"><span className="align-score-fill parent" style={{ width: `${r.parentScore}%` }} /></div>
                        <span className="align-score-val">{r.parentScore}</span>
                      </div>
                      <div className={`align-score-gap ${r.gap > 35 ? 'danger' : r.gap >= 20 ? 'warn' : ''}`}>
                        <Scale size={13} /> {t('alignmentScoreGap', { gap: r.gap })}
                      </div>
                    </div>

                    {/* 財務安全 + 共識 */}
                    <div className="align-school-foot">
                      <div className="align-finance">
                        <div className="align-finance-item">
                          <Wallet size={14} />
                          <div>
                            <div className="align-finance-label">{t('alignmentEstAnnualCost')}</div>
                            <div className="align-finance-val">{formatMoney(r.annualCost)}</div>
                          </div>
                        </div>
                        <div className="align-finance-item">
                          <DollarSign size={14} />
                          <div>
                            <div className="align-finance-label">{t('alignmentBudgetCap')}</div>
                            <div className="align-finance-val">{formatMoney(report.maxBudget)}</div>
                          </div>
                        </div>
                        <div className={`align-budget-state ${r.overBudget ? 'over' : 'ok'}`}>
                          {r.overBudget ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                          <span>
                            {r.overBudget
                              ? t('alignmentOverBudget', { amount: formatMoney(r.overage) })
                              : t('alignmentWithinBudget')}
                          </span>
                        </div>
                      </div>
                      <div className="align-consensus">
                        <span className="align-consensus-label">{t('alignmentConsensusLabel')}</span>
                        <span className="align-consensus-val">{r.consensus}</span>
                      </div>
                    </div>

                    <div className="align-roi">
                      <TrendingUp size={14} />
                      <span>{t('roiGrade')}: {r.roiGrade} · {t('medianStartingSalary')}: {r.salaryRange}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 家庭溝通行動建議 */}
              <div className="align-checklist">
                <div className="align-checklist-title">
                  <CheckCircle2 size={16} />
                  <span>{t('alignmentChecklist')}</span>
                  <span className="align-checklist-hint">{t('alignmentChecklistHint')}</span>
                </div>
                <ul className="align-advice-list">
                  {report.advice.map((a, i) => (
                    <li key={i} className={`align-advice-item ${a.tone}`}>
                      <span className="align-advice-bullet">
                        {a.tone === 'good' ? '✅' : a.tone === 'danger' ? '🚨' : '💬'}
                      </span>
                      <span>{t(a.key, a.vars)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 底部導航 */}
          <div className="align-nav">
            {step > 1 ? (
              <button className="align-nav-btn" onClick={() => setStep(1)}>
                <ChevronLeft size={16} /> {t('alignmentBack')}
              </button>
            ) : <span />}

            {step === 1 ? (
              <button className="align-nav-btn primary" onClick={handleGenerate}>
                <Sparkles size={15} /> {t('alignmentGenerateReport')} <ChevronRight size={16} />
              </button>
            ) : (
              <div className="align-nav-right">
                <button className="align-nav-btn" onClick={handleReset}>
                  <RotateCcw size={15} /> {t('alignmentReRun')}
                </button>
                <button className="align-nav-btn primary" onClick={onClose}>
                  <Check size={15} /> {t('alignmentDone')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}