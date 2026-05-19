import { v4 as uuidv4 } from 'uuid';
import { togafGeneratorPrompt } from '../agents/prompts.js';
import { chatCompletion } from './llm.js';
import type { TOGAFDocument, TOGAFPhase, ChatMessage } from '../types/index.js';

const TOGAF_PHASES = [
  {
    id: 'preliminary',
    name: 'Preliminary Phase',
    description: 'Architecture principles, stakeholders, scope, and governance framework'
  },
  {
    id: 'phase-a',
    name: 'Phase A — Architecture Vision',
    description: 'Vision statement, stakeholder concerns, business goals, solution concept'
  },
  {
    id: 'phase-b',
    name: 'Phase B — Business Architecture',
    description: 'Business processes, organizational units, capability map, business services'
  },
  {
    id: 'phase-c',
    name: 'Phase C — Information Systems Architecture',
    description: 'Data entities, application landscape, integration patterns, data governance'
  },
  {
    id: 'phase-d',
    name: 'Phase D — Technology Architecture',
    description: 'Technology platforms, infrastructure, standards, deployment architecture'
  },
  {
    id: 'phase-e',
    name: 'Phase E — Opportunities & Solutions',
    description: 'Gap analysis, solution building blocks, project portfolio, dependencies'
  },
  {
    id: 'phase-f',
    name: 'Phase F — Migration Planning',
    description: 'Migration roadmap, implementation phases, risk mitigation, timeline'
  }
];

function buildPhasePrompt(phase: typeof TOGAF_PHASES[number], synthesis: string): string {
  return `Generate detailed content for TOGAF ADM "${phase.name}" (${phase.description}).

Based on this enterprise analysis synthesis:

${synthesis}

Generate comprehensive, specific content for this phase. Use markdown formatting with headers, bullet points, and tables where appropriate. Reference specific systems, processes, departments, and recommendations from the synthesis. Do NOT produce generic template content — make it specific to this enterprise context.`;
}

export async function generateTOGAFDocument(
  synthesis: string,
  conversations: Record<string, ChatMessage[]>,
  title?: string
): Promise<TOGAFDocument> {
  const conversationSummary = Object.entries(conversations)
    .map(([agentId, messages]) => {
      const agentMsgs = messages
        .filter((m) => m.role !== 'system')
        .map((m) => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`)
        .join('\n');
      return `### ${agentId.toUpperCase()} Department\n${agentMsgs}`;
    })
    .join('\n\n');

  const fullContext = `## Synthesis\n${synthesis}\n\n## Department Conversations\n${conversationSummary}`;

  const phases: TOGAFPhase[] = [];

  for (const phaseDef of TOGAF_PHASES) {
    const prompt = buildPhasePrompt(phaseDef, fullContext);
    const content = await chatCompletion(
      togafGeneratorPrompt,
      [{ role: 'user', content: prompt }],
      { temperature: 0.4, maxTokens: 3000 }
    );

    phases.push({
      id: phaseDef.id,
      name: phaseDef.name,
      description: phaseDef.description,
      content
    });
  }

  return {
    id: uuidv4(),
    title: title ?? 'Enterprise Architecture — TOGAF ADM Document',
    createdAt: new Date().toISOString(),
    phases,
    synthesis
  };
}

export async function generateSinglePhase(
  phaseId: string,
  synthesis: string
): Promise<TOGAFPhase | null> {
  const phaseDef = TOGAF_PHASES.find((p) => p.id === phaseId);
  if (!phaseDef) return null;

  const prompt = buildPhasePrompt(phaseDef, synthesis);
  const content = await chatCompletion(
    togafGeneratorPrompt,
    [{ role: 'user', content: prompt }],
    { temperature: 0.4, maxTokens: 3000 }
  );

  return {
    id: phaseDef.id,
    name: phaseDef.name,
    description: phaseDef.description,
    content
  };
}

export function getTOGAFPhases() {
  return TOGAF_PHASES;
}

export function exportToMarkdown(doc: TOGAFDocument): string {
  let md = `# ${doc.title}\n\n`;
  md += `*Generated: ${new Date(doc.createdAt).toLocaleString()}*\n\n`;
  md += `---\n\n`;
  md += `## Executive Synthesis\n\n${doc.synthesis}\n\n`;
  md += `---\n\n`;

  for (const phase of doc.phases) {
    md += `## ${phase.name}\n\n`;
    md += `*${phase.description}*\n\n`;
    md += `${phase.content}\n\n`;
    md += `---\n\n`;
  }

  return md;
}
