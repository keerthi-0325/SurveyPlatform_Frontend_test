import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ring, setRing] = useState({ x: -100, y: -100 });
  const [clicking, setClicking] = useState(false);

  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  useEffect(() => {
    if (isTouch) return; // ✅ moved inside hook

    let rx = -100, ry = -100;
    let mx = -100, my = -100;
    let rafId;

    const lerp = (a, b, t) => a + (b - a) * t;

    const move = (e) => { mx = e.clientX; my = e.clientY; };
    const down = () => setClicking(true);
    const up = () => setClicking(false);

    const tick = () => {
      rx = lerp(rx, mx, 0.12);
      ry = lerp(ry, my, 0.12);
      setPos({ x: mx, y: my });
      setRing({ x: rx, y: ry });
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      cancelAnimationFrame(rafId);
    };
  }, [isTouch]);

  // ✅ safe to conditionally return AFTER hooks
  if (isTouch) return null;

  return (
    <>
      <div style={{
        position: 'fixed', zIndex: 9999, pointerEvents: 'none',
        width: clicking ? 4 : 8, height: clicking ? 4 : 8,
        background: '#7c3aed',
        borderRadius: '50%',
        left: pos.x, top: pos.y,
        transform: 'translate(-50%,-50%)',
        transition: 'width 0.15s, height 0.15s',
        mixBlendMode: 'screen',
      }} />
      <div style={{
        position: 'fixed', zIndex: 9998, pointerEvents: 'none',
        width: clicking ? 20 : 32, height: clicking ? 20 : 32,
        border: '1.5px solid rgba(124,58,237,0.6)',
        borderRadius: '50%',
        left: ring.x, top: ring.y,
        transform: 'translate(-50%,-50%)',
        transition: 'width 0.3s, height 0.3s',
      }} />
    </>
  );
}