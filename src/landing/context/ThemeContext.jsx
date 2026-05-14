import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { const s = localStorage.getItem('sf-theme'); if (s) return s; } catch {}
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  });

  const isDark = theme === 'dark';

  const toggle = useCallback(() => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('sf-theme', next); } catch {}
      return next;
    });
  }, []);

  // ── CRITICAL FIX: scope data-theme to .landing-root only, NOT <html> ─────
  // Setting data-theme on document.documentElement bleeds dark vars
  // into the entire app (dashboard, surveys, etc.) after navigation.
  // We set it via the React prop on .landing-root instead (see LandingPage.jsx).
  // We only set/restore body styles while this provider is mounted.
  useEffect(() => {
    // Save whatever body styles existed before landing mounted
    const prevBg     = document.body.style.background;
    const prevColor  = document.body.style.color;
    const prevCursor = document.body.style.cursor;

    // Apply landing styles
    document.body.style.background = isDark ? '#020408' : '#f0f2fc';
    document.body.style.color      = isDark ? '#f1f5f9' : '#0f172a';
    document.body.style.cursor     = 'none'; // custom cursor active on landing

    // CLEANUP: restore body styles when provider unmounts (user navigates away)
    return () => {
      document.body.style.background = prevBg    || '';
      document.body.style.color      = prevColor || '';
      document.body.style.cursor     = prevCursor || '';
      // Remove any data-theme that may have been set globally
      document.documentElement.removeAttribute('data-theme');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount, cleanup on unmount

  // Update body styles when theme toggles (while still on landing)
  useEffect(() => {
    document.body.style.background = isDark ? '#020408' : '#f0f2fc';
    document.body.style.color      = isDark ? '#f1f5f9' : '#0f172a';
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};
