import React from 'react';
import { Settings, Moon, Sun, Trash2 } from 'lucide-react';
import { ProviderStatus, ExecutionMode } from '../types';

interface SettingsPageProps {
  providers: ProviderStatus[];
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  defaultMode: ExecutionMode;
  setDefaultMode: (m: ExecutionMode) => void;
  defaultModel: string;
  setDefaultModel: (m: string) => void;
  onClearHistory: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  theme,
  setTheme,
  onClearHistory
}) => {
  return (
    <div className="w-full space-y-8 py-6 px-4 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-black/10 dark:border-white/10 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Configure appearance theme and manage local session transcripts.
        </p>
      </div>

      {/* Appearance Theme Card */}
      <div className="glass-panel p-5 space-y-3 border border-black/10 dark:border-white/10 bg-white/90 dark:bg-slate-950/80">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Appearance Theme</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              theme === 'dark'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-black/5 dark:border-white/10 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
            Dark Mode (Default Workspace)
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              theme === 'light'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-black/5 dark:border-white/10 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500 dark:text-amber-300" />
            Light Mode
          </button>
        </div>
      </div>

      {/* Danger Zone / Privacy Card */}
      <div className="glass-panel p-5 border border-rose-500/30 bg-white/90 dark:bg-slate-950/80 space-y-3">
        <h3 className="text-sm font-bold text-rose-600 dark:text-rose-300">Privacy & Data Control</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Delete all stored conversation transcripts and message history permanently.
        </p>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Conversation History</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
