import React from 'react';

const FACE_STYLES = {
  front:  { transform: 'translateZ(16px)' },
  back:   { transform: 'rotateY(180deg) translateZ(16px)' },
  right:  { transform: 'rotateY(90deg)  translateZ(16px)' },
  left:   { transform: 'rotateY(-90deg) translateZ(16px)' },
  top:    { transform: 'rotateX(90deg)  translateZ(16px)' },
  bottom: { transform: 'rotateX(-90deg) translateZ(16px)' },
};

const faceGrads = {
  front:  'linear-gradient(135deg,#7c3aed,#4f46e5)',
  back:   'linear-gradient(135deg,#4f46e5,#2563eb)',
  right:  'linear-gradient(135deg,#2563eb,#059669)',
  left:   'linear-gradient(135deg,#059669,#d97706)',
  top:    'linear-gradient(135deg,#d97706,#ea580c)',
  bottom: 'linear-gradient(135deg,#ea580c,#dc2626)',
};

export default function CubeLogo({ size = 32, animate = true }) {
  const half = size / 2;

  return (
    <div style={{
      width: size, height: size,
      perspective: size * 6,
      perspectiveOrigin: '50% 50%',
      flexShrink: 0,
    }}>
      <div style={{
        width: size, height: size,
        position: 'relative',
        transformStyle: 'preserve-3d',
        animation: animate ? 'rotateCube 6s linear infinite' : 'none',
      }}>
        {Object.entries(FACE_STYLES).map(([face, style]) => (
          <div key={face} style={{
            position: 'absolute',
            width: size, height: size,
            background: faceGrads[face],
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: size * 0.2,
            ...style,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {face === 'front' && (
              <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8 3v10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
