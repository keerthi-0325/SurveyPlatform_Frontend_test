import React from 'react';
import use3DTilt from '../hooks/use3DTilt';

export default function TiltCard({ children, maxTilt = 12, scale = 1.03, perspective = 900, style = {}, className = '' }) {
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt({ maxTilt, scale, perspective });

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        position: 'relative',
        ...style,
      }}
      className={className}
    >
      {/* Glare overlay */}
      <div
        data-glare="true"
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 'inherit',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'opacity 0.3s',
        }}
      />
      {children}
    </div>
  );
}
