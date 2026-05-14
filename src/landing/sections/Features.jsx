import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: '✨', title: 'AI Builder',    desc: 'Natural language to survey in seconds. Describe your goal, our cognitive AI builds the optimal question flow.', color: '#7c3aed', glow: 'rgba(124,58,237,0.2)',  tag: 'VIOLET', detail: '24× faster'     },
  { icon: '🧠', title: 'Sentiment AI',  desc: 'Real-time analysis of open-ended responses. Understand the why behind every answer at scale.',                 color: '#059669', glow: 'rgba(5,150,105,0.2)',   tag: 'GREEN',  detail: '98.4% accuracy' },
  { icon: '📊', title: 'Live Analytics',desc: 'Watch responses pour in with animated charts, cohort filtering, and exportable insight packs.',                 color: '#d97706', glow: 'rgba(217,119,6,0.2)',   tag: 'YELLOW', detail: '<100ms latency' },
  { icon: '🔀', title: 'Smart Logic',   desc: 'Branching, skip logic, and piping that adapts in real-time to keep respondents on the shortest path.',          color: '#ea580c', glow: 'rgba(234,88,12,0.2)',   tag: 'ORANGE', detail: '∞ branches'     },
  { icon: '🔌', title: 'Integrations',  desc: 'Native connectors for HubSpot, Salesforce, Slack, Notion, and 200+ apps. No middleware needed.',               color: '#dc2626', glow: 'rgba(220,38,38,0.2)',   tag: 'RED',    detail: '200+ apps'      },
  { icon: '🌍', title: 'Global Scale',  desc: '47 languages, GDPR/CCPA compliant, geo-distributed edge network. Reach anyone, anywhere.',                     color: '#4f46e5', glow: 'rgba(79,70,229,0.2)',   tag: 'INDIGO', detail: '47 languages'   },
];

const process = [
  { step: '01', icon: '🎯', title: 'Define',   desc: 'Tell us your goal in plain English. Our AI understands context and suggests the best survey structure.',   color: '#7c3aed' },
  { step: '02', icon: '🛠', title: 'Build',    desc: 'Customise questions, branching logic, themes, and branding. Everything in one intuitive drag-and-drop editor.', color: '#4f46e5' },
  { step: '03', icon: '🚀', title: 'Distribute',desc: 'Share via QR code, email, WhatsApp, or direct link. Each channel is tracked separately in real time.',      color: '#2563eb' },
  { step: '04', icon: '📈', title: 'Analyse',  desc: 'Instant AI-powered reports: sentiment, drop-off funnels, completion rates, and export-ready charts.',         color: '#059669' },
];

const support = [
  { icon: '💬', title: '24/7 Live Chat',    desc: 'Dedicated support agents available around the clock.' },
  { icon: '📚', title: 'Rich Documentation', desc: 'Step-by-step guides, API references, and video tutorials.' },
  { icon: '🎓', title: 'Onboarding',         desc: 'Guided setup sessions with a dedicated Customer Success Manager.' },
  { icon: '🔒', title: 'Enterprise SLA',     desc: '99.9% uptime guarantee with priority incident response.' },
];

const company = [
  { stat: '50K+',  label: 'Surveys Created' },
  { stat: '2M+',   label: 'Responses Collected' },
  { stat: '120+',  label: 'Countries' },
  { stat: '99.9%', label: 'Uptime SLA' },
];

