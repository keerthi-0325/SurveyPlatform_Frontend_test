import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    let animId;
    const init = async () => {
      const THREE = await import('three');
      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      const COUNT = 1800;
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      const sizes = new Float32Array(COUNT);
      const velocities = new Float32Array(COUNT * 3);

      const colorPalette = [
        new THREE.Color('#7c3aed'), new THREE.Color('#4f46e5'),
        new THREE.Color('#2563eb'), new THREE.Color('#059669'),
        new THREE.Color('#d97706'),
      ];

      for (let i = 0; i < COUNT; i++) {
        positions[i*3]   = (Math.random()-0.5)*20;
        positions[i*3+1] = (Math.random()-0.5)*20;
        positions[i*3+2] = (Math.random()-0.5)*10;
        sizes[i] = Math.random()*2.5+0.5;
        velocities[i*3]   = (Math.random()-0.5)*0.002;
        velocities[i*3+1] = (Math.random()-0.5)*0.002;
        const col = colorPalette[Math.floor(Math.random()*colorPalette.length)];
        colors[i*3] = col.r; colors[i*3+1] = col.g; colors[i*3+2] = col.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

      const mat = new THREE.PointsMaterial({
        size: 0.04, vertexColors: true, transparent: true,
        opacity: 0.75, sizeAttenuation: true,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      let mouseX = 0, mouseY = 0;
      const mh = (e) => { mouseX = (e.clientX/window.innerWidth-0.5)*2; mouseY = -(e.clientY/window.innerHeight-0.5)*2; };
      window.addEventListener('mousemove', mh);

      const rh = () => { camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
      window.addEventListener('resize', rh);

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const pos = geo.attributes.position.array;
        for (let i = 0; i < COUNT; i++) {
          pos[i*3]   += velocities[i*3];
          pos[i*3+1] += velocities[i*3+1];
          if (pos[i*3]>10) pos[i*3]=-10;
          if (pos[i*3]<-10) pos[i*3]=10;
          if (pos[i*3+1]>10) pos[i*3+1]=-10;
          if (pos[i*3+1]<-10) pos[i*3+1]=10;
        }
        geo.attributes.position.needsUpdate = true;
        points.rotation.x += (mouseY*0.08 - points.rotation.x)*0.04;
        points.rotation.y += (mouseX*0.08 - points.rotation.y)*0.04;
        points.rotation.z += 0.0003;
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', mh);
        window.removeEventListener('resize', rh);
        renderer.dispose();
      };
    };

    const cleanup = init();
    return () => { cleanup.then(fn => fn && fn()); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      pointerEvents: 'none', zIndex: 0,
      opacity: isDark ? 0.7 : 0.25,
      transition: 'opacity 0.6s ease',
    }} />
  );
}
