export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  department: string;
  description: string;
  systemPrompt: string;
  color: string;
  icon: string;
}

export interface ConversationState {
  agentId: string;
  messages: ChatMessage[];
}

export interface BrainSynthesisRequest {
  conversations: Record<string, ChatMessage[]>;
  focusArea?: string;
}

export interface BrainSynthesisResponse {
  synthesis: string;
  recommendations: string[];
  crossDepartmentInsights: string[];
}

export interface TOGAFPhase {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface TOGAFDocument {
  id: string;
  title: string;
  createdAt: string;
  phases: TOGAFPhase[];
  synthesis: string;
}

export interface AgentChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

export interface AgentChatResponse {
  reply: string;
  agentId: string;
}

export interface StreamChunk {
  type: 'token' | 'done' | 'error';
  content: string;
  agentId?: string;
}
