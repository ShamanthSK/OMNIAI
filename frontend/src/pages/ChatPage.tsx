import React, { useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Message, Conversation, DocumentItem, ExecutionMode } from '../types';
import { MessageItem } from '../components/MessageItem';
import { Composer } from '../components/Composer';
import { OrbitLoader } from '../components/OrbitLoader';

interface ChatPageProps {
  conversations: Conversation[];
  activeConversation: (Conversation & { messages: Message[] }) | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onSendMessage: (prompt: string, mode: ExecutionMode, model?: string, docIds?: string[]) => void;
  isLoading: boolean;
  onStop?: () => void;
  loadingStatus: string;
  availableDocs: DocumentItem[];
  onDocumentUploaded?: (doc: DocumentItem) => void;
  defaultMode?: ExecutionMode;
  onClearHistory?: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSendMessage,
  isLoading,
  onStop,
  loadingStatus,
  availableDocs,
  onDocumentUploaded,
  defaultMode = 'auto',
  onClearHistory
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isLoading]);

  return (
    <div className="w-full h-[calc(100vh-65px)] flex overflow-hidden">
      {/* Conversation Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/80 flex flex-col hidden md:flex">
        <div className="p-3 border-b border-white/10">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => {
            const isActive = activeConversation?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-600/30 border border-indigo-500/40 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                  <span className="truncate">{c.title}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Clear conversations history action in sidebar */}
        {conversations.length > 0 && onClearHistory && (
          <div className="p-3 border-t border-white/10">
            <button
              onClick={onClearHistory}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-xs font-semibold transition-all"
              title="Delete all stored chat histories permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-slate-950/40 overflow-hidden">
        <div className="py-2.5 px-4 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-slate-200">
              {activeConversation ? activeConversation.title : 'OmniAI Agent Workspace'}
            </span>
            {activeConversation && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Mode: {activeConversation.mode}
              </span>
            )}
          </div>

          <button
            onClick={onNewConversation}
            className="md:hidden text-xs text-indigo-400 font-semibold"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (!activeConversation || activeConversation.messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <OrbitLoader statusText={loadingStatus} />
            </div>
          ) : (!activeConversation || activeConversation.messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-lg font-bold text-slate-100">How can OmniAI help you today?</h3>
                <p className="text-xs text-slate-400">
                  Select Auto mode for intelligent model routing, or select models directly under Single direct option.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {activeConversation.messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="py-4 px-4 bg-slate-950/60 border-b border-white/5 flex justify-center">
                  <OrbitLoader statusText={loadingStatus} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Composer */}
        <div className="p-2 border-t border-white/10 bg-slate-950/90">
          <Composer
            onSend={onSendMessage}
            isLoading={isLoading}
            onStop={onStop}
            availableDocs={availableDocs}
            onDocumentUploaded={onDocumentUploaded}
            defaultMode={defaultMode}
          />
        </div>
      </main>
    </div>
  );
};
export default ChatPage;
