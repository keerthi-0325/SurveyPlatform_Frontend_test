import { useRef, useCallback } from 'react';

/**
 * Returns event handlers and a ref that apply a CSS 3D tilt transform
 * based on mouse position relative to the element.
 *
 * @param {Object} options
 * @param {number} options.maxTilt   – max degrees of tilt (default 15)
 * @param {number} options.scale     – scale on hover (default 1.04)
 * @param {string} options.glare     – show glare layer (default true)
 */
export default function use3DTilt({ maxTilt = 15, scale = 1.04, perspective = 800 } = {}) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = -((y - centerY) / centerY) * maxTilt;

    el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale},${scale},${scale})`;
    el.style.transition = 'transform 0.05s linear';

    // Update glare layer
    const glare = el.querySelector('[data-glare]');
    if (glare) {
      const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 180;
      glare.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
      glare.style.opacity = '1';
    }
  }, [maxTilt, scale, perspective]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';

    const glare = el.querySelector('[data-glare]');
    if (glare) { glare.style.opacity = '0'; }
  }, [perspective]);

  return { ref, handleMouseMove, handleMouseLeave };
}
