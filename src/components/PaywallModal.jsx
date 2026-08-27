import React from 'react';
import { X, Crown, Check, ExternalLink, Sparkles, ShieldCheck, LogIn, Zap } from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { getStripeUrls } from '../lib/subscription';

const BENEFITS = [
  'benefitNetPrice',
  'benefitActivity',
  'benefitEssay',
  'benefitAlignment',
  'benefitExport',
  'benefitPriority'
];

export default function PaywallModal({ isOpen, onClose, lang, isSignedIn, onRequireAuth, onUnlocked }) {
  if (!isOpen) return null;
  const t = (k, vars) => getTranslation(lang, k, vars);
  const urls = getStripeUrls();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card paywall-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
          <div className="paywall-kicker"><Crown size={13} /><span>{t('paywallKicker')}</span></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.45rem' }}>{t('paywallTitle')}</h2>
          <p className="paywall-subtitle">{t('paywallSubtitle')}</p>
        </div>

        <div className="modal-body paywall-body">
          {/* Plans */}
          <div className="paywall-plans">
            <div className="plan-card plan-monthly">
              <div className="plan-name">{t('planMonthly')}</div>
              <div className="plan-price">
                <span className="plan-price-num">{t('planMonthlyPrice')}</span>
                <span className="plan-price-period">{t('perMonth')}</span>
              </div>
              <ul className="plan-features">
                <li><Check size={13} /> {t('planAllPro')}</li>
                <li><Check size={13} /> {t('planBillingMonthly')}</li>
                <li><Check size={13} /> {t('planCancelAnytime')}</li>
              </ul>
              <a
                className="plan-btn"
                href={urls.monthly}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Sparkles size={15} /> {t('planSubscribeMonthly')} <ExternalLink size={13} />
              </a>
            </div>

            <div className="plan-card plan-season">
              <div className="plan-tag">{t('planBestValue')}</div>
              <div className="plan-name">{t('planSeasonPass')}</div>
              <div className="plan-price">
                <span className="plan-price-num">{t('planSeasonPrice')}</span>
                <span className="plan-price-period">{t('once')}</span>
              </div>
              <ul className="plan-features">
                <li><Check size={13} /> {t('planAllPro')}</li>
                <li><Check size={13} /> {t('planFullSeason')}</li>
                <li><Check size={13} /> {t('planOneTime')}</li>
              </ul>
              <a
                className="plan-btn season"
                href={urls.seasonPass}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Zap size={15} /> {t('planSubscribeSeason')} <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Benefits */}
          <div className="paywall-benefits">
            <div className="paywall-benefits-title"><Crown size={15} /> {t('paywallWhatYouGet')}</div>
            <ul className="paywall-benefits-list">
              {BENEFITS.map(k => (
                <li key={k}><Check size={14} /> {t(k)}</li>
              ))}
            </ul>
          </div>

          {/* Restore / auth */}
          {isSignedIn ? (
            <button className="paywall-restore" onClick={onUnlocked}>
              <ShieldCheck size={15} /> {t('paywallRestore')}
            </button>
          ) : (
            <button className="paywall-restore" onClick={onRequireAuth}>
              <LogIn size={15} /> {t('paywallSignInFirst')}
            </button>
          )}

          <p className="paywall-note">{t('paywallNote')}</p>
        </div>
      </div>
    </div>
  );
}