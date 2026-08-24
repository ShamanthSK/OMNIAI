export type ExecutionMode = 'auto' | 'single' | 'compare';

export interface ProviderStatus {
  id: string;
  name: string;
  model: string;
  configured: boolean;
  status: 'configured' | 'demo' | 'unavailable' | 'error';
  capabilities: string[];
  description: string;
}

export interface ModelComparisonResult {
  provider: string;
  provider_name: string;
  model_name: string;
  status: 'success' | 'error' | 'unavailable';
  response: string;
  latency_ms: number;
  error?: string;
  is_demo?: boolean;
}

export interface SynthesisData {
  agreements: string[];
  discrepancies: string[];
  hallucination_warnings: string[];
  uncertainty_level: 'Low' | 'Medium' | 'High';
  combined_answer: string;
}

export interface CitationSource {
  document_id: string;
  filename: string;
  chunk_index: number;
  snippet: string;
  score: number;
}

export interface Message {
  id: string;
  conversation_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode: ExecutionMode;
  selected_model?: string;
  provider_used?: string;
  routing_reason?: string;
  task_category?: string;
  comparison_results?: ModelComparisonResult[];
  synthesis?: SynthesisData;
  citations?: CitationSource[];
  is_demo?: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  mode: ExecutionMode;
  selected_model?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  chunk_count: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface ChatPayload {
  conversation_id?: string;
  prompt: string;
  mode: ExecutionMode;
  selected_model?: string;
  document_ids?: string[];
}
