import React, { useState, useRef } from 'react';
import {
  Send,
  Paperclip,
  GitCompare,
  Sparkles,
  Layers,
  Globe,
  Mic,
  X,
  FileText,
  Loader2,
  Check,
  Square
} from 'lucide-react';
import { ExecutionMode, DocumentItem } from '../types';
import { api } from '../services/api';

interface ComposerProps {
  onSend: (prompt: string, mode: ExecutionMode, model?: string, docIds?: string[]) => void;
  isLoading: boolean;
  onStop?: () => void;
  availableDocs: DocumentItem[];
  onDocumentUploaded?: (doc: DocumentItem) => void;
  defaultMode?: ExecutionMode;
  defaultModel?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  isLoading,
  onStop,
  availableDocs,
  onDocumentUploaded,
  defaultMode = 'auto',
  defaultModel = 'gemini'
}) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<ExecutionMode>(defaultMode);
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  // File Upload State inside chat
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition State (using browser MediaRecorder + Backend Gemini)
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const statusTimeoutRef = useRef<any>(null);

  const showStatus = (msg: string) => {
    setSpeechStatus(msg);
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = setTimeout(() => {
      setSpeechStatus('');
    }, 4000);
  };

  const toggleSpeechRecognition = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Audio recording is not supported in this browser context (requires HTTPS or localhost).");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];

        let mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Let browser choose default if webm is not supported (Safari)
        }

        const options = mimeType ? { mimeType } : undefined;
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstart = () => {
          setIsListening(true);
          showStatus('Listening... Speak now');
        };

        mediaRecorder.onerror = (event: any) => {
          console.error("Recording error:", event.error || event);
          setIsListening(false);
          showStatus('Error: Recording failed');
        };

        mediaRecorder.onstop = async () => {
          setIsListening(false);
          showStatus('Processing voice...');

          // Stop all audio tracks to release microphone
          stream.getTracks().forEach((track) => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || mediaRecorder.mimeType });
          if (audioBlob.size < 1000) {
            showStatus('Error: Audio clip too short');
            return;
          }

          // Send audio to backend transcription API
          try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice.webm');

            const response = await fetch('/api/chat/transcribe', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              let errMsg = 'Failed to transcribe audio.';
              try {
                const errData = await response.json();
                errMsg = errData.detail || errMsg;
              } catch (_) {
                try {
                  const errText = await response.text();
                  if (errText) {
                    errMsg = errText.length > 100 ? errText.substring(0, 100) + '...' : errText;
                  }
                } catch (__) {}
              }
              throw new Error(errMsg);
            }

            const data = await response.json();
            if (data.text && data.text.trim()) {
              setPrompt((prev) => (prev ? prev + ' ' + data.text : data.text));
              showStatus('Transcribed successfully!');
            } else {
              showStatus('No speech detected');
            }
          } catch (err: any) {
            console.error('Transcription error:', err);
            showStatus('Error: Transcription failed');
            alert(`Transcription failed: ${err.message || err}`);
          }
        };

        mediaRecorder.start();
      } catch (err: any) {
        console.error('Failed to access microphone:', err);
        showStatus('Error: Mic Access Failed');
        alert("Could not access your microphone. Please check your browser permissions.");
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    onSend(prompt, mode, selectedModel, selectedDocIds);
    setPrompt('');
  };

  const toggleDocSelection = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      setSelectedDocIds(selectedDocIds.filter((id) => id !== docId));
    } else {
      setSelectedDocIds([...selectedDocIds, docId]);
    }
  };

  // Direct file attachment upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingFile(true);
    setUploadStatus(`Uploading ${file.name}...`);

    try {
      const doc = await api.uploadDocument(file);
      if (doc.status === 'failed') {
        alert(`Failed to process document: ${doc.error_message}`);
      } else {
        setUploadStatus('Attached!');
        // Add to active selection
        setSelectedDocIds((prev) => [...prev, doc.id]);
        if (onDocumentUploaded) {
          onDocumentUploaded(doc);
        }
        setTimeout(() => setUploadStatus(''), 2000);
      }
    } catch (err: any) {
      alert(`Error uploading file: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="w-full max-w-4xl mx-auto p-2"
    >
      {/* Active Document Attachment Pills */}
      {selectedDocIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {selectedDocIds.map((id) => {
            const doc = availableDocs.find((d) => d.id === id);
            return (
              <div
                key={id}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-200"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate max-w-[150px]">{doc ? doc.filename : 'Attached File'}</span>
                <button
                  onClick={() => toggleDocSelection(id)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="glass-panel p-3 border border-white/10 shadow-2xl focus-within:border-indigo-500/50 transition-colors relative">
        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-white/5">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setMode('auto')}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                mode === 'auto'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-300" />
              Auto
            </button>

            <button
              onClick={() => setMode('single')}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                mode === 'single'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              Single
            </button>

            <button
              onClick={() => setMode('compare')}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                mode === 'compare'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitCompare className="w-3 h-3 text-purple-300" />
              Compare
            </button>
          </div>

          {/* Model Dropdown (Enabled in Single mode) */}
          {mode === 'single' && (
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-900 border border-white/10 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="gemini">Google Gemini 3.6</option>
              <option value="gemma">Google Gemma 4</option>
              <option value="paligemma">Google PaliGemma</option>
              <option value="nemotron-llama">NVIDIA Llama Nemotron</option>
              <option value="nemotron-4">NVIDIA Nemotron 4</option>
            </select>
          )}

          {/* Direct File Attachment Selector */}
          <div className="flex items-center gap-2">
            {uploadingFile && (
              <div className="flex items-center gap-1 text-[11px] text-amber-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{uploadStatus}</span>
              </div>
            )}
            {!uploadingFile && uploadStatus && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>{uploadStatus}</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.csv,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded bg-slate-900 border border-white/5"
              title="Drag & drop or Click to attach document file directly to chat"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach File</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'auto'
              ? 'Ask OmniAI anything... Intelligent routing will select the best model.'
              : mode === 'compare'
              ? 'Ask a complex question to compare multi-model responses side by side...'
              : `Ask ${selectedModel.toUpperCase()} a specific query...`
          }
          rows={3}
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-1"
        />

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors ${
                webSearchEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Live Search Context"
            >
              <Globe className="w-3 h-3" />
              Web Search
            </button>

            <button
              onClick={toggleSpeechRecognition}
              className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors ${
                isListening
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={isListening ? "Listening... Click to stop" : "Start Voice Input"}
            >
              <Mic className={`w-3 h-3 ${isListening ? 'text-rose-400' : ''}`} />
              {isListening ? "Listening..." : "Voice"}
            </button>

            {speechStatus && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded transition-all duration-300 ${
                speechStatus.startsWith('Error') 
                  ? 'bg-rose-950/50 text-rose-300 border border-rose-500/30 animate-shake' 
                  : speechStatus.startsWith('Listening')
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                  : speechStatus.startsWith('Transcribed')
                  ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30'
                  : 'bg-indigo-950/50 text-indigo-300 border border-indigo-500/30'
              }`}>
                {speechStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Shift + Enter for new line
            </span>

            {/* Render Stop Button if loading, otherwise Send button */}
            {isLoading ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 transition-all"
                title="Stop execution mid-generation"
              >
                <span>Stop</span>
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  prompt.trim() && !isLoading
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-90'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Composer;
