import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CubeLogo from './Cubelogo';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

// "Log In" is now a router-aware button, not an anchor
const links = ['Features', 'Pricing', 'Process'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleGetStarted = () => navigate('/login');
  const handleLogIn = () => navigate('/login');

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: scrolled ? 'var(--nav-bg-scroll)' : 'var(--nav-bg-top)',
        borderBottom: scrolled ? `1px solid rgba(124,58,237,${isDark ? '0.2' : '0.15'})` : '1px solid var(--border)',
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#2563eb,#059669,#d97706,#ea580c,#dc2626)', opacity: isDark ? 0.7 : 0.85 }} />
        <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <CubeLogo size={32} animate />
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>
              SurveyFlow
              <span style={{ fontSize: 10, fontWeight: 400, color: '#7c3aed', marginLeft: 5, letterSpacing: '0.06em', fontFamily: "'JetBrains Mono',monospace" }}>AI</span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="nav-desktop-links" style={{ display: 'flex', gap: 36 }}>
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s', minHeight: 44, display: 'flex', alignItems: 'center' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                {l}
              </a>
            ))}
            <button onClick={handleLogIn}
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s', minHeight: 44, display: 'flex', alignItems: 'center', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
              Log In
            </button>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            <button className="nav-desktop-cta" onClick={handleGetStarted} style={{ padding: '10px 20px', borderRadius: 100, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', boxShadow: '0 0 24px rgba(124,58,237,0.35)', transition: 'all 0.25s', minHeight: 44 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.35)'; }}>
              Get Started
            </button>
            {/* Hamburger */}
            <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              style={{ display: 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5, width: 44, height: 44, background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', padding: 0, transition: 'border-color 0.2s', flexShrink: 0 }}>
              <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.3s, opacity 0.3s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'opacity 0.3s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.3s, opacity 0.3s', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <div className="nav-mobile-drawer" style={{ position: 'fixed', top: 66, left: 0, right: 0, zIndex: 99, background: isDark ? 'rgba(2,4,8,0.97)' : 'rgba(255,255,255,0.98)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)', padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 4, transform: menuOpen ? 'translateY(0)' : 'translateY(-110%)', transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1)', pointerEvents: menuOpen ? 'all' : 'none' }}>
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', padding: '14px 12px', borderRadius: 12, minHeight: 52, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {l}
          </a>
        ))}
        <button onClick={() => { setMenuOpen(false); handleLogIn(); }}
          style={{ display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 600, color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 12px', borderRadius: 12, minHeight: 52, textAlign: 'left' }}>
          Log In
        </button>
        <div style={{ marginTop: 8, padding: '0 12px' }}>
          <button onClick={() => { setMenuOpen(false); handleGetStarted(); }}
            style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 8px 24px rgba(124,58,237,0.35)', minHeight: 52 }}>
            Get Started
          </button>
        </div>
      </div>

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.4)' }} />}

      <style>{`
        @media (max-width: 767px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-cta { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 768px) { .nav-mobile-drawer { display: none !important; } }
        @media (min-width: 768px) and (max-width: 1023px) { .nav-desktop-links { gap: 20px !important; } }
      `}</style>
    </>
  );
}
