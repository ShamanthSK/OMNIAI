import React, { useRef, useEffect, useState } from 'react';

interface Spark {
  x: number;
  y: number;
  angle: number;
  speed: number;
  alpha: number;
}

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  children: React.ReactNode;
}

export const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = "#ffffff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = Date.now();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      sparks.forEach((spark) => {
        const currentRadius = progress * sparkRadius;
        const x = spark.x + Math.cos(spark.angle) * currentRadius;
        const y = spark.y + Math.sin(spark.angle) * currentRadius;
        const alpha = 1 - progress;

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = sparkSize * (1 - progress);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(spark.angle) * 4, y - Math.sin(spark.angle) * 4);
        ctx.lineTo(x + Math.cos(spark.angle) * 4, y + Math.sin(spark.angle) * 4);
        ctx.stroke();
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        setSparks([]);
      }
    };

    if (sparks.length > 0) {
      startTime = Date.now();
      draw();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [sparks, sparkColor, sparkSize, sparkRadius, duration]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparks: Spark[] = [];
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i * 2 * Math.PI) / sparkCount;
      newSparks.push({
        x,
        y,
        angle,
        speed: 1,
        alpha: 1
      });
    }

    setSparks(newSparks);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full h-full"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-50 w-full h-full"
      />
      {children}
    </div>
  );
};

export default ClickSpark;
