import { Router } from 'express';
import type { Request, Response } from 'express';
import { agentConfigs } from '../agents/prompts.js';
import { chatCompletion, streamChatCompletion } from '../services/llm.js';
import type { AgentChatRequest } from '../types/index.js';

const router = Router();

// Get all agent configs
router.get('/', (_req: Request, res: Response) => {
  const agents = Object.values(agentConfigs).map(({ systemPrompt: _sp, ...rest }) => rest);
  res.json(agents);
});

// Get a specific agent config
router.get('/:agentId', (req: Request, res: Response) => {
  const agentId = req.params.agentId as string;
  const config = agentConfigs[agentId];
  if (!config) {
    res.status(404).json({ error: `Agent "${agentId}" not found` });
    return;
  }
  const { systemPrompt: _sp, ...rest } = config;
  res.json(rest);
});

// Chat with an agent (non-streaming)
router.post('/:agentId/chat', async (req: Request, res: Response) => {
  const agentId = req.params.agentId as string;
  const config = agentConfigs[agentId];
  if (!config) {
    res.status(404).json({ error: `Agent "${agentId}" not found` });
    return;
  }

  const { message, conversationHistory } = req.body as AgentChatRequest;
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const messages = [
      ...(conversationHistory ?? []),
      { role: 'user' as const, content: message }
    ];

    const reply = await chatCompletion(config.systemPrompt, messages);
    res.json({ reply, agentId });
  } catch (error) {
    console.error(`Agent ${agentId} chat error:`, error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Chat with an agent (streaming via SSE)
router.post('/:agentId/chat/stream', async (req: Request, res: Response) => {
  const agentId = req.params.agentId as string;
  const config = agentConfigs[agentId];
  if (!config) {
    res.status(404).json({ error: `Agent "${agentId}" not found` });
    return;
  }

  const { message, conversationHistory } = req.body as AgentChatRequest;
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const messages = [
      ...(conversationHistory ?? []),
      { role: 'user' as const, content: message }
    ];

    const stream = streamChatCompletion(config.systemPrompt, messages);

    for await (const token of stream) {
      res.write(`data: ${JSON.stringify({ type: 'token', content: token, agentId })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done', content: '', agentId })}\n\n`);
    res.end();
  } catch (error) {
    console.error(`Agent ${agentId} stream error:`, error);
    res.write(`data: ${JSON.stringify({ type: 'error', content: 'Failed to generate response' })}\n\n`);
    res.end();
  }
});

export default router;
