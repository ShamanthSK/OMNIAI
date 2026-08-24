import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem } from '../types';

interface DocumentUploaderProps {
  onUploadSuccess: (doc: DocumentItem) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setUploadState('uploading');
    setErrorMsg('');

    try {
      const doc = await api.uploadDocument(file);
      if (doc.status === 'failed') {
        setUploadState('error');
        setErrorMsg(doc.error_message || 'Processing failed.');
      } else {
        setUploadState('success');
        onUploadSuccess(doc);
        setTimeout(() => setUploadState('idle'), 3000);
      }
    } catch (err: any) {
      setUploadState('error');
      setErrorMsg(err.message || 'Upload failed.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`w-full rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
        isDragging
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-white/15 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-slate-900/90'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.csv,.md"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      <div className="max-w-xs mx-auto space-y-2">
        {uploadState === 'uploading' ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-200">Processing {fileName}...</p>
            <p className="text-xs text-slate-400">Extracting text, chunking & generating embeddings</p>
          </div>
        ) : uploadState === 'success' ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-300">Uploaded {fileName}!</p>
            <p className="text-xs text-slate-400">Document is ready for RAG Knowledge questions</p>
          </div>
        ) : uploadState === 'error' ? (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm font-semibold text-rose-300">Upload Failed</p>
            <p className="text-xs text-rose-400">{errorMsg}</p>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Drag & drop document or <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX, TXT, CSV, Markdown (Max 25MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
