import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { LANGUAGES, getTranslation } from '../utils/i18n';

export default function LanguageSelector({ currentLang, onLangChange }) {
  const [open, setOpen] = useState(false);
  const selected = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];
  const t = (k) => getTranslation(currentLang, k);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.75rem',
          borderRadius: '30px',
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #cbd5e1',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#0f172a',
          cursor: 'pointer'
        }}
      >
        <Globe size={15} color="#4f46e5" />
        <span>{selected.flag} {selected.name}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '120%',
          right: 0,
          width: '380px',
          padding: '0.75rem',
          zIndex: 200,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          boxShadow: '0 12px 32px rgba(15,23,42,0.15)'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 800, padding: '0.2rem 0.4rem', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
            🌐 {t('selectLanguage')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', maxHeight: '360px', overflowY: 'auto' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onLangChange(lang.code); setOpen(false); }}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.6rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: currentLang === lang.code ? '#e0e7ff' : '#f8fafc',
                  color: currentLang === lang.code ? '#4338ca' : '#0f172a',
                  fontWeight: currentLang === lang.code ? 700 : 500,
                  border: currentLang === lang.code ? '1px solid #4f46e5' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '1rem' }}>{lang.flag}</span>
                <span>{lang.name}</span>
                {currentLang === lang.code && <Check size={13} style={{ marginLeft: 'auto', color: '#4f46e5' }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
