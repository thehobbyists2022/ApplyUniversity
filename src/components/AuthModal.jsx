import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, KeyRound, Loader, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { signInWithEmail, signUpWithEmail, sendPasswordReset } from '../lib/auth';

export default function AuthModal({ isOpen, onClose, lang }) {
  const [mode, setMode] = useState('signin'); // signin | signup | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  if (!isOpen) return null;
  const t = (k, vars) => getTranslation(lang, k, vars);

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || (!password.trim() && mode !== 'reset')) {
      setError(t('authErrorRequired'));
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email.trim(), password);
        if (error) throw error;
        onClose();
      } else if (mode === 'signup') {
        const { data, error } = await signUpWithEmail(email.trim(), password);
        if (error) throw error;
        if (data && data.session) {
          onClose();
        } else {
          setInfo(t('authConfirmEmail'));
          setMode('signin');
        }
      } else {
        const { error } = await sendPasswordReset(email.trim());
        if (error) throw error;
        setInfo(t('authResetSent'));
        setMode('signin');
      }
    } catch (err) {
      const msg = String(err && err.message || err || '');
      if (/invalid login credentials|invalid_credentials/i.test(msg)) setError(t('authErrorInvalid'));
      else if (/already registered|user_already_exists|duplicate/i.test(msg)) setError(t('authErrorEmailTaken'));
      else if (/password|weak/i.test(msg)) setError(t('authErrorPassword'));
      else setError(t('authErrorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card auth-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
          <div className="auth-kicker">
            <ShieldCheck size={13} />
            <span>{t('authKicker')}</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.45rem' }}>
            {mode === 'signin' ? t('authSignInTitle') : mode === 'signup' ? t('authSignUpTitle') : t('authResetTitle')}
          </h2>
          <p className="auth-subtitle">
            {mode === 'signin' ? t('authSignInSub') : mode === 'signup' ? t('authSignUpSub') : t('authResetSub')}
          </p>
        </div>

        <div className="modal-body auth-body">
          {/* Mode tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => switchMode('signin')}>
              <LogIn size={14} /> {t('authTabSignIn')}
            </button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>
              <UserPlus size={14} /> {t('authTabSignUp')}
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">{t('authEmail')}</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('authEmailPlaceholder')}
                  autoComplete="email"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label">{t('authPassword')}</label>
                  {mode === 'signin' && (
                    <button type="button" className="auth-forgot" onClick={() => switchMode('reset')}>
                      <KeyRound size={11} /> {t('authForgot')}
                    </button>
                  )}
                </div>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    type="password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('authPasswordPlaceholder')}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                </div>
              </div>
            )}

            {error && <div className="auth-error" role="alert">{error}</div>}
            {info && <div className="auth-info"><CheckCircle2 size={14} /> {info}</div>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <Loader size={16} className="auth-spin" /> : <ShieldCheck size={16} />}
              <span>
                {mode === 'signin' ? t('authSubmitSignIn') : mode === 'signup' ? t('authSubmitSignUp') : t('authSubmitReset')}
              </span>
            </button>
          </form>

          {mode === 'signin' && (
            <p className="auth-switch-hint">
              {t('authNoAccount')}{' '}
              <button className="auth-switch-link" onClick={() => switchMode('signup')}>{t('authCreateAccount')}</button>
            </p>
          )}
          {mode === 'signup' && (
            <p className="auth-switch-hint">
              {t('authHaveAccount')}{' '}
              <button className="auth-switch-link" onClick={() => switchMode('signin')}>{t('authSignIn')}</button>
            </p>
          )}
          {mode === 'reset' && (
            <p className="auth-switch-hint">
              <button className="auth-switch-link" onClick={() => switchMode('signin')}>{t('authBackToSignIn')}</button>
            </p>
          )}

          <p className="auth-secure-note">
            <ShieldCheck size={12} /> {t('authSecureNote')}
          </p>
        </div>
      </div>
    </div>
  );
}