'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './hero-canvas.module.css';

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
  layer: number;
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();

    // Initialize particles
    const initializeParticles = () => {
      particlesRef.current = Array.from({ length: 60 }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 80 + Math.random() * 140,
        speed: 0.0003 + Math.random() * 0.0005,
        size: 0.8 + Math.random() * 1.8,
        opacity: 0.15 + Math.random() * 0.45,
        layer: Math.floor(Math.random() * 3),
      }));
    };

    initializeParticles();

    // Get canvas center
    const getCenter = () => ({
      x: canvas.width / (2 * window.devicePixelRatio),
      y: canvas.height / (2 * window.devicePixelRatio),
    });

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationFrameId: number;

    const animate = () => {
      const center = getCenter();
      const rect = canvas.getBoundingClientRect();

      // Calculate dampened offset
      const offsetX = (mousePos.x - rect.width / 2) * 0.04;
      const offsetY = (mousePos.y - rect.height / 2) * 0.04;

      const originX = center.x + offsetX;
      const originY = center.y + offsetY;

      const t = frameRef.current++;

      // Clear canvas
      ctx.fillStyle = 'rgb(25, 16, 15)';
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      // Background glow
      const glowGradient = ctx.createRadialGradient(originX, originY, 0, originX, originY, 200);
      glowGradient.addColorStop(0, 'rgba(195, 106, 58, 0.09)');
      glowGradient.addColorStop(0.5, 'rgba(126, 25, 70, 0.05)');
      glowGradient.addColorStop(1, 'rgba(25, 16, 15, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(originX, originY, 200, 0, Math.PI * 2);
      ctx.fill();

      // Draw concentric rings
      const rings = [
        { radius: 180, stroke: 'rgba(255, 251, 242, 0.07)', width: 1 },
        { radius: 130, stroke: 'rgba(255, 251, 242, 0.14)', width: 1 },
        { radius: 85, stroke: 'rgba(255, 251, 242, 0.22)', width: 1.5 },
        { radius: 45, stroke: 'rgba(255, 251, 242, 0.5)', width: 2 },
      ];

      rings.forEach(({ radius, stroke, width }) => {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.arc(originX, originY, radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Animated accent arcs
      ctx.lineCap = 'round';

      // Outer accent arc
      const outerStartAngle = Math.PI * 0.1 + Math.sin(t * 0.0004) * 0.2;
      const outerEndAngle = Math.PI * 0.9 + Math.sin(t * 0.0004) * 0.2;
      ctx.strokeStyle = '#c36a3a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(originX, originY, 85, outerStartAngle, outerEndAngle);
      ctx.stroke();

      // Inner accent arc
      const innerStartAngle = Math.PI * 0.2 - Math.sin(t * 0.0003) * 0.15;
      const innerEndAngle = Math.PI * 0.8 - Math.sin(t * 0.0003) * 0.15;
      ctx.strokeStyle = '#ad4f69';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(originX, originY, 45, innerStartAngle, innerEndAngle);
      ctx.stroke();

      // Center core glow
      const coreGradient = ctx.createRadialGradient(originX, originY, 0, originX, originY, 18);
      coreGradient.addColorStop(0, 'rgba(195, 106, 58, 0.7)');
      coreGradient.addColorStop(1, 'rgba(195, 106, 58, 0)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(originX, originY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Center core dot
      ctx.fillStyle = '#c36a3a';
      ctx.beginPath();
      ctx.arc(originX, originY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw particles
      const particles = particlesRef.current;
      const particlePositions: Array<{ x: number; y: number }> = [];

      particles.forEach((particle) => {
        const x = originX + Math.cos(particle.angle + t * particle.speed * (particle.layer + 1)) * particle.radius;
        const y = originY + Math.sin(particle.angle + t * particle.speed * (particle.layer + 1)) * particle.radius * (0.55 + particle.layer * 0.1);

        const alpha = particle.opacity * (0.7 + 0.3 * Math.sin(t * 0.0008 + particle.angle));

        const layerColors = [
          `rgba(195, 106, 58, ${alpha})`,
          `rgba(173, 79, 105, ${alpha})`,
          `rgba(196, 163, 137, ${alpha})`,
        ];

        ctx.fillStyle = layerColors[particle.layer];
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        particlePositions.push({ x, y });
      });

      // Draw connection lines
      ctx.strokeStyle = 'rgba(195, 106, 58, 0.12)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particlePositions.length; i++) {
        for (let j = i + 1; j < particlePositions.length; j++) {
          const dx = particlePositions[j].x - particlePositions[i].x;
          const dy = particlePositions[j].y - particlePositions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 65) {
            const opacity = (1 - distance / 65) * 0.12;
            ctx.strokeStyle = `rgba(195, 106, 58, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particlePositions[i].x, particlePositions[i].y);
            ctx.lineTo(particlePositions[j].x, particlePositions[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
