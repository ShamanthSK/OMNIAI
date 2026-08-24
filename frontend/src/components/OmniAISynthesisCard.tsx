import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SynthesisData } from '../types';

interface OmniAISynthesisCardProps {
  synthesis: SynthesisData;
}

export const OmniAISynthesisCard: React.FC<OmniAISynthesisCardProps> = ({ synthesis }) => {
  const uncertaintyColors = {
    Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    High: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 p-5 shadow-2xl space-y-4 my-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-300">
              OMNIAI SYNTHESIS
            </h3>
            <p className="text-xs text-slate-400">
              Intelligent multi-model consensus & discrepancy breakdown
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold ${uncertaintyColors[synthesis.uncertainty_level]}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Uncertainty: {synthesis.uncertainty_level}</span>
        </div>
      </div>

      {/* Structured Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Agreements */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Consensus Points ({synthesis.agreements.length})</span>
          </div>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            {synthesis.agreements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Discrepancies */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Model Differences ({synthesis.discrepancies.length})</span>
          </div>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            {synthesis.discrepancies.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Combined Unified Answer */}
      <div className="pt-2 border-t border-white/10">
        <h4 className="text-xs font-semibold text-slate-400 mb-2">FINAL COMBINED RESPONSE</h4>
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {synthesis.combined_answer}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
