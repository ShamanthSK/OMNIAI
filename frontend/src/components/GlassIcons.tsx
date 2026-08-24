import React from 'react';

interface GlassIconItem {
  icon: React.ReactNode;
  color: string;
  label: string;
  onClick?: () => void;
}

interface GlassIconsProps {
  items: GlassIconItem[];
  className?: string;
  colorful?: boolean;
}

export const GlassIcons: React.FC<GlassIconsProps> = ({
  items,
  className = "",
  colorful = false
}) => {
  const colorMap: Record<string, string> = {
    blue: 'hover:border-blue-500/50 hover:shadow-blue-500/20 text-blue-400',
    purple: 'hover:border-purple-500/50 hover:shadow-purple-500/20 text-purple-400',
    red: 'hover:border-rose-500/50 hover:shadow-rose-500/20 text-rose-400',
    indigo: 'hover:border-indigo-500/50 hover:shadow-indigo-500/20 text-indigo-400',
    orange: 'hover:border-amber-500/50 hover:shadow-amber-500/20 text-amber-400',
    green: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20 text-emerald-400',
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 p-4 ${className}`}>
      {items.map((item, idx) => {
        const glowClass = colorMap[item.color] || 'hover:border-violet-500/50 hover:shadow-violet-500/20 text-violet-400';

        return (
          <div
            key={idx}
            onClick={item.onClick}
            className={`glass-panel p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-lg w-24 h-24 ${
              colorful ? 'bg-slate-900/90' : 'bg-slate-950/80'
            } border border-white/10 ${glowClass}`}
          >
            <div className="text-2xl">{item.icon}</div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 hover:text-white">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default GlassIcons;
