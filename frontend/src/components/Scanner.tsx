import React, { useRef, useEffect } from 'react';

interface ScannerProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  sweepSpeed?: number;
  sweepWidth?: number;
  sweepFalloff?: number;
  scale?: number;
  frequency?: number;
  ripple?: number;
  bandDensity?: number;
  lineSharpness?: number;
  glow?: number;
  scanDirection?: 'vertical' | 'horizontal';
  colorSpread?: number;
  brightness?: number;
  contrast?: number;
  softness?: number;
  vignette?: number;
  scanline?: boolean;
  grain?: boolean;
  grainIntensity?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  mouseRadius?: number;
  mouseStrength?: number;
}

export const Scanner: React.FC<ScannerProps> = ({
  color1 = "#5227FF",
  color2 = "#FF9FFC",
  color3 = "#FFFFFF",
  speed = 0.85,
  sweepSpeed = 0.25,
  sweepWidth = 1.6,
  scale = 1.5,
  frequency = 2,
  ripple = 0.22,
  glow = 0.22,
  brightness = 1,
  grain = true,
  grainIntensity = 0.03,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.5
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

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
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    let animationFrameId: number;
    let time = 0;

    const draw = () => {
      time += speed * 0.02;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const waveCount = 5;
      const centerY = canvas.height * 0.8; // Render waves towards the bottom as in screenshot 3

      // Draw Calm Scanning Signal Waves
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        
        // Multi-color gradient for the wave lines
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, color1);
        grad.addColorStop(0.5, color2);
        grad.addColorStop(1, color3);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5 * scale * (1 - w * 0.15);
        ctx.globalAlpha = opacity * brightness * (0.8 - w * 0.12);

        // Apply glow effect
        if (glow > 0) {
          ctx.shadowBlur = glow * 30;
          ctx.shadowColor = color2;
        }

        const waveOffset = w * 0.4;
        const amplitude = 35 * ripple * (waveCount - w);

        for (let x = 0; x < canvas.width; x += 2) {
          // Sine wave formula creating parallel fluid scanning signal paths
          const angle = x * 0.003 * frequency + time + waveOffset;
          let y = centerY + Math.sin(angle) * amplitude;

          // Mouse warp pull interaction
          if (mouseInteraction && mouseRef.current.active) {
            const dx = x - mouseRef.current.x;
            const dist = Math.abs(dx);
            if (dist < 200) {
              const pull = (1 - dist / 200) * mouseStrength * 40;
              y += Math.sin(time + w) * pull;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
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

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    color1, color2, color3, speed, sweepWidth, scale, frequency, ripple, glow,
    brightness, grain, grainIntensity, opacity, mouseInteraction, mouseStrength
  ]);

  return <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 pointer-events-none" />;
};

export default Scanner;
