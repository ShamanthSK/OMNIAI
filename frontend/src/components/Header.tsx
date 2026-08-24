import React from 'react';
import {
  Sparkles,
  MessageSquare,
  FileText,
  LayoutDashboard,
  Globe
} from 'lucide-react';
import { ProviderStatus } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  providers: ProviderStatus[];
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab
}) => {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Globe },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'knowledge', label: 'Knowledge', icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Tagline */}
        <div
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                OMNIAI
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PROD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              One question. Multiple intelligences.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-white/10 p-1 rounded-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Header Right spacer (removes status badge and theme toggles) */}
        <div className="w-4 h-4" />
      </div>

      {/* Mobile Navigation Row */}
      <div className="flex md:hidden items-center justify-around mt-2 pt-2 border-t border-white/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-1 text-[10px] ${
                active ? 'text-indigo-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

export default Header;
