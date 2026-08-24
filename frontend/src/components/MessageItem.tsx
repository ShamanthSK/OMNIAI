import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  FileText,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { ComparisonGrid } from './ComparisonGrid';
import { OmniAISynthesisCard } from './OmniAISynthesisCard';
import { api } from '../services/api';

interface MessageItemProps {
  message: Message;
  onRegenerate?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (isHelpful: boolean) => {
    setFeedbackState(isHelpful ? 'up' : 'down');
    api.sendFeedback(message.id, isHelpful).catch(() => {});
  };

  return (
    <div className={`w-full py-4 px-4 border-b border-white/5 ${isUser ? 'bg-slate-900/30' : 'bg-slate-950/60'}`}>
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {/* Header Info (for Assistant) */}
          {!isUser && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-xs text-white">OmniAI Agent</span>

              {message.provider_used && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {message.provider_used}
                </span>
              )}

              {message.task_category && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {message.task_category}
                </span>
              )}

              {message.is_demo && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Mode
                </span>
              )}
            </div>
          )}

          {/* Routing Reason Banner */}
          {!isUser && message.routing_reason && (
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1.5 rounded-lg w-fit">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{message.routing_reason}</span>
            </div>
          )}

          {/* RAG Citations Pill */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="space-y-1 my-2">
              <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Knowledge Sources ({message.citations.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((c, i) => (
                  <div
                    key={i}
                    className="text-[11px] bg-slate-900 border border-indigo-500/30 text-slate-300 px-2.5 py-1 rounded-md shadow-sm"
                  >
                    <span className="font-semibold text-indigo-400">{c.filename}</span> (Chunk #{c.chunk_index + 1}) — Score: {(c.score * 100).toFixed(0)}%
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parallel Model Comparison Grid (if mode == compare) */}
          {!isUser && message.comparison_results && message.comparison_results.length > 0 && (
            <ComparisonGrid results={message.comparison_results} />
          )}

          {/* OmniAI Synthesis Card */}
          {!isUser && message.synthesis && (
            <OmniAISynthesisCard synthesis={message.synthesis} />
          )}

          {/* Main Markdown Text Content */}
          {(!message.synthesis || isUser) && (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Assistant Action Toolbar */}
          {!isUser && (
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}

              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => handleFeedback(true)}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                    feedbackState === 'up' ? 'text-emerald-400' : 'hover:text-slate-200'
                  }`}
                  title="Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                    feedbackState === 'down' ? 'text-rose-400' : 'hover:text-slate-200'
                  }`}
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
