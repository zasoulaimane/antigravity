import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send } from 'lucide-react';
import type { AgentConfig, ChatMessage } from '../types';

interface ChatPanelProps {
  agent: AgentConfig;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  streamingContent: string;
}

export default function ChatPanel({
  agent,
  messages,
  onSendMessage,
  isLoading,
  streamingContent
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="chat-panel">
      <div className="chat-header" style={{ borderBottomColor: agent.color + '40' }}>
        <span className="chat-header-icon">{agent.icon}</span>
        <div className="chat-header-info">
          <div className="chat-header-name" style={{ color: agent.color }}>
            {agent.name}
          </div>
          <div className="chat-header-dept">{agent.department}</div>
        </div>
        <div className="chat-header-status" />
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !streamingContent && (
          <div className="chat-empty">
            Chat with {agent.name} about {agent.department.toLowerCase()}...
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            {msg.role === 'assistant' ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}
        {streamingContent && (
          <div className="chat-message assistant">
            <ReactMarkdown>{streamingContent}</ReactMarkdown>
          </div>
        )}
        {isLoading && !streamingContent && (
          <div className="typing-indicator">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${agent.name}...`}
          disabled={isLoading}
        />
        <button
          className="chat-send-btn"
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{ background: agent.color }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
