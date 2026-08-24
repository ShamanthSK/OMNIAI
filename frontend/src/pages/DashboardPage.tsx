import React from 'react';
import {
  Sparkles,
  GitCompare,
  FileText,
  Code,
  PenTool,
  HelpCircle,
  MessageSquare,
  Trash2,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Conversation, ProviderStatus } from '../types';
import { ProviderStatusWidget } from '../components/ProviderStatusWidget';

interface DashboardPageProps {
  conversations: Conversation[];
  providers: ProviderStatus[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: (mode: 'auto' | 'compare', prompt?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  conversations,
  providers,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  onNavigateTab
}) => {
  const quickActions = [
    {
      title: 'Compare Models',
      desc: 'Query Gemini, GPT, Claude & Grok side-by-side with OmniAI Synthesis.',
      icon: GitCompare,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
      action: () => onNewChat('compare')
    },
    {
      title: 'Analyze Document',
      desc: 'Upload PDF, DOCX, CSV or TXT for RAG knowledge questions.',
      icon: FileText,
      color: 'from-indigo-500/20 to-cyan-500/20 text-indigo-400 border-indigo-500/30',
      action: () => onNavigateTab('knowledge')
    },
    {
      title: 'Help Me Code',
      desc: 'Generates async microservices, bug fixes, & architectural designs.',
      icon: Code,
      color: 'from-cyan-500/20 to-emerald-500/20 text-cyan-400 border-cyan-500/30',
      action: () => onNewChat('auto', 'Help me write an efficient async REST API')
    },
    {
      title: 'Write & Edit',
      desc: 'Draft essays, blogs, executive summaries, & technical docs.',
      icon: PenTool,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      action: () => onNewChat('auto', 'Draft a high-impact executive summary')
    }
  ];

  return (
    <div className="w-full space-y-8 py-6 px-4 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 border border-white/10 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTELLIGENT WORKSPACE ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Welcome to OmniAI Workspace
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your intelligent workspace for reasoning, research, coding, and creativity powered by multi-model orchestration.
          </p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-wider text-slate-300 uppercase">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((qa, idx) => {
            const Icon = qa.icon;
            return (
              <div
                key={idx}
                onClick={qa.action}
                className={`rounded-xl bg-gradient-to-b ${qa.color} border p-4 space-y-2 cursor-pointer hover:scale-[1.02] transition-all shadow-lg`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900/80 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-100">{qa.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{qa.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Provider Fleet */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-wider text-slate-300 uppercase">Available AI Providers</h2>
        <ProviderStatusWidget providers={providers} />
      </div>

      {/* Recent Conversations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wider text-slate-300 uppercase">Recent Conversations</h2>
          <button
            onClick={() => onNewChat('auto')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
          >
            <span>Start New Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {conversations.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs border border-white/10">
            No recent conversations found. Start a new chat above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {conversations.map((c) => (
              <div
                key={c.id}
                className="glass-panel p-3.5 border border-white/10 hover:border-indigo-500/40 flex items-center justify-between cursor-pointer group transition-all"
                onClick={() => onSelectConversation(c.id)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(c.updated_at).toLocaleDateString()}</span>
                      <span className="uppercase text-[9px] px-1 rounded bg-slate-800 text-slate-400 ml-1">
                        {c.mode}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(c.id);
                  }}
                  className="p-1.5 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
