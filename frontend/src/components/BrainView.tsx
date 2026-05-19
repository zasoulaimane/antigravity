import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Brain, Zap, FileText } from 'lucide-react';
import type { ChatMessage } from '../types';

interface BrainViewProps {
  conversations: Record<string, ChatMessage[]>;
  synthesis: string;
  isSynthesizing: boolean;
  isGeneratingTOGAF: boolean;
  onSynthesize: (focusArea?: string) => void;
  onGenerateTOGAF: () => void;
}

export default function BrainView({
  conversations,
  synthesis,
  isSynthesizing,
  isGeneratingTOGAF,
  onSynthesize,
  onGenerateTOGAF
}: BrainViewProps) {
  const [focusArea, setFocusArea] = useState('');

  const agents = [
    { id: 'it', name: 'IT Agent', icon: '\u{1F5A5}\uFE0F', color: '#3B82F6' },
    { id: 'hr', name: 'HR Agent', icon: '\u{1F465}', color: '#10B981' },
    { id: 'finance', name: 'Finance Agent', icon: '\u{1F4B0}', color: '#F59E0B' },
    { id: 'ops', name: 'Ops Agent', icon: '\u2699\uFE0F', color: '#8B5CF6' }
  ];

  const hasConversations = Object.values(conversations).some(
    (msgs) => msgs.length > 0
  );

  const totalMessages = Object.values(conversations).reduce(
    (sum, msgs) => sum + msgs.length,
    0
  );

  return (
    <div className="brain-view">
      <div className="brain-sidebar">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
          Department Status
        </div>
        {agents.map((agent) => {
          const msgCount = (conversations[agent.id] ?? []).filter(
            (m) => m.role !== 'system'
          ).length;
          return (
            <div
              key={agent.id}
              className={`brain-dept-card ${msgCount > 0 ? 'has-messages' : ''}`}
              style={msgCount > 0 ? { borderLeftColor: agent.color } : {}}
            >
              <div className="dept-name">
                {agent.icon} {agent.name}
              </div>
              <div className="dept-count">
                {msgCount > 0
                  ? `${msgCount} messages`
                  : 'No conversations yet'}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: '12px' }}>
          <input
            className="focus-area-input"
            type="text"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            placeholder="Focus area (optional)"
          />
        </div>

        <div className="brain-actions">
          <button
            className="brain-btn synthesize"
            onClick={() => onSynthesize(focusArea || undefined)}
            disabled={!hasConversations || isSynthesizing}
          >
            {isSynthesizing ? (
              <>
                <span className="spinner" /> Synthesizing...
              </>
            ) : (
              <>
                <Zap size={16} /> Synthesize ({totalMessages} msgs)
              </>
            )}
          </button>
          <button
            className="brain-btn generate"
            onClick={onGenerateTOGAF}
            disabled={!synthesis || isGeneratingTOGAF}
          >
            {isGeneratingTOGAF ? (
              <>
                <span className="spinner" /> Generating TOGAF...
              </>
            ) : (
              <>
                <FileText size={16} /> Generate TOGAF Document
              </>
            )}
          </button>
        </div>
      </div>

      <div className="brain-main">
        <div className="brain-main-header">
          <Brain size={20} style={{ color: 'var(--accent-purple)' }} />
          <h2>Brain Agent Synthesis</h2>
          {synthesis && (
            <span className="status-badge ready">Ready</span>
          )}
          {isSynthesizing && (
            <span className="status-badge generating">Generating</span>
          )}
        </div>
        <div className="brain-main-content">
          {!synthesis && !isSynthesizing ? (
            <div className="brain-empty">
              <div className="brain-empty-icon">
                <Brain size={64} />
              </div>
              <div className="brain-empty-text">
                Chat with department agents first, then click
                &quot;Synthesize&quot; to have the Brain Agent analyze all
                conversations and generate cross-department insights.
              </div>
            </div>
          ) : (
            <div className="synthesis-content">
              <ReactMarkdown>{synthesis || 'Analyzing conversations...'}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
