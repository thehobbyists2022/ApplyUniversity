import React, { useState } from 'react';
import { X, Sparkles, Copy, RotateCcw, Check, Loader } from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { polishActivity } from '../utils/activityPolisher';

const ACTIVITY_TYPES = [
  'Club / Organization',
  'Sports & Athletics',
  'Arts & Performance',
  'Research & Academic',
  'Community Service / Volunteering',
  'Internship / Work',
  'Student Government',
  'Other'
];

const DRAFT_MAX = 300;
const RESULT_MAX = 150;

export default function ActivityPolisherModal({ isOpen, onClose, lang }) {
  const [activityType, setActivityType] = useState('Club / Organization');
  const [role, setRole] = useState('');
  const [draft, setDraft] = useState('');
  const [tone, setTone] = useState('impact');
  const [opts, setOpts] = useState({ quantify: true, strongVerbs: true, leadership: false, trimTo150: true });
  const [result, setResult] = useState(null);
  const [variant, setVariant] = useState(0);
  const [isPolishing, setIsPolishing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const t = (k) => getTranslation(lang, k);

  const toggleOpt = (key) => {
    setOpts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const buildResult = (v) => polishActivity({
    text: draft,
    role,
    activityType,
    tone,
    options: opts,
    variant: v
  });

  const handlePolish = () => {
    if (!draft.trim()) return;
    setIsPolishing(true);
    setTimeout(() => {
      setResult(buildResult(variant));
      setCopied(false);
      setIsPolishing(false);
    }, 350);
  };

  const handleRePolish = () => {
    if (!draft.trim()) return;
    const nextVariant = variant + 1;
    setVariant(nextVariant);
    setIsPolishing(true);
    setTimeout(() => {
      setResult(buildResult(nextVariant));
      setCopied(false);
      setIsPolishing(false);
    }, 350);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = result;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const draftOver = draft.length > DRAFT_MAX;
  const resultOver = result && result.length > RESULT_MAX;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card polisher-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div className="polisher-kicker">
            <Sparkles size={13} />
            <span>Common App • Activities</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.45rem' }}>{t('polisherTitle')}</h2>
          <p className="polisher-subtitle">{t('polisherSubtitle')}</p>
        </div>

        <div className="modal-body polisher-body">
          {/* ===== 第一區：活動資訊輸入 ===== */}
          <div className="polisher-section">
            <div className="polisher-section-title">
              <span className="polisher-step">1</span>
              <span>{t('activityType')}</span>
            </div>

            <div className="polisher-grid-2">
              <div className="polisher-field">
                <label className="polisher-label">{t('activityType')}</label>
                <select
                  className="polisher-select"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  {ACTIVITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="polisher-field">
                <label className="polisher-label">{t('yourRole')}</label>
                <input
                  type="text"
                  className="polisher-input"
                  value={role}
                  placeholder={t('rolePlaceholder')}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            <div className="polisher-field">
              <div className="polisher-label-row">
                <label className="polisher-label">{t('draftLabel')}</label>
                <span className={`polisher-char-counter ${draftOver ? 'over' : ''}`}>
                  {draft.length} / {DRAFT_MAX}
                </span>
              </div>
              <div className="polisher-textarea-wrap">
                <textarea
                  className={`polisher-textarea ${draftOver ? 'over' : ''}`}
                  value={draft}
                  placeholder={t('draftPlaceholder')}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* ===== 第二區：智能潤色控制 ===== */}
          <div className="polisher-section">
            <div className="polisher-section-title">
              <span className="polisher-step">2</span>
              <span>{t('toneStyle')}</span>
            </div>

            <div className="polisher-tone-pills">
              <button
                className={`polisher-tone ${tone === 'impact' ? 'active' : ''}`}
                onClick={() => setTone('impact')}
              >
                {t('toneImpact')}
              </button>
              <button
                className={`polisher-tone ${tone === 'academic' ? 'active' : ''}`}
                onClick={() => setTone('academic')}
              >
                {t('toneAcademic')}
              </button>
              <button
                className={`polisher-tone ${tone === 'leadership' ? 'active' : ''}`}
                onClick={() => setTone('leadership')}
              >
                {t('toneLeadership')}
              </button>
            </div>

            <div className="polisher-section-title" style={{ marginTop: '1rem' }}>
              <span className="polisher-step">3</span>
              <span>{t('optimizeGoals')}</span>
            </div>

            <div className="polisher-checks">
              <label className={`polisher-check ${opts.quantify ? 'checked' : ''}`}>
                <input type="checkbox" checked={opts.quantify} onChange={() => toggleOpt('quantify')} />
                <span className="polisher-checkbox" />
                <span className="polisher-check-label">{t('optQuantify')}</span>
              </label>
              <label className={`polisher-check ${opts.strongVerbs ? 'checked' : ''}`}>
                <input type="checkbox" checked={opts.strongVerbs} onChange={() => toggleOpt('strongVerbs')} />
                <span className="polisher-checkbox" />
                <span className="polisher-check-label">{t('optVerbs')}</span>
              </label>
              <label className={`polisher-check ${opts.leadership ? 'checked' : ''}`}>
                <input type="checkbox" checked={opts.leadership} onChange={() => toggleOpt('leadership')} />
                <span className="polisher-checkbox" />
                <span className="polisher-check-label">{t('optLeadership')}</span>
              </label>
              <label className={`polisher-check ${opts.trimTo150 ? 'checked' : ''}`}>
                <input type="checkbox" checked={opts.trimTo150} onChange={() => toggleOpt('trimTo150')} />
                <span className="polisher-checkbox" />
                <span className="polisher-check-label">{t('optTrim')}</span>
              </label>
            </div>
          </div>

          {/* ===== 第三區：輸出結果 ===== */}
          <div className="polisher-section">
            <button
              className="polisher-submit"
              onClick={handlePolish}
              disabled={!draft.trim() || isPolishing || draftOver}
            >
              {isPolishing ? <Loader size={16} className="polisher-spin" /> : <Sparkles size={16} />}
              <span>{t('polishBtn')}</span>
            </button>

            {result != null ? (
              <div className="polisher-result-card">
                <div className="polisher-result-top">
                  <span className="polisher-result-label">{t('polishedResult')}</span>
                  <span className={`polisher-count ${resultOver ? 'over' : 'ok'}`}>
                    {result.length} / {RESULT_MAX}
                  </span>
                </div>
                <p className="polisher-result-text">{result}</p>
                <div className="polisher-result-actions">
                  <button className="polisher-action-btn" onClick={handleCopy}>
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    <span>{copied ? t('copied') : t('copyBtn')}</span>
                  </button>
                  <button className="polisher-action-btn" onClick={handleRePolish}>
                    <RotateCcw size={15} />
                    <span>{t('rePolish')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="polisher-empty">
                <Sparkles size={22} />
                <p>{t('polisherEmpty')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}