import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import {
  ProviderStatus,
  DocumentItem,
  Conversation,
  Message,
  ExecutionMode
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const theme = 'dark';
  const setTheme = () => {};
  const [defaultMode, setDefaultMode] = useState<ExecutionMode>('auto');
  const [defaultModel, setDefaultModel] = useState<string>('gemini');

  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<
    (Conversation & { messages: Message[] }) | null
  >(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  
  // Abort Controller for stopping mid-generation
  const [activeAbortController, setActiveAbortController] = useState<AbortController | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    loadProviders();
    loadDocuments();
    loadConversations();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await api.getProvidersStatus();
      setProviders(data);
    } catch {
      setProviders([
        { id: 'gemini', name: 'Google Gemini', model: 'gemini-3.6-flash', configured: false, status: 'demo', capabilities: ['general', 'multimodal'], description: '' },
        { id: 'gemma', name: 'Google Gemma', model: 'gemma-4-31b-it', configured: false, status: 'demo', capabilities: ['coding', 'reasoning'], description: '' },
        { id: 'paligemma', name: 'Google PaliGemma', model: 'paligemma', configured: false, status: 'demo', capabilities: ['vision', 'multimodal'], description: '' },
        { id: 'nemotron-llama', name: 'NVIDIA Llama Nemotron', model: 'llama-3.1-nemotron-70b', configured: false, status: 'demo', capabilities: ['reasoning', 'writing'], description: '' },
        { id: 'nemotron-4', name: 'NVIDIA Nemotron 4', model: 'nemotron-4-340b', configured: false, status: 'demo', capabilities: ['coding', 'reasoning'], description: '' }
      ]);
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch {}
  };

  const loadConversations = async () => {
    try {
      const convs = await api.listConversations();
      setConversations(convs);
    } catch {}
  };

  const handleSelectConversation = async (id: string) => {
    try {
      const detail = await api.getConversation(id);
      setActiveConversation(detail);
      setCurrentTab('chat');
    } catch {}
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
    setCurrentTab('chat');
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations(conversations.filter((c) => c.id !== id));
      if (activeConversation?.id === id) {
        setActiveConversation(null);
      }
    } catch {}
  };

  const handleSendMessage = async (
    prompt: string,
    mode: ExecutionMode,
    model?: string,
    docIds?: string[]
  ) => {
    setIsLoading(true);
    if (mode === 'compare') {
      setLoadingStatus('Consulting multiple AI models in parallel...');
    } else if (docIds && docIds.length > 0) {
      setLoadingStatus('Searching knowledge base for relevant RAG context...');
    } else {
      setLoadingStatus('OmniAI Agent classifying request and routing to optimal model...');
    }

    const controller = new AbortController();
    setActiveAbortController(controller);

    try {
      const response = await api.sendChatMessage({
        conversation_id: activeConversation?.id,
        prompt,
        mode,
        selected_model: model,
        document_ids: docIds
      }, controller.signal);

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: prompt,
        mode,
        selected_model: model,
        created_at: new Date().toISOString()
      };

      if (activeConversation) {
        setActiveConversation({
          ...activeConversation,
          messages: [...activeConversation.messages, userMsg, response]
        });
      } else if (response.conversation_id) {
        const detail = await api.getConversation(response.conversation_id);
        setActiveConversation(detail);
      }

      await loadConversations();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Ignored, handled by handleStop
      } else {
        alert(`Error sending message: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
      setActiveAbortController(null);
    }
  };

  const handleStop = () => {
    if (activeAbortController) {
      activeAbortController.abort();
      setIsLoading(false);
      setLoadingStatus('');
      
      if (activeConversation) {
        const stopMsg: Message = {
          id: `stop-${Date.now()}`,
          role: 'assistant',
          content: '*(Response generation stopped by user)*',
          mode: defaultMode,
          created_at: new Date().toISOString()
        };
        setActiveConversation({
          ...activeConversation,
          messages: [...activeConversation.messages, stopMsg]
        });
      }
      setActiveAbortController(null);
    }
  };

  const handleStartChatFromLanding = (mode: ExecutionMode = 'auto') => {
    setDefaultMode(mode);
    setActiveConversation(null);
    setCurrentTab('chat');
  };

  const handleAskAboutDoc = (filename: string) => {
    setCurrentTab('chat');
    setTimeout(() => {
      handleSendMessage(`Summarize key findings in ${filename}`, 'auto');
    }, 100);
  };

  const handleClearAllHistory = async () => {
    for (const c of conversations) {
      await api.deleteConversation(c.id).catch(() => {});
    }
    setConversations([]);
    setActiveConversation(null);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'light bg-slate-50 text-slate-900'}`}>
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        providers={providers}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="w-full">
        {currentTab === 'landing' && (
          <LandingPage onStartChat={handleStartChatFromLanding} providers={providers} onNavigateTab={setCurrentTab} />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            conversations={conversations}
            providers={providers}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            onNewChat={(mode, prompt) => {
              setDefaultMode(mode);
              setActiveConversation(null);
              setCurrentTab('chat');
              if (prompt) {
                setTimeout(() => handleSendMessage(prompt, mode), 100);
              }
            }}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'chat' && (
          <ChatPage
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStop={handleStop}
            loadingStatus={loadingStatus}
            availableDocs={documents}
            onDocumentUploaded={(doc) => setDocuments((prev) => [doc, ...prev])}
            defaultMode={defaultMode}
            onClearHistory={handleClearAllHistory}
          />
        )}

        {currentTab === 'knowledge' && (
          <KnowledgePage
            documents={documents}
            onUploadSuccess={(doc) => setDocuments([doc, ...documents])}
            onDeleteDocument={(id) => {
              api.deleteDocument(id).catch(() => {});
              setDocuments(documents.filter((d) => d.id !== id));
            }}
            onAskAboutDoc={handleAskAboutDoc}
          />
        )}


      </main>
    </div>
  );
}

export default App;
