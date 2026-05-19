# Antigravity — CECP Multi-Agent TOGAF System

A multi-agent AI platform for enterprise architecture. Department-specific AI agents (IT, HR, Finance, Operations) conduct domain conversations, a Brain Agent synthesizes cross-department insights, and the system auto-generates TOGAF ADM architecture documents.

## Architecture

```
Frontend (React + Vite)
├── IT Agent Chat UI
├── HR Agent Chat UI
├── Finance Agent Chat UI
├── Ops Agent Chat UI
└── Brain Agent Panel (Synthesis + TOGAF Generator)
        │
        │ REST API + SSE Streaming
        ▼
Backend (Node.js + Express + TypeScript)
├── Agent Router (/api/agents/:id)
├── Brain Orchestrator (/api/brain/synthesize)
├── TOGAF Builder (/api/togaf/generate)
└── LLM Service (OpenAI GPT-4o)
```

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your OPENAI_API_KEY

# Start development (backend + frontend)
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on port `3001`.

### Usage

1. **Department Agents**: Chat with IT, HR, Finance, and Operations agents about your enterprise context
2. **Brain Agent**: Click "Synthesize" to have the Brain Agent analyze all department conversations
3. **TOGAF Document**: Generate comprehensive TOGAF ADM architecture documents from the synthesis
4. **Export**: Download the generated documents as Markdown

## TOGAF ADM Coverage

| ADM Phase | Generated Content |
|-----------|------------------|
| Preliminary | Principles, stakeholders, scope, governance |
| Phase A | Architecture Vision, goals, solution concept |
| Phase B | Business processes, org units, capability map |
| Phase C | Data entities, application landscape, integration |
| Phase D | Technology platforms, infrastructure, standards |
| Phase E | Gap analysis, solution building blocks, portfolio |
| Phase F | Migration roadmap, phases, risk mitigation |

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, react-markdown, lucide-react
- **Backend**: Node.js, Express, TypeScript, OpenAI SDK
- **AI**: OpenAI GPT-4o with streaming responses
- **Protocols**: REST API, Server-Sent Events (SSE) for streaming

## Project Structure

```
antigravity/
├── backend/
│   └── src/
│       ├── agents/       # Agent system prompts & configs
│       ├── routes/       # Express route handlers
│       ├── services/     # LLM, Brain, TOGAF services
│       ├── types/        # TypeScript type definitions
│       └── index.ts      # Express server entry point
├── frontend/
│   └── src/
│       ├── components/   # React components
│       ├── services/     # API client
│       ├── types/        # TypeScript types
│       └── App.tsx       # Main application
└── README.md
```
