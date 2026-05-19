export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  department: string;
  description: string;
  color: string;
  icon: string;
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

export type ViewMode = 'agents' | 'brain' | 'togaf';
