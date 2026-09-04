import React from 'react';
import { X, Crown, Check, ExternalLink, Sparkles, ShieldCheck, LogIn, Zap, Info } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
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
  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card paywall-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
          <div className="paywall-kicker"><Crown size={13} /><span>{t('paywallKicker')}</span></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.45rem' }}>{t('paywallTitle')}</h2>
          <p className="paywall-subtitle">
            {isNative
              ? (lang === 'zh' ? '在网页端订购的 StepOne Pro 会员可在此登录畅享全部特权。' : 'Sign in to access your StepOne Pro membership across all your devices.')
              : t('paywallSubtitle')}
          </p>
        </div>

        <div className="modal-body paywall-body">
          {isNative ? (
            /* Google Play Compliant: Consumption-Only View (No external Stripe links) */
            <div className="paywall-native-box" style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#e0e7ff',
                color: '#4f46e5',
                marginBottom: '1rem'
              }}>
                <Crown size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                {lang === 'zh' ? 'StepOne Pro 跨平台会员' : 'StepOne Pro Membership'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {lang === 'zh' 
                  ? '如您已在官网订阅 StepOne Pro，只需登录您的账号即可在此设备上同步解锁所有升学专属功能。' 
                  : 'Pro subscriptions are managed through your StepOne web account. Simply log in to automatically restore and sync your benefits.'}
              </p>

              {isSignedIn ? (
                <button
                  className="plan-btn"
                  onClick={onUnlocked}
                  style={{ width: '100%', justifyContent: 'center', background: '#4f46e5', color: '#fff', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <ShieldCheck size={16} />
                  {lang === 'zh' ? '检查 / 同步 Pro 订阅状态' : 'Sync / Restore Pro Status'}
                </button>
              ) : (
                <button
                  className="plan-btn"
                  onClick={onRequireAuth}
                  style={{ width: '100%', justifyContent: 'center', background: '#4f46e5', color: '#fff', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <LogIn size={16} />
                  {lang === 'zh' ? '立即登录账号' : 'Sign In with Account'}
                </button>
              )}
            </div>
          ) : (
            /* Web View: Full Stripe Pricing Cards */
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
        )}

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