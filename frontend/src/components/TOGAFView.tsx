import ReactMarkdown from 'react-markdown';
import { FileText, Download } from 'lucide-react';
import type { TOGAFDocument } from '../types';

interface TOGAFViewProps {
  document: TOGAFDocument | null;
  selectedPhase: string | null;
  onSelectPhase: (phaseId: string) => void;
  onExportMarkdown: () => void;
}

export default function TOGAFView({
  document,
  selectedPhase,
  onSelectPhase,
  onExportMarkdown
}: TOGAFViewProps) {
  if (!document) {
    return (
      <div className="togaf-view">
        <div className="togaf-main" style={{ width: '100%' }}>
          <div className="togaf-main-header">
            <h2>TOGAF Architecture Document</h2>
          </div>
          <div className="togaf-main-content">
            <div className="togaf-empty">
              <div className="togaf-empty-icon">
                <FileText size={64} />
              </div>
              <div className="brain-empty-text">
                No TOGAF document generated yet. Use the Brain Agent to
                synthesize department conversations, then generate TOGAF
                artifacts.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activePhase = document.phases.find((p) => p.id === selectedPhase);

  return (
    <div className="togaf-view">
      <div className="togaf-sidebar">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
          ADM Phases
        </div>
        {document.phases.map((phase) => (
          <div
            key={phase.id}
            className={`togaf-phase-card ${
              selectedPhase === phase.id ? 'active' : ''
            } ${phase.content ? 'has-content' : ''}`}
            onClick={() => onSelectPhase(phase.id)}
          >
            <div className="togaf-phase-name">{phase.name}</div>
            <div className="togaf-phase-desc">{phase.description}</div>
          </div>
        ))}

        <div className="togaf-export-section">
          <button
            className="togaf-export-btn"
            onClick={onExportMarkdown}
          >
            <Download size={14} /> Export Markdown
          </button>
        </div>
      </div>

      <div className="togaf-main">
        <div className="togaf-main-header">
          <h2>{activePhase?.name ?? document.title}</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Generated: {new Date(document.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="togaf-main-content">
          {activePhase ? (
            <div className="synthesis-content">
              <ReactMarkdown>{activePhase.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="synthesis-content">
              <ReactMarkdown>{`## Executive Synthesis\n\n${document.synthesis}`}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
