import React, { useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const plans = [
  { name: 'Starter',      price: '$0',     mo: '/mo', color: '#4f46e5', glow: 'rgba(79,70,229,0.15)',   features: ['500 responses/mo','AI Builder (5 surveys)','Basic analytics','Email export'],                                           cta: 'Start Free',       featured: false },
  { name: 'Professional', price: '$49',    mo: '/mo', color: '#d97706', glow: 'rgba(217,119,6,0.2)',    features: ['Unlimited responses','AI Builder (unlimited)','Sentiment analysis','All integrations','Priority support'],               cta: 'Get Professional', featured: true  },
  { name: 'Enterprise',   price: 'Custom', mo: '',    color: '#7c3aed', glow: 'rgba(124,58,237,0.15)',  features: ['White-label','SSO / SAML','SLA guarantee','Dedicated CSM','On-premise option'],                                         cta: 'Contact Sales',    featured: false },
];

function PriceCard({ plan, index }) {
  const { isDark } = useTheme();
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const isTouchDevice = () => 'ontouchstart' in window;

  const handleMove = (e) => {
    if (isTouchDevice()) return;
    const el = cardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const cx = rect.width/2, cy = rect.height/2;
    const maxT = plan.featured ? 10 : 14;
    const sc = plan.featured ? 1.06 : 1.04;
    el.style.transform = `perspective(1000px) rotateX(${-((y-cy)/cy)*maxT}deg) rotateY(${((x-cx)/cx)*maxT}deg) scale3d(${sc},${sc},1)`;
    el.style.transition = 'transform 0.05s linear';
  };
  const handleLeave = () => {
    const el = cardRef.current; if (!el) return;
    const sc = plan.featured ? 1.03 : 1;
    el.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(${sc},${sc},1)`;
    el.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
    setHovered(false);
  };

  return (
    <div ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      style={{
        background: plan.featured
          ? isDark ? 'linear-gradient(135deg,rgba(20,14,40,0.98),rgba(13,20,39,0.98))' : 'linear-gradient(135deg,rgba(255,255,255,0.99),rgba(248,244,255,0.99))'
          : 'var(--card-bg-grad)',
        border: `1px solid ${hovered || plan.featured ? plan.color+'55' : 'var(--border)'}`,
        borderRadius: 24, padding: plan.featured ? 36 : 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        transformStyle: 'preserve-3d', willChange: 'transform', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        boxShadow: plan.featured
          ? `0 24px 80px ${plan.glow}, 0 0 0 1px ${plan.color}22`
          : hovered ? `0 16px 48px ${plan.glow}` : isDark ? 'none' : '0 4px 20px rgba(100,100,200,0.06)',
        transition: 'border-color 0.3s, box-shadow 0.3s, background 0.4s',
        animation: `fadeUp 0.6s ${index*0.1}s ease both`,
        transform: plan.featured ? 'perspective(1000px) scale3d(1.03,1.03,1)' : 'none',
      }}>
      {plan.featured && (
        <div style={{ position: 'absolute', top: 16, right: 16, background: `linear-gradient(135deg,${plan.color},#ea580c)`, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100, letterSpacing: '0.08em', fontFamily: "'JetBrains Mono',monospace" }}>MOST POPULAR</div>
      )}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${plan.color},transparent)`, opacity: plan.featured || hovered ? 1 : 0.3 }} />
      <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, background: plan.glow, borderRadius: '50%', filter: 'blur(60px)', opacity: hovered || plan.featured ? 1 : 0.5 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pricing-name)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, fontFamily: "'JetBrains Mono',monospace", transition: 'color 0.4s' }}>{plan.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 28, transform: 'translateZ(16px)' }}>
          <span style={{ fontFamily: "'Sora',sans-serif", fontSize: plan.price==='Custom' ? 32 : 48, fontWeight: 800, color: 'var(--pricing-price)', letterSpacing: '-0.04em', transition: 'color 0.4s' }}>{plan.price}</span>
          {plan.mo && <span style={{ color: 'var(--muted)', fontSize: 14 }}>{plan.mo}</span>}
        </div>
        <ul style={{ listStyle: 'none', marginBottom: 28, textAlign: 'left' }}>
          {plan.features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--feature-item-border)', fontSize: 14, color: 'var(--feature-item-text)', transition: 'color 0.4s, border-color 0.4s' }}>
              <span style={{ color: plan.color, fontSize: 16, flexShrink: 0 }}>✓</span>{f}
            </li>
          ))}
        </ul>
        <button style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: plan.featured ? `linear-gradient(135deg,${plan.color},#ea580c)` : 'var(--btn-ghost-bg)',
          border: plan.featured ? 'none' : `1px solid ${plan.color}33`,
          color: plan.featured ? '#fff' : 'var(--text)',
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
          boxShadow: plan.featured ? `0 8px 24px ${plan.glow}` : 'none',
          transition: 'all 0.25s', transform: 'translateZ(12px)',
          minHeight: 48,
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}>
          {plan.cta}
        </button>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" style={{ padding: 'clamp(60px,8vw,120px) clamp(16px,4vw,60px)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: 400, background: 'radial-gradient(ellipse,rgba(217,119,6,0.06),transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,72px)' }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: '#d97706', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>◆ Pricing</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', transition: 'color 0.4s' }}>
            Simple,{' '}
            <span style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Transparent</span>{' '}
            Pricing
          </h2>
        </div>

        {/* Responsive pricing grid: 1 col mobile → 3 col desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 20, alignItems: 'center', perspective: 1000 }}>
          {plans.map((p, i) => <PriceCard key={p.name} plan={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
