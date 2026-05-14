import React from 'react';
import CubeLogo from '../components/Cubelogo';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();
  return (
    <footer style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,60px) clamp(24px,3vw,40px)', borderTop: '1px solid var(--footer-border)', background: 'var(--footer-bg)', transition: 'background 0.4s, border-color 0.4s' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Top row: logo + columns */}
        <div className="footer-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(32px,5vw,60px)', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <CubeLogo size={28} animate />
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', transition: 'color 0.4s' }}>SurveyFlow</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 240, lineHeight: 1.7 }}>
              The world's first AI-native feedback loop for modern product teams.
            </p>
          </div>

          {/* Link columns — wrap on mobile */}
          <div className="footer-cols" style={{ display: 'flex', gap: 'clamp(24px,5vw,80px)', flexWrap: 'wrap' }}>
            {[
              { title: 'Product', links: ['Features','Pricing','Integrations','Changelog'] },
              { title: 'Company', links: ['About','Blog','Careers','Privacy'] },
              { title: 'Support', links: ['Docs','Status','Community','Contact'] },
            ].map(col => (
              <div key={col.title} style={{ minWidth: 100 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14, letterSpacing: '0.06em', transition: 'color 0.4s' }}>{col.title}</div>
                {col.links.map(l => (
                  <a key={l} href="#"
                    style={{ display: 'block', fontSize: 14, color: 'var(--muted)', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s', minHeight: 28, lineHeight: '28px' }}
                    onMouseEnter={e => e.target.style.color = 'var(--link-hover)'}
                    onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: 28, borderTop: '1px solid var(--footer-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, transition: 'border-color 0.4s' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>© 2026 SurveyFlow AI. Crafted for the VIBGYOR Spectrum.</span>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {['#7c3aed','#4f46e5','#2563eb','#059669','#d97706','#ea580c','#dc2626'].map(c => (
              <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}88` }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
