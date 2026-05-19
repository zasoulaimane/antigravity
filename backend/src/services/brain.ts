import { brainAgentPrompt } from '../agents/prompts.js';
import { chatCompletion, streamChatCompletion } from './llm.js';
import type { ChatMessage, BrainSynthesisResponse } from '../types/index.js';

function buildSynthesisPrompt(
  conversations: Record<string, ChatMessage[]>,
  focusArea?: string
): string {
  const sections: string[] = [];

  for (const [agentId, messages] of Object.entries(conversations)) {
    const agentMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`)
      .join('\n');

    if (agentMessages.length > 0) {
      sections.push(`## ${agentId.toUpperCase()} Department Conversation\n${agentMessages}`);
    }
  }

  let prompt = `Synthesize the following multi-department enterprise conversations:\n\n${sections.join('\n\n---\n\n')}`;

  if (focusArea) {
    prompt += `\n\nFocus your synthesis particularly on: ${focusArea}`;
  }

  prompt += `\n\nProvide your synthesis in the following JSON format:
{
  "synthesis": "Your comprehensive synthesis text",
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "crossDepartmentInsights": ["Insight 1", "Insight 2", ...]
}`;

  return prompt;
}

export async function synthesizeConversations(
  conversations: Record<string, ChatMessage[]>,
  focusArea?: string
): Promise<BrainSynthesisResponse> {
  const prompt = buildSynthesisPrompt(conversations, focusArea);

  const response = await chatCompletion(
    brainAgentPrompt,
    [{ role: 'user', content: prompt }],
    { temperature: 0.5, maxTokens: 3000 }
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as BrainSynthesisResponse;
    }
  } catch {
    // Fall back to unstructured response
  }

  return {
    synthesis: response,
    recommendations: [],
    crossDepartmentInsights: []
  };
}

export async function* streamSynthesis(
  conversations: Record<string, ChatMessage[]>,
  focusArea?: string
): AsyncGenerator<string> {
  const sections: string[] = [];

  for (const [agentId, messages] of Object.entries(conversations)) {
    const agentMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`)
      .join('\n');

    if (agentMessages.length > 0) {
      sections.push(`## ${agentId.toUpperCase()} Department Conversation\n${agentMessages}`);
    }
  }

  let prompt = `Synthesize the following multi-department enterprise conversations and provide a comprehensive analysis:\n\n${sections.join('\n\n---\n\n')}`;

  if (focusArea) {
    prompt += `\n\nFocus your synthesis particularly on: ${focusArea}`;
  }

  yield* streamChatCompletion(
    brainAgentPrompt,
    [{ role: 'user', content: prompt }],
    { temperature: 0.5, maxTokens: 3000 }
  );
}
