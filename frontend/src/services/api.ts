import type { AgentConfig, ChatMessage, BrainSynthesisResponse, TOGAFDocument } from '../types';

const API_BASE = '/api';

export async function fetchAgents(): Promise<AgentConfig[]> {
  const res = await fetch(`${API_BASE}/agents`);
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
}

export async function sendAgentMessage(
  agentId: string,
  message: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${API_BASE}/agents/${agentId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory })
  });
  if (!res.ok) throw new Error('Failed to send message');
  const data = await res.json();
  return data.reply;
}

export async function streamAgentMessage(
  agentId: string,
  message: string,
  conversationHistory: ChatMessage[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/agents/${agentId}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory })
  });

  if (!res.ok) {
    onError('Failed to connect to agent');
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError('No response stream');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'token') {
            onToken(data.content);
          } else if (data.type === 'done') {
            onDone();
          } else if (data.type === 'error') {
            onError(data.content);
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  }
}

export async function streamBrainSynthesis(
  conversations: Record<string, ChatMessage[]>,
  focusArea: string | undefined,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/brain/synthesize/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversations, focusArea })
  });

  if (!res.ok) {
    onError('Failed to synthesize');
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError('No response stream');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'token') {
            onToken(data.content);
          } else if (data.type === 'done') {
            onDone();
          } else if (data.type === 'error') {
            onError(data.content);
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  }
}

export async function synthesizeConversations(
  conversations: Record<string, ChatMessage[]>,
  focusArea?: string
): Promise<BrainSynthesisResponse> {
  const res = await fetch(`${API_BASE}/brain/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversations, focusArea })
  });
  if (!res.ok) throw new Error('Failed to synthesize');
  return res.json();
}

export async function generateTOGAFDocument(
  synthesis: string,
  conversations: Record<string, ChatMessage[]>,
  title?: string
): Promise<TOGAFDocument> {
  const res = await fetch(`${API_BASE}/togaf/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ synthesis, conversations, title })
  });
  if (!res.ok) throw new Error('Failed to generate TOGAF document');
  return res.json();
}

export async function exportMarkdown(document: TOGAFDocument): Promise<string> {
  const res = await fetch(`${API_BASE}/togaf/export/markdown`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document })
  });
  if (!res.ok) throw new Error('Failed to export');
  return res.text();
}
