import React from 'react';
import { Cpu, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { ProviderStatus } from '../types';

interface ProviderStatusWidgetProps {
  providers: ProviderStatus[];
}

export const ProviderStatusWidget: React.FC<ProviderStatusWidgetProps> = ({ providers }) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {providers.map((p) => {
        const isConfigured = p.configured;

        return (
          <div
            key={p.id}
            className="glass-panel p-3.5 flex flex-col justify-between space-y-2 border border-white/10 hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-sm text-slate-100">{p.name}</span>
              </div>
              <div
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {isConfigured ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Configured</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>Demo Mode</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 font-mono">{p.model}</p>

            <div className="flex flex-wrap gap-1 pt-1">
              {p.capabilities.slice(0, 3).map((cap, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-slate-900 border border-white/5 text-slate-300 px-1.5 py-0.5 rounded"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
