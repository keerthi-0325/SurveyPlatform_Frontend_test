import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const FREE_TRIAL_DAYS = 14;

function PingBadge({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 16px', borderRadius: 100,
      border: '1px solid var(--badge-border)',
      background: 'var(--badge-bg)',
      color: 'var(--badge-text)',
      fontSize: 12, fontWeight: 600,
      letterSpacing: '0.04em', marginBottom: 24,
      animation: 'fadeUp 0.6s 0.1s ease both',
      fontFamily: "'JetBrains Mono',monospace",
      transition: 'background 0.4s, border-color 0.4s, color 0.4s',
    }}>
      <span style={{ position: 'relative', display: 'flex', width: 8, height: 8, flexShrink: 0 }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#7c3aed', animation: 'pulseRing 1.5s ease-out infinite', transform: 'translate(-50%,-50%)', left: '50%', top: '50%' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'block' }} />
      </span>
      {children}
    </div>
  );
}

function Dashboard3D({ heroOffset, isMobile }) {
  const { isDark } = useTheme();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (isMobile) return;
    const h = (e) => setMouse({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [isMobile]);

  const tiltX = isMobile ? 0 : mouse.y * -6;
  const tiltY = isMobile ? 0 : mouse.x * 8;
  const stats = [
    { label: 'Responses', val: '24,918', delta: '+12.4%', color: '#7c3aed' },
    { label: 'Completion', val: '94.2%', delta: '+3.1%',  color: '#059669' },
    { label: 'Avg Time',   val: '2m 34s',delta: '-18s',   color: '#d97706' },
  ];
  const bars = [65,80,45,90,72,88,55,95,60,85,70,92];
  const barColors = ['#7c3aed','#4f46e5','#2563eb','#059669','#d97706','#ea580c','#dc2626','#7c3aed','#4f46e5','#2563eb','#059669','#d97706'];

  return (
    <div style={{ perspective: isMobile ? 'none' : 1400, perspectiveOrigin: '50% 40%', marginTop: isMobile ? 40 : 60, transform: isMobile ? 'none' : `translateY(${heroOffset * -0.05}px)`, width: '100%' }}>
      <div style={{ transformStyle: 'preserve-3d', transform: isMobile ? 'none' : `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`, transition: 'transform 0.08s linear', position: 'relative', animation: isMobile ? 'none' : 'dashboardFloat 6s ease-in-out infinite' }}>
        <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse at 50% 50%,rgba(124,58,237,0.2),rgba(79,70,229,0.1),transparent 70%)', filter: 'blur(30px)', zIndex: -1, borderRadius: 32 }} />
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border2)', borderRadius: isMobile ? 16 : 24, overflow: 'hidden', boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.6)' : '0 24px 80px rgba(100,100,200,0.15)', backdropFilter: 'blur(20px)', transition: 'background 0.4s, border-color 0.4s', width: '100%' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--window-bar)' }}>
            {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.6 }} />)}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'var(--window-url-bg)', borderRadius: 6, padding: '3px 12px', fontSize: 10, color: 'var(--window-url-txt)', fontFamily: "'JetBrains Mono',monospace" }}>surveyflow.ai/dashboard</div>
            </div>
          </div>
          <div style={{ padding: isMobile ? 16 : 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: isMobile ? 8 : 16, marginBottom: isMobile ? 16 : 24 }}>
              {stats.map(s => (
                <div key={s.label} style={{ background: 'var(--kpi-bg)', border: `1px solid ${s.color}22`, borderRadius: isMobile ? 10 : 14, padding: isMobile ? '10px' : '14px 16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.7 }} />
                  <div style={{ fontSize: isMobile ? 9 : 11, color: 'var(--muted)', marginBottom: 4, fontFamily: "'JetBrains Mono',monospace" }}>{s.label}</div>
                  <div style={{ fontSize: isMobile ? 15 : 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: s.color, marginTop: 3, fontWeight: 600 }}>{s.delta}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--chart-bg)', border: '1px solid var(--chart-border)', borderRadius: isMobile ? 12 : 16, padding: isMobile ? '14px' : '20px 24px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, fontFamily: "'JetBrains Mono',monospace" }}>Response Rate — Last 12 months</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: isMobile ? 56 : 80 }}>
                {bars.map((h, i) => <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}><div style={{ width: '100%', height: `${h}%`, borderRadius: '4px 4px 2px 2px', background: barColors[i], opacity: isDark ? 0.7 : 0.85 }} /></div>)}
              </div>
            </div>
          </div>
        </div>
        {!isMobile && (
          <>
            <div style={{ position: 'absolute', top: 60, right: -100, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#a78bfa', backdropFilter: 'blur(12px)', fontFamily: "'JetBrains Mono',monospace", animation: 'floatY 3s ease-in-out infinite' }}>🔥 98.4% accuracy</div>
            <div style={{ position: 'absolute', bottom: 80, left: -80, background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#34d399', backdropFilter: 'blur(12px)', fontFamily: "'JetBrains Mono',monospace", animation: 'floatY 4s 1s ease-in-out infinite' }}>✓ AI Cleaned</div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Watch Demo Modal ─────────────────────────────────────────────────────────
function WatchDemoModal({ onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 800, background: '#0d1427', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        {/* Demo header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>SurveyPro Platform Demo</p>
            <p style={{ color: '#64748b', fontSize: 12 }}>See how it works in 2 minutes</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: 10, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        {/* Demo content */}
        <div style={{ padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { icon: '🎯', title: 'Create', desc: 'Build surveys with AI in seconds' },
              { icon: '📊', title: 'Collect', desc: 'Distribute via QR, email, WhatsApp' },
              { icon: '🧠', title: 'Analyze', desc: 'Real-time AI-powered insights' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.title}</p>
                <p style={{ color: '#64748b', fontSize: 12 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 12 }}>
              {[0,1,2,3,4,5,6,7,8,9,10,11].map((_, i) => (
                <div key={i} style={{ flex: 1, height: 40, background: `rgba(124,58,237,${0.2 + (i % 4) * 0.15})`, borderRadius: '4px 4px 0 0' }} />
              ))}
            </div>
            <p style={{ color: '#a78bfa', fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>Live Response Analytics Dashboard</p>
          </div>
          <button onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
            Start Your {FREE_TRIAL_DAYS}-Day Free Trial →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [heroOffset, setHeroOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const h = () => setHeroOffset(window.pageYOffset * 0.3);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const blobs = [
    { color: 'rgba(124,58,237,0.18)', w: 600, h: 500, top: -100, left: -100, speed: 0.2 },
    { color: 'rgba(79,70,229,0.12)',  w: 500, h: 400, top: '30%', right: -80,  speed: -0.1 },
    { color: 'rgba(37,99,235,0.1)',   w: 400, h: 400, bottom: 0, left: '30%', speed: 0.15 },
  ];

  return (
    <>
      {showDemo && <WatchDemoModal onClose={() => setShowDemo(false)} />}
      <section style={{ position: 'relative', minHeight: '100vh', paddingTop: isMobile ? 100 : 140, paddingBottom: isMobile ? 60 : 80, paddingLeft: isMobile ? 20 : 40, paddingRight: isMobile ? 20 : 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px)`, backgroundSize: '40px 40px', animation: 'gridMove 8s linear infinite', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 100%)' }} />
        {blobs.map((b, i) => <div key={i} style={{ position: 'absolute', width: isMobile ? b.w * 0.5 : b.w, height: isMobile ? b.h * 0.5 : b.h, top: b.top, bottom: b.bottom, left: b.left, right: b.right, background: b.color, borderRadius: '50%', filter: 'blur(100px)', transform: `translateY(${heroOffset * b.speed}px)`, pointerEvents: 'none', zIndex: 0, animation: 'glowPulse 4s ease-in-out infinite alternate', opacity: isDark ? 1 : 0.6 }} />)}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, width: '100%' }}>
          <PingBadge>Next-Gen AI Survey Builder — {FREE_TRIAL_DAYS} Days Free</PingBadge>

          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(32px,7vw,88px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: isMobile ? 18 : 28, animation: 'fadeUp 0.7s 0.25s ease both' }}>
            Design surveys that{isMobile ? ' ' : <br />}
            <span style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              actually get answered.
            </span>
          </h1>

          <p style={{ fontSize: isMobile ? 15 : 18, color: 'var(--text2)', maxWidth: 560, margin: `0 auto ${isMobile ? '32px' : '44px'}`, lineHeight: 1.75, animation: 'fadeUp 0.7s 0.4s ease both', fontFamily: "'Sora',sans-serif" }}>
            Leverage cognitive AI to build flows that minimize drop-off and maximize insight quality. Try free for <strong style={{ color: '#7c3aed' }}>{FREE_TRIAL_DAYS} days</strong> — no credit card required.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', animation: 'fadeUp 0.7s 0.55s ease both', flexWrap: 'wrap', padding: '0 4px' }}>
            {/* Start Free Trial */}
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', boxShadow: '0 8px 32px rgba(124,58,237,0.4)', transition: 'all 0.25s', minHeight: 48, minWidth: 200, flex: isMobile ? '1 1 160px' : 'none', fontFamily: "'Sora',sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(124,58,237,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.4)'; }}>
              Start {FREE_TRIAL_DAYS}-Day Free Trial →
            </button>

            {/* Watch Demo */}
            <button
              onClick={() => setShowDemo(true)}
              style={{ padding: '14px 32px', borderRadius: 14, background: 'var(--btn-ghost-bg)', border: '1px solid var(--btn-ghost-border)', color: 'var(--btn-ghost-text)', cursor: 'pointer', fontSize: 15, fontWeight: 600, transition: 'all 0.25s', backdropFilter: 'blur(10px)', minHeight: 48, minWidth: 150, flex: isMobile ? '1 1 130px' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Sora',sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--btn-ghost-bg)'; e.currentTarget.style.borderColor = 'var(--btn-ghost-border)'; }}>
              <span style={{ fontSize: 18 }}>▶</span> Watch Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap', animation: 'fadeUp 0.7s 0.65s ease both' }}>
            {[`✓ ${FREE_TRIAL_DAYS}-day free trial`, '✓ No credit card', '✓ Cancel anytime'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{t}</span>
            ))}
          </div>

          <Dashboard3D heroOffset={heroOffset} isMobile={isMobile} />
        </div>
      </section>
    </>
  );
}
