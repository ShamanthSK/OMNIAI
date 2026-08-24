import React from 'react';
import { FileText, Trash2, Database, ShieldCheck, HelpCircle } from 'lucide-react';
import { DocumentItem } from '../types';
import { DocumentUploader } from '../components/DocumentUploader';

interface KnowledgePageProps {
  documents: DocumentItem[];
  onUploadSuccess: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onAskAboutDoc: (filename: string) => void;
}

export const KnowledgePage: React.FC<KnowledgePageProps> = ({
  documents,
  onUploadSuccess,
  onDeleteDocument,
  onAskAboutDoc
}) => {
  return (
    <div className="w-full space-y-8 py-6 px-4 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>RAG VECTOR ENGINE ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Knowledge Base & RAG Retrieval
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload custom documents for semantic chunking, vector embedding, and context-injected AI reasoning.
          </p>
        </div>
      </div>

      {/* Drag & Drop File Upload Section */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-300 uppercase">Upload Knowledge Document</h2>
        <DocumentUploader onUploadSuccess={onUploadSuccess} />
      </div>

      {/* Document Library Table */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase">
            Ingested Documents ({documents.length})
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs border border-white/10">
            No knowledge documents uploaded yet. Drag & drop a file above to enable RAG features!
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase border-b border-white/10 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Chunks</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="truncate max-w-xs">{doc.filename}</span>
                      </td>
                      <td className="py-3 px-4 uppercase text-slate-400 font-mono text-[11px]">
                        {doc.file_type}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-300">
                        {doc.chunk_count}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            doc.status === 'ready'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : doc.status === 'processing'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => onAskAboutDoc(doc.filename)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
                        >
                          Ask Question
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
