import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    toggle();
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        position: 'relative',
        width: 52,
        height: 28,
        borderRadius: 100,
        border: '1px solid var(--toggle-border)',
        background: isDark
          ? 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(79,70,229,0.2))'
          : 'linear-gradient(135deg,rgba(251,191,36,0.25),rgba(234,88,12,0.15))',
        cursor: 'none',
        display: 'flex',
        alignItems: 'center',
        padding: '0 3px',
        transition: 'background 0.4s ease, border-color 0.4s ease',
        boxShadow: isDark
          ? '0 0 12px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 0 12px rgba(251,191,36,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
        flexShrink: 0,
      }}
    >
      {/* Track */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 100,
        background: isDark ? 'rgba(124,58,237,0.08)' : 'rgba(251,191,36,0.1)',
        transition: 'background 0.4s',
      }} />

      {/* Knob */}
      <div style={{
        position: 'relative',
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: isDark
          ? 'linear-gradient(135deg,#a78bfa,#7c3aed)'
          : 'linear-gradient(135deg,#fbbf24,#f59e0b)',
        boxShadow: isDark
          ? '0 2px 8px rgba(124,58,237,0.6)'
          : '0 2px 8px rgba(251,191,36,0.7)',
        transform: isDark ? 'translateX(24px)' : 'translateX(0px)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.4s, box-shadow 0.4s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        animation: animating ? 'toggleBounce 0.4s ease' : 'none',
        zIndex: 1,
      }}>
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
}
