import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  MessageSquare,
  FileText,
  Book,
  Heart,
  Cloud,
  Edit,
  BarChart2
} from 'lucide-react';
import { ProviderStatus } from '../types';
import { ClickSpark } from '../components/ClickSpark';
import { SpecularButton } from '../components/SpecularButton';
import { GlassIcons } from '../components/GlassIcons';

interface LandingPageProps {
  onStartChat: (mode?: 'auto' | 'compare') => void;
  providers: ProviderStatus[];
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartChat, providers, onNavigateTab }) => {
  const [typedText, setTypedText] = useState('');
  const fullMessage = "OmniAI classifies user intent and routes queries to Gemini, OpenAI, Claude, and Grok. Consolidating consensus, spotting discrepancies, and checking for hallucinations in real-time.";

  // Streaming Text Animation Demo
  useEffect(() => {
    let index = 0;
    setTypedText('');
    const interval = setInterval(() => {
      setTypedText((prev) => prev + fullMessage.charAt(index));
      index++;
      if (index >= fullMessage.length) {
        setTimeout(() => {
          index = 0;
          setTypedText('');
        }, 4000);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // GlassIcons navigation items routing to relevant workspaces
  const glassItems = [
    { icon: <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />, color: 'blue', label: 'Files', onClick: () => onNavigateTab('knowledge') },
    { icon: <Book className="w-5 h-5 text-purple-500 dark:text-purple-400" />, color: 'purple', label: 'Books', onClick: () => onNavigateTab('knowledge') },
    { icon: <Heart className="w-5 h-5 text-red-500 dark:text-red-400" />, color: 'red', label: 'Health', onClick: () => onStartChat('auto') },
    { icon: <Cloud className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />, color: 'indigo', label: 'Weather', onClick: () => onStartChat('auto') },
    { icon: <Edit className="w-5 h-5 text-amber-500 dark:text-amber-400" />, color: 'orange', label: 'Notes', onClick: () => onStartChat('auto') },
    { icon: <BarChart2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />, color: 'green', label: 'Stats', onClick: () => onNavigateTab('dashboard') },
  ];

  return (
    <ClickSpark
      sparkColor="#a78bfa"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="w-full space-y-16 py-4 px-4 max-w-7xl mx-auto relative overflow-hidden bg-transparent">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-12 relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
            <span>MINIMALIST AI CHATBOT PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            One question.{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-indigo-300 bg-clip-text text-transparent">
              Multiple intelligences.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Unified multi-model AI agent workspace. Intelligently route tasks, retrieve knowledge vector contexts, and compare model outputs parallel with custom consensus synthesis.
          </p>

          <div className="pt-2 flex justify-center">
            {/* Specular Button CTA */}
            <SpecularButton
              size="lg"
              radius={18}
              tint="#ffffff"
              tintOpacity={0}
              blur={0}
              textColor="#ffffff"
              lineColor="#ffffff"
              baseColor="#6d28d9"
              intensity={1}
              shineSize={10}
              shineFade={40}
              thickness={1}
              speed={0.35}
              followMouse
              proximity={250}
              autoAnimate={false}
              onClick={() => onStartChat('auto')}
            >
              Get Started
            </SpecularButton>
          </div>
        </section>

        {/* Conversational UI Preview & Streaming Text Animation */}
        <section className="max-w-4xl mx-auto relative z-10">
          <div className="glass-panel border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden bg-white/90 dark:bg-slate-950/80">
            {/* Window header */}
            <div className="bg-slate-100 dark:bg-slate-900/90 px-4 py-2 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-[11px] font-mono text-slate-500">omniai_workspace_preview.tsx</span>
              <span className="w-4" />
            </div>

            {/* Conversation Grid Mockup */}
            <div className="p-4 space-y-4">
              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-violet-600 text-white text-xs px-4 py-2.5 rounded-2xl max-w-md shadow-md">
                  How does the OmniAI routing agent choose between multiple models?
                </div>
              </div>

              {/* Streaming Assistant Response */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  AI
                </div>
                <div className="flex-1 space-y-2 bg-slate-50 dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">OmniAI Agent</span>
                    <span className="text-[9px] uppercase bg-violet-500/20 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/30">
                      Auto Mode
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed min-h-[40px] font-mono">
                    {typedText}
                    <span className="w-1.5 h-4 bg-violet-500 dark:bg-violet-400 inline-block animate-pulse ml-0.5" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GlassIcons Interactive Grid */}
        <section className="max-w-3xl mx-auto relative z-10 space-y-3">
          <h3 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase text-center">
            Conversational Knowledge Nodes
          </h3>
          <div className="relative">
            <GlassIcons items={glassItems} className="custom-class" colorful={false} />
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="glass-panel p-6 space-y-3 border border-black/10 dark:border-white/10 hover:border-violet-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Intelligent Model Routing</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Auto Mode dynamically inspects prompt complexity and routes queries to the optimal configured provider for fast, low-latency execution.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3 border border-black/10 dark:border-white/10 hover:border-violet-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Consensus Synthesis</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Parallel execution in Compare Mode. OmniAI compares model outputs side-by-side, resolving contradictions and eliminating hallucinations.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3 border border-black/10 dark:border-white/10 hover:border-violet-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Contextual RAG Retrieval</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload custom reports, codebases, or PDFs. OmniAI splits text into semantic blocks, generates embeddings, and queries them instantly.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-black/5 dark:border-white/5 text-center text-xs text-slate-500 relative z-10">
          <p>© 2026 OmniAI Agent Platform. Satisfying Track 1 Customer-Facing Agent Requirements.</p>
        </footer>
      </div>
    </ClickSpark>
  );
};

export default LandingPage;
