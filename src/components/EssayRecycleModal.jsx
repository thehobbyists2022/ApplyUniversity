import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Check, FileText, Sparkles } from 'lucide-react';
import { COLLEGES } from '../data/colleges';
import { getTranslation } from '../utils/i18n';
import { ESSAY_TOPICS, buildRecycleMatrix, getReuseLevel, findTopRecyclePick } from '../utils/essayMatcher';

export default function EssayRecycleModal({ isOpen, onClose, lang, savedIds }) {
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => [...(savedIds || [])]);
  const [writtenIds, setWrittenIds] = useState(() => new Set());

  if (!isOpen) return null;

  const t = (k, vars) => getTranslation(lang, k, vars);

  const savedColleges = COLLEGES.filter(c => savedIds && savedIds.includes(c.id));
  const selectedColleges = COLLEGES.filter(c => selectedIds.includes(c.id));

  if (savedColleges.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card essay-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
            <div className="essay-kicker"><FileText size={13} /><span>{t('essayKicker')}</span></div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.45rem' }}>{t('essayTitle')}</h2>
          </div>
          <div className="modal-body">
            <div className="essay-empty">
              <FileText size={34} />
              <h3>{t('noSavedColleges')}</h3>
              <p>{t('noSavedCollegesHint')}</p>
              <button className="essay-submit" onClick={onClose}>{t('backToExplore')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleSelected = (id) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleWritten = (id) => {
    setWrittenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rows = buildRecycleMatrix(selectedColleges, [...writtenIds]);
  const topPick = findTopRecyclePick(rows);
  const totalReusable = rows.reduce((sum, r) => sum + Math.max(0, r.recycleCount - (r.written ? 1 : 0)), 0);
  const draftCoverCount = rows.reduce((sum, r) => (r.written ? sum + r.recycleCount : sum), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card essay-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
          <div className="essay-kicker"><FileText size={13} /><span>{t('essayKicker')}</span></div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.45rem' }}>{t('essayTitle')}</h2>
          <p className="essay-subtitle">{t('essaySubtitle')}</p>
        </div>

        <div className="modal-body essay-body">
          {/* 步驟指示器 */}
          <div className="essay-steps">
            {[1, 2, 3].map(n => (
              <div key={n} className={`essay-step-item ${step === n ? 'active' : ''} ${step > n ? 'done' : ''}`}>
                <span className="essay-step-dot">{step > n ? <Check size={12} /> : n}</span>
                <span className="essay-step-name">{n === 1 ? t('essaySelectSchools') : n === 2 ? t('essayWrittenDrafts') : t('essayMatrix')}</span>
              </div>
            ))}
          </div>

          {/* Step 1: 選擇學校 */}
          {step === 1 && (
            <div className="essay-step-panel">
              <p className="essay-hint">{t('essaySelectSchoolsHint')}</p>
              <div className="essay-school-grid">
                {savedColleges.map(c => (
                  <button
                    key={c.id}
                    className={`essay-school-card ${selectedIds.includes(c.id) ? 'active' : ''}`}
                    onClick={() => toggleSelected(c.id)}
                  >
                    <span className="essay-school-check">{selectedIds.includes(c.id) ? <Check size={14} /> : null}</span>
                    <span className="essay-school-name">{c.shortName || c.name}</span>
                    <span className="essay-school-meta">{c.type} • {c.acceptanceRate}</span>
                  </button>
                ))}
              </div>
              <p className="essay-count-note">{t('essaySelectedCount', { count: selectedIds.length })}</p>
            </div>
          )}

          {/* Step 2: 勾選已有文書 */}
          {step === 2 && (
            <div className="essay-step-panel">
              <p className="essay-hint">{t('essayWrittenDraftsHint')}</p>
              <div className="essay-written-grid">
                {ESSAY_TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    className={`essay-written-chip ${writtenIds.has(topic.id) ? 'active' : ''}`}
                    onClick={() => toggleWritten(topic.id)}
                  >
                    <span className="essay-written-check">{writtenIds.has(topic.id) ? <Check size={13} /> : null}</span>
                    <span className="essay-written-label">{topic.label}</span>
                    {topic.keywords.length > 0 && (
                      <span className="essay-written-keywords">#{topic.keywords.join(' #')}</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="essay-count-note">{t('essayWrittenCount', { count: writtenIds.size })}</p>
            </div>
          )}

          {/* Step 3: 回收矩陣 */}
          {step === 3 && (
            <div className="essay-step-panel">
              <p className="essay-hint">{t('essayMatrixHint')}</p>

              {topPick && (
                <div className="essay-top-pick">
                  <Sparkles size={16} />
                  <span>
                    <strong>{t('topPick')}:</strong>{' '}
                    {t('writeOneReuse', { topic: topPick.label, count: topPick.recycleCount })}
                  </span>
                </div>
              )}

              <div className="essay-stat-row">
                <div className="essay-stat">
                  <div className="essay-stat-num">{draftCoverCount}</div>
                  <div className="essay-stat-label">{t('essayStatDraftCover')}</div>
                </div>
                <div className="essay-stat">
                  <div className="essay-stat-num">{totalReusable}</div>
                  <div className="essay-stat-label">{t('essayStatReuseSave')}</div>
                </div>
              </div>

              <div className="essay-matrix-wrap">
                <table className="essay-matrix">
                  <thead>
                    <tr>
                      <th className="essay-th-topic">{t('colTopic')}</th>
                      <th className="essay-th-draft">{t('colHaveDraft')}</th>
                      {selectedColleges.map(c => (
                        <th key={c.id}>{c.shortName || c.name}</th>
                      ))}
                      <th className="essay-th-reuse">{t('colReuse')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id} className={row.recycleCount >= 2 ? 'reusable' : ''}>
                        <td className="essay-topic-cell">
                          <div className="essay-topic-label">{row.label}</div>
                          {row.keywords.length > 0 && (
                            <div className="essay-topic-keywords">#{row.keywords.join(' #')}</div>
                          )}
                        </td>
                        <td className="essay-draft-cell">
                          {row.written ? (
                            <span className="essay-has-draft"><Check size={12} /> {t('cellHasDraft')}</span>
                          ) : (
                            <span className="essay-need-draft">{t('cellNeedDraft')}</span>
                          )}
                        </td>
                        {row.cells.map((cell, i) => (
                          <td key={i} className="essay-score-cell">
                            <span className={`essay-score essay-score-${getReuseLevel(cell.likelihood)}`}>
                              {cell.likelihood}
                            </span>
                          </td>
                        ))}
                        <td className="essay-reuse-cell">
                          <span className={`essay-reuse-count ${row.recycleCount >= 2 ? 'hot' : ''}`}>
                            ×{row.recycleCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 底部導航 */}
          <div className="essay-nav">
            {step > 1 ? (
              <button className="essay-nav-btn" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={16} /> {t('back')}
              </button>
            ) : <span />}

            {step < 3 ? (
              <button
                className="essay-nav-btn primary"
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && selectedIds.length === 0}
              >
                {t('next')} <ChevronRight size={16} />
              </button>
            ) : (
              <div className="essay-nav-right">
                <button className="essay-nav-btn" onClick={() => setStep(1)}>
                  <RotateCcw size={15} /> {t('reRun')}
                </button>
                <button className="essay-nav-btn primary" onClick={onClose}>{t('done')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}