/**
 * LandingPage.jsx
 * ───────────────
 * All landing components are wrapped inside .landing-root[data-theme]
 * so CSS vars (--bg, --text, etc.) are scoped and NEVER bleed into
 * the main app shell (Dashboard, Surveys, Analytics, etc.)
 *
 * ThemeProvider cleans up body styles when this component unmounts,
 * so navigating to /app/dashboard always gets a clean white background.
 */
import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import CustomCursor  from './components/CustomCursor';
import ParticleCanvas from './components/ParticleCanvas';
import Navbar        from './components/Navbar';
import Hero          from './sections/Hero';
import Features      from './sections/Features';
import Pricing       from './sections/Pricing';
import Footer        from './sections/Footer';

function LandingInner() {
  const { isDark } = useTheme();

  return (
    <div
      className="landing-root"
      data-theme={isDark ? 'dark' : 'light'}
      style={{
        minHeight:  '100vh',
        background: 'var(--bg)',
        color:      'var(--text)',
        overflowX:  'hidden',
        position:   'relative',
        cursor:     'none',
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <CustomCursor />
      <ParticleCanvas />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <main>
          <Hero />
          <Features />
          <Pricing />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <ThemeProvider>
      <LandingInner />
    </ThemeProvider>
  );
}
