import {
  ChatPayload,
  Message,
  Conversation,
  DocumentItem,
  ProviderStatus
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Providers
  async getProvidersStatus(): Promise<ProviderStatus[]> {
    const res = await fetch(`${API_BASE}/providers/status`);
    if (!res.ok) throw new Error('Failed to fetch provider status');
    return res.json();
  },

  // Chat (supports abort signal for stopping mid-generation)
  async sendChatMessage(payload: ChatPayload, signal?: AbortSignal): Promise<Message> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal
    });
    if (!res.ok) {
      let errMsg = 'Failed to send message';
      try {
        const err = await res.json();
        errMsg = err.detail || errMsg;
      } catch (_) {
        try {
          const text = await res.text();
          if (text) {
            errMsg = text.length > 100 ? text.substring(0, 100) + '...' : text;
          }
        } catch (__) {}
      }
      throw new Error(errMsg);
    }
    return res.json();
  },

  // Conversations
  async listConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/conversations`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  async getConversation(id: string): Promise<Conversation & { messages: Message[] }> {
    const res = await fetch(`${API_BASE}/conversations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch conversation detail');
    return res.json();
  },

  async deleteConversation(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete conversation');
  },

  // Documents
  async listDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      let errMsg = 'Document upload failed';
      try {
        const err = await res.json();
        errMsg = err.detail || errMsg;
      } catch (_) {
        try {
          const text = await res.text();
          if (text) {
            errMsg = text.length > 100 ? text.substring(0, 100) + '...' : text;
          }
        } catch (__) {}
      }
      throw new Error(errMsg);
    }
    return res.json();
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  // Feedback
  async sendFeedback(messageId: string, isHelpful: boolean, comment?: string): Promise<void> {
    await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: messageId, is_helpful: isHelpful, comment }),
    });
  }
};
