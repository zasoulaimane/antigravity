import OpenAI from 'openai';
import type { ChatMessage } from '../types/index.js';

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function chatCompletion(
  systemPrompt: string,
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const client = getClient();
  const { temperature = 0.7, maxTokens = 2000 } = options;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content }))
    ],
    temperature,
    max_tokens: maxTokens
  });

  return response.choices[0]?.message?.content ?? '';
}

export async function* streamChatCompletion(
  systemPrompt: string,
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): AsyncGenerator<string> {
  const client = getClient();
  const { temperature = 0.7, maxTokens = 2000 } = options;

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content }))
    ],
    temperature,
    max_tokens: maxTokens,
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

export async function generateTOGAFContent(
  systemPrompt: string,
  synthesisContent: string
): Promise<string> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Based on the following synthesized enterprise analysis from multiple department agents, generate comprehensive TOGAF ADM phase documents:\n\n${synthesisContent}`
      }
    ],
    temperature: 0.5,
    max_tokens: 4000
  });

  return response.choices[0]?.message?.content ?? '';
}
