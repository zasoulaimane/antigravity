import { useState, useCallback, useEffect } from 'react';
import { MessageSquare, Brain, FileText } from 'lucide-react';
import ChatPanel from './components/ChatPanel';
import BrainView from './components/BrainView';
import TOGAFView from './components/TOGAFView';
import {
  fetchAgents,
  streamAgentMessage,
  streamBrainSynthesis,
  generateTOGAFDocument,
  exportMarkdown
} from './services/api';
import type { AgentConfig, ChatMessage, TOGAFDocument, ViewMode } from './types';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('agents');
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [loadingAgents, setLoadingAgents] = useState<Record<string, boolean>>({});
  const [streamingContent, setStreamingContent] = useState<Record<string, string>>({});
  const [synthesis, setSynthesis] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGeneratingTOGAF, setIsGeneratingTOGAF] = useState(false);
  const [togafDocument, setTogafDocument] = useState<TOGAFDocument | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch(() => {
        setAgents([
          { id: 'it', name: 'IT Agent', department: 'Information Technology', description: '', color: '#3B82F6', icon: '\u{1F5A5}\uFE0F' },
          { id: 'hr', name: 'HR Agent', department: 'Human Resources', description: '', color: '#10B981', icon: '\u{1F465}' },
          { id: 'finance', name: 'Finance Agent', department: 'Finance', description: '', color: '#F59E0B', icon: '\u{1F4B0}' },
          { id: 'ops', name: 'Operations Agent', department: 'Operations', description: '', color: '#8B5CF6', icon: '\u2699\uFE0F' }
        ]);
      });
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSendMessage = useCallback(
    (agentId: string, message: string) => {
      const currentHistory = conversations[agentId] ?? [];
      const updatedHistory: ChatMessage[] = [
        ...currentHistory,
        { role: 'user', content: message }
      ];

      setConversations((prev) => ({
        ...prev,
        [agentId]: updatedHistory
      }));
      setLoadingAgents((prev) => ({ ...prev, [agentId]: true }));
      setStreamingContent((prev) => ({ ...prev, [agentId]: '' }));

      streamAgentMessage(
        agentId,
        message,
        currentHistory,
        (token) => {
          setStreamingContent((prev) => ({
            ...prev,
            [agentId]: (prev[agentId] ?? '') + token
          }));
        },
        () => {
          setStreamingContent((prev) => {
            const finalContent = prev[agentId] ?? '';
            setConversations((convs) => ({
              ...convs,
              [agentId]: [
                ...updatedHistory,
                { role: 'assistant', content: finalContent }
              ]
            }));
            return { ...prev, [agentId]: '' };
          });
          setLoadingAgents((prev) => ({ ...prev, [agentId]: false }));
        },
        (error) => {
          showToast(`Error: ${error}`);
          setLoadingAgents((prev) => ({ ...prev, [agentId]: false }));
          setStreamingContent((prev) => ({ ...prev, [agentId]: '' }));
        }
      );
    },
    [conversations, showToast]
  );

  const handleSynthesize = useCallback(
    (focusArea?: string) => {
      setIsSynthesizing(true);
      setSynthesis('');

      streamBrainSynthesis(
        conversations,
        focusArea,
        (token) => {
          setSynthesis((prev) => prev + token);
        },
        () => {
          setIsSynthesizing(false);
          showToast('Synthesis complete!');
        },
        (error) => {
          showToast(`Synthesis error: ${error}`);
          setIsSynthesizing(false);
        }
      );
    },
    [conversations, showToast]
  );

  const handleGenerateTOGAF = useCallback(async () => {
    if (!synthesis) return;
    setIsGeneratingTOGAF(true);
    try {
      const doc = await generateTOGAFDocument(synthesis, conversations);
      setTogafDocument(doc);
      setSelectedPhase(doc.phases[0]?.id ?? null);
      setViewMode('togaf');
      showToast('TOGAF document generated!');
    } catch {
      showToast('Failed to generate TOGAF document');
    } finally {
      setIsGeneratingTOGAF(false);
    }
  }, [synthesis, conversations, showToast]);

  const handleExportMarkdown = useCallback(async () => {
    if (!togafDocument) return;
    try {
      const markdown = await exportMarkdown(togafDocument);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'togaf-architecture.md';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Document exported!');
    } catch {
      showToast('Export failed');
    }
  }, [togafDocument, showToast]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">A</div>
          <div>
            <div className="header-title">Antigravity</div>
            <div className="header-subtitle">CECP Multi-Agent Architecture</div>
          </div>
        </div>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${viewMode === 'agents' ? 'active' : ''}`}
            onClick={() => setViewMode('agents')}
          >
            <MessageSquare size={14} /> Department Agents
          </button>
          <button
            className={`nav-tab ${viewMode === 'brain' ? 'active' : ''}`}
            onClick={() => setViewMode('brain')}
          >
            <Brain size={14} /> Brain Agent
          </button>
          <button
            className={`nav-tab ${viewMode === 'togaf' ? 'active' : ''}`}
            onClick={() => setViewMode('togaf')}
          >
            <FileText size={14} /> TOGAF Document
          </button>
        </nav>
      </header>

      <main className="main-content">
        {viewMode === 'agents' && (
          <div className="agents-grid">
            {agents.map((agent) => (
              <ChatPanel
                key={agent.id}
                agent={agent}
                messages={conversations[agent.id] ?? []}
                onSendMessage={(msg) => handleSendMessage(agent.id, msg)}
                isLoading={loadingAgents[agent.id] ?? false}
                streamingContent={streamingContent[agent.id] ?? ''}
              />
            ))}
          </div>
        )}

        {viewMode === 'brain' && (
          <BrainView
            conversations={conversations}
            synthesis={synthesis}
            isSynthesizing={isSynthesizing}
            isGeneratingTOGAF={isGeneratingTOGAF}
            onSynthesize={handleSynthesize}
            onGenerateTOGAF={handleGenerateTOGAF}
          />
        )}

        {viewMode === 'togaf' && (
          <TOGAFView
            document={togafDocument}
            selectedPhase={selectedPhase}
            onSelectPhase={setSelectedPhase}
            onExportMarkdown={handleExportMarkdown}
          />
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
