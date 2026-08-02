import React from 'react';
import { getTranslation } from '../utils/i18n';

export default function CommunityBoard({ lang }) {
  const t = (k) => getTranslation(lang, k);

  return (
    <div className="community-grid">
      {/* Category Pills & Info */}
      <div style={{
        background: '#ffffff',
        padding: '1.25rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('communityTitle')}</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('communitySubtitle')}</p>
        </div>
      </div>

      {/* Community Coming Soon Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '2.5rem 1.5rem',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 8px 20px rgba(15,23,42,0.15)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💬</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('communityComingSoon')}</h3>
        <p style={{ fontSize: '0.925rem', color: '#94a3b8', maxWidth: '480px', margin: '0 auto' }}>
          {t('communityComingSoonDesc')}
        </p>
      </div>
    </div>
  );
}
