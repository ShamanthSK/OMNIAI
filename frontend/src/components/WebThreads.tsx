import React, { useRef, useEffect } from 'react';

interface WebThreadsProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  threadCount?: number;
  frequency?: number;
  spread?: number;
  taper?: number;
  position?: number;
  fanMode?: 'center' | 'left' | 'right';
  glow?: number;
  falloff?: number;
  thickness?: number;
  brightness?: number;
  opacity?: number;
  mirror?: boolean;
  shimmer?: boolean;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
}

export const WebThreads: React.FC<WebThreadsProps> = ({
  color1 = "#5227FF",
  color2 = "#FF9FFC",
  color3 = "#FFFFFF",
  speed = 0.2,
  threadCount = 6,
  frequency = 5,
  spread = 0.18,
  taper = 1,
  position = 0.5,
  fanMode = "center",
  glow = 0.02,
  falloff = 0.6,
  thickness = 1.1,
  brightness = 0.6,
  opacity = 1,
  mirror = true,
  shimmer = false,
  grain = true,
  grainIntensity = 0.05,
  mouseInteraction = true,
  mouseStrength = 0.3
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += speed * 0.05;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // WebThreads Drawing
      for (let i = 0; i < threadCount; i++) {
        ctx.beginPath();
        const offset = i * spread * 100;
        const colorGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        colorGrad.addColorStop(0, color1);
        colorGrad.addColorStop(0.5, color2);
        colorGrad.addColorStop(1, color3);

        ctx.strokeStyle = colorGrad;
        ctx.lineWidth = thickness;
        ctx.globalAlpha = opacity * brightness;

        if (glow > 0) {
          ctx.shadowBlur = glow * 100;
          ctx.shadowColor = color2;
        }

        const centerY = canvas.height * position;

        for (let x = 0; x < canvas.width; x++) {
          const sineVal = Math.sin(x * 0.005 * frequency + time + offset);
          let y = centerY + sineVal * 40 * taper;

          // Mouse Interaction pull effect
          if (mouseInteraction) {
            const dx = x - mouseRef.current.x;
            const dy = y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              const pull = (1 - dist / 150) * mouseStrength * 50;
              y += Math.sin(time) * pull;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Mirror Threading
        if (mirror) {
          ctx.beginPath();
          for (let x = 0; x < canvas.width; x++) {
            const sineVal = Math.sin(x * 0.005 * frequency + time + offset);
            let y = centerY - sineVal * 40 * taper;

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      }

      // Add Film Grain overlay if enabled
      if (grain) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const rand = (Math.random() - 0.5) * grainIntensity * 255;
          data[i] = Math.min(255, Math.max(0, data[i] + rand));
          data[i+1] = Math.min(255, Math.max(0, data[i+1] + rand));
          data[i+2] = Math.min(255, Math.max(0, data[i+2] + rand));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    color1, color2, color3, speed, threadCount, frequency, spread, taper,
    position, fanMode, glow, falloff, thickness, brightness, opacity,
    mirror, shimmer, grain, grainIntensity, mouseInteraction, mouseStrength
  ]);

  return <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 pointer-events-none" />;
};

export default WebThreads;
