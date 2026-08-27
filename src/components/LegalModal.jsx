import React, { useState } from 'react';
import { X, FileText, Scale, ShieldCheck, Sparkles, HardDrive, GraduationCap, PenTool } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

const TAB_CONFIG = [
  { id: 'privacy', icon: ShieldCheck, titleKey: 'legalPrivacyTitle', tabKey: 'legalTabPrivacy', sections: [
    ['legalPrivacyS1Title', 'legalPrivacyS1Body', HardDrive],
    ['legalPrivacyS2Title', 'legalPrivacyS2Body', GraduationCap],
    ['legalPrivacyS3Title', 'legalPrivacyS3Body', ShieldCheck],
    ['legalPrivacyS4Title', 'legalPrivacyS4Body', FileText]
  ]},
  { id: 'terms', icon: Scale, titleKey: 'legalTermsTitle', tabKey: 'legalTabTerms', sections: [
    ['legalTermsS1Title', 'legalTermsS1Body', FileText],
    ['legalTermsS2Title', 'legalTermsS2Body', Scale],
    ['legalTermsS3Title', 'legalTermsS3Body', GraduationCap],
    ['legalTermsS4Title', 'legalTermsS4Body', ShieldCheck]
  ]},
  { id: 'security', icon: Sparkles, titleKey: 'legalSecurityTitle', tabKey: 'legalTabSecurity', sections: [
    ['legalSecurityS1Title', 'legalSecurityS1Body', PenTool],
    ['legalSecurityS2Title', 'legalSecurityS2Body', FileText],
    ['legalSecurityS3Title', 'legalSecurityS3Body', Sparkles]
  ]}
];

export default function LegalModal({ isOpen, onClose, lang, initialTab = 'privacy' }) {
  const [tab, setTab] = useState(initialTab);

  if (!isOpen) return null;
  const t = (k, vars) => getTranslation(lang, k, vars);
  const updated = '2026-08-27';

  const active = TAB_CONFIG.find(c => c.id === tab) || TAB_CONFIG[0];
  const KickerIcon = ShieldCheck;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card legal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
          <div className="legal-kicker">
            <KickerIcon size={13} />
            <span>{t('legalKicker')}</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.45rem' }}>
            {t(active.titleKey)}
          </h2>
          <p className="legal-updated">{t('legalUpdated', { date: updated })}</p>
        </div>

        <div className="modal-body legal-body">
          <div className="legal-tabs">
            {TAB_CONFIG.map(c => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  className={`legal-tab ${tab === c.id ? 'active' : ''}`}
                  onClick={() => setTab(c.id)}
                >
                  <Icon size={14} /> {t(c.tabKey)}
                </button>
              );
            })}
          </div>

          <div className="legal-sections">
            {active.sections.map(([titleKey, bodyKey, Icon], i) => (
              <div className="legal-section" key={i}>
                <h3 className="legal-section-title">
                  <Icon size={14} /> {t(titleKey)}
                </h3>
                <p className="legal-section-body">{t(bodyKey)}</p>
              </div>
            ))}
          </div>

          <p className="legal-contact">{t('legalContact', { email: 'support@steponecareer.com' })}</p>
        </div>
      </div>
    </div>
  );
}