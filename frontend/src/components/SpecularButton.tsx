import React, { useRef, useState, useEffect } from 'react';

interface SpecularButtonProps {
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const SpecularButton: React.FC<SpecularButtonProps> = ({
  size = 'md',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  onClick,
  children
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [shinePos, setShinePos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!followMouse) return;

    const handleMouseMove = (e: MouseEvent) => {
      const btn = btnRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < proximity) {
        setShinePos({ x, y });
      } else {
        setShinePos({ x: -200, y: -200 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [followMouse, proximity]);

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-sm font-bold tracking-wide uppercase'
  };

  // Check if baseColor is the default requested gray, if so, render a beautiful glassmorphic gradient button
  const isDefaultGray = baseColor === '#525252';
  const customBg = isDefaultGray 
    ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)' 
    : baseColor;

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden cursor-pointer shadow-xl border transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-violet-500/10 hover:border-violet-400/40 ${sizeClasses[size]}`}
      style={{
        borderRadius: `${radius}px`,
        background: customBg,
        color: isDefaultGray ? '#ffffff' : textColor,
        borderColor: isDefaultGray ? 'rgba(255,255,255,0.18)' : lineColor,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Specular Shine Highlight Reflection */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? intensity : 0.4 * intensity,
          background: `radial-gradient(circle ${shineSize * 18}px at ${shinePos.x}px ${shinePos.y}px, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) ${shineFade}%)`
        }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-1.5">
        {children}
      </span>
    </button>
  );
};

export default SpecularButton;