function FeatureCard({ f, index }) {
  const { isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = cardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    el.style.transform = `perspective(900px) rotateX(${-((y-cy)/cy)*14}deg) rotateY(${((x-cx)/cx)*14}deg) scale3d(1.04,1.04,1.04)`;
    el.style.transition = 'transform 0.05s linear';
  };

  const handleMouseLeave = () => {
    const el = cardRef.current; if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
    setIsHovered(false);
  };

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={handleMouseLeave}
      style={{ background: 'var(--card-bg-grad)', border: `1px solid ${isHovered ? f.color+'44' : 'var(--border)'}`, borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden', cursor: 'pointer', willChange: 'transform', boxShadow: isHovered ? `0 16px 48px ${f.glow}` : 'none', transition: 'border-color 0.3s, box-shadow 0.3s', animation: `fadeUp 0.6s ${index*0.08}s ease both` }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: f.color, opacity: isHovered ? 1 : 0.4 }} />
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: f.glow, borderRadius: '50%', filter: 'blur(40px)', opacity: isHovered ? 1 : 0.4, pointerEvents: 'none' }} />
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${f.color}22,${f.color}11)`, border: `1px solid ${f.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: f.color, marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>{f.tag}</div>
      <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em', color: 'var(--text)', fontFamily: "'Sora',sans-serif" }}>{f.title}</h4>
      <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>{f.desc}</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${f.color}15`, border: `1px solid ${f.color}30`, fontSize: 12, fontWeight: 700, color: f.color, fontFamily: "'JetBrains Mono',monospace" }}>{f.detail}</div>
    </div>
  );
}

function useVisible(threshold = 0.1) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function Features() {
  const { isDark } = useTheme();
  const [featureRef, featureVisible] = useVisible();
  const [processRef, processVisible] = useVisible();
  const [supportRef, supportVisible] = useVisible();
  const [companyRef, companyVisible] = useVisible();

  const S = (delay = 0, visible) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(24px)',
    transition: `all 0.6s ${delay}s ease`,
  });

  return (
    <>
      {/* ── Core Features ────────────────────────────────────────────────── */}
      <section id="features" ref={featureRef} style={{ padding: 'clamp(60px,8vw,120px) clamp(16px,4vw,60px)', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 'clamp(40px,6vw,72px)', ...S(0, featureVisible) }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: '#4f46e5', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>◆ Core Capabilities</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', maxWidth: 500, fontFamily: "'Sora',sans-serif" }}>
            Unfair Advantage<br />
            <span style={{ background: 'linear-gradient(135deg,#60a5fa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>for Researchers</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
          {features.map((f, i) => <FeatureCard key={f.title} f={f} index={i} />)}
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────────────── */}
      <section id="process" ref={processRef} style={{ padding: 'clamp(60px,8vw,120px) clamp(16px,4vw,60px)', background: isDark ? 'rgba(8,13,26,0.8)' : 'rgba(240,242,252,0.6)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)', ...S(0, processVisible) }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>◆ How It Works</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', fontFamily: "'Sora',sans-serif" }}>
              Four steps to{' '}
              <span style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>powerful insights</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 24, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 40, left: '12%', right: '12%', height: 2, background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#2563eb,#059669)', opacity: 0.3, display: 'none' }} />
            {process.map((p, i) => (
              <div key={p.step} style={{ ...S(i * 0.1, processVisible), background: 'var(--card-bg-grad)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: p.color }} />
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 36, fontWeight: 800, color: `${p.color}22`, marginBottom: 12, lineHeight: 1 }}>{p.step}</div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: "'Sora',sans-serif" }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Support ──────────────────────────────────────────────────────── */}
      <section id="support" ref={supportRef} style={{ padding: 'clamp(60px,8vw,120px) clamp(16px,4vw,60px)', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)', ...S(0, supportVisible) }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: '#059669', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>◆ Support</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', fontFamily: "'Sora',sans-serif" }}>
            We've got your{' '}
            <span style={{ background: 'linear-gradient(135deg,#34d399,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>back, always</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>World-class support at every tier — from self-serve docs to dedicated enterprise CSMs.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 20 }}>
          {support.map((s, i) => (
            <div key={s.title} style={{ ...S(i * 0.1, supportVisible), background: 'var(--card-bg-grad)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontFamily: "'Sora',sans-serif" }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Company / Stats ───────────────────────────────────────────────── */}
      <section id="company" ref={companyRef} style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,60px)', background: isDark ? 'rgba(8,13,26,0.8)' : 'rgba(240,242,252,0.6)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,60px)', ...S(0, companyVisible) }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: '#d97706', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>◆ Company</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', fontFamily: "'Sora',sans-serif" }}>
              Trusted by{' '}
              <span style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>researchers worldwide</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))', gap: 20 }}>
            {company.map((c, i) => (
              <div key={c.label} style={{ ...S(i * 0.1, companyVisible), textAlign: 'center', background: 'var(--card-bg-grad)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 20px' }}>
                <div style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', fontFamily: "'Sora',sans-serif" }}>{c.stat}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
