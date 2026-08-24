import React, { useRef, useEffect } from 'react';

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  resistance?: number;
  returnDuration?: number;
}

interface Dot {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
}

export const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 5,
  gap = 15,
  baseColor = "#2F293A",
  activeColor = "#5227FF",
  proximity = 120,
  shockRadius = 250,
  shockStrength = 5,
  resistance = 750,
  returnDuration = 1.5
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const dotsRef = useRef<Dot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize Grid dots
    const initGrid = () => {
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : window.innerWidth;
      const height = parent ? parent.clientHeight : window.innerHeight;
      
      canvas.width = width;
      canvas.height = height;

      const cols = Math.floor(width / gap);
      const rows = Math.floor(height / gap);
      const newDots: Dot[] = [];

      // Calculate centering offsets
      const offsetX = (width - cols * gap) / 2 + gap / 2;
      const offsetY = (height - rows * gap) / 2 + gap / 2;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = offsetX + c * gap;
          const y = offsetY + r * gap;
          newDots.push({
            x,
            y,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0
          });
        }
      }

      dotsRef.current = newDots;
    };

    initGrid();
    window.addEventListener('resize', initGrid);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dots = dotsRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      dots.forEach((dot) => {
        const dx = dot.targetX - mx;
        const dy = dot.targetY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Physics: shock/displacement away from cursor inside shockRadius
        if (dist < shockRadius) {
          const force = (1 - dist / shockRadius) * shockStrength;
          // Calculate displacement angle
          const angle = Math.atan2(dy, dx);
          dot.vx += Math.cos(angle) * force;
          dot.vy += Math.sin(angle) * force;
        }

        // Return force back to target coordinates
        const returnForceX = (dot.targetX - dot.x) / (returnDuration * 60);
        const returnForceY = (dot.targetY - dot.y) / (returnDuration * 60);
        dot.vx += returnForceX;
        dot.vy += returnForceY;

        // Apply friction/resistance damping
        dot.vx *= (1 - 10 / resistance);
        dot.vy *= (1 - 10 / resistance);

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize / 2, 0, 2 * Math.PI);

        // Blending colors based on proximity
        if (dist < proximity) {
          const ratio = 1 - dist / proximity;
          ctx.fillStyle = activeColor;
          ctx.globalAlpha = 0.4 + 0.6 * ratio;
        } else {
          ctx.fillStyle = baseColor;
          ctx.globalAlpha = 0.35;
        }

        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', initGrid);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    dotSize, gap, baseColor, activeColor, proximity,
    shockRadius, shockStrength, resistance, returnDuration
  ]);

  return <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 pointer-events-none" />;
};

export default DotGrid;
