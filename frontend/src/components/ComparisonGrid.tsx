import React from 'react';
import { Clock, AlertCircle, Copy, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ModelComparisonResult } from '../types';

interface ComparisonGridProps {
  results: ModelComparisonResult[];
}

export const ComparisonGrid: React.FC<ComparisonGridProps> = ({ results }) => {
  const providerColors: Record<string, string> = {
    gemini: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-300',
    openai: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    anthropic: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
    grok: 'from-purple-500/20 to-indigo-500/20 border-indigo-500/30 text-indigo-300',
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full space-y-3 my-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Cpu className="w-4 h-4 text-indigo-400" />
        <span>PARALLEL MODEL RUNS ({results.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((res, idx) => {
          const colorClass =
            providerColors[res.provider.toLowerCase()] ||
            'from-slate-800 to-slate-900 border-white/10 text-slate-300';

          return (
            <div
              key={idx}
              className={`rounded-xl bg-gradient-to-b ${colorClass} border p-4 flex flex-col justify-between space-y-3 shadow-lg`}
            >
              {/* Provider Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <span>{res.provider_name}</span>
                    {res.is_demo && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        DEMO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-75 font-mono">{res.model_name}</p>
                </div>

                <div className="flex items-center gap-1 text-[11px] opacity-80">
                  <Clock className="w-3 h-3" />
                  <span>{res.latency_ms}ms</span>
                </div>
              </div>

              {/* Response Content */}
              <div className="flex-1 text-xs leading-relaxed overflow-y-auto max-h-72 pr-1">
                {res.status === 'success' ? (
                  <div className="prose prose-invert max-w-none text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {res.response}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-400 p-2 bg-rose-950/40 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{res.error || 'Execution failed'}</span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="opacity-60">Status: {res.status}</span>
                <button
                  onClick={() => copyText(res.response)}
                  className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                  title="Copy model response"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
