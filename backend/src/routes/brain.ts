import { Router } from 'express';
import type { Request, Response } from 'express';
import { synthesizeConversations, streamSynthesis } from '../services/brain.js';
import type { BrainSynthesisRequest } from '../types/index.js';

const router = Router();

// Synthesize conversations (non-streaming)
router.post('/synthesize', async (req: Request, res: Response) => {
  const { conversations, focusArea } = req.body as BrainSynthesisRequest;

  if (!conversations || Object.keys(conversations).length === 0) {
    res.status(400).json({ error: 'At least one department conversation is required' });
    return;
  }

  try {
    const result = await synthesizeConversations(conversations, focusArea);
    res.json(result);
  } catch (error) {
    console.error('Brain synthesis error:', error);
    res.status(500).json({ error: 'Failed to synthesize conversations' });
  }
});

// Synthesize conversations (streaming via SSE)
router.post('/synthesize/stream', async (req: Request, res: Response) => {
  const { conversations, focusArea } = req.body as BrainSynthesisRequest;

  if (!conversations || Object.keys(conversations).length === 0) {
    res.status(400).json({ error: 'At least one department conversation is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = streamSynthesis(conversations, focusArea);

    for await (const token of stream) {
      res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done', content: '' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Brain stream error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', content: 'Failed to synthesize' })}\n\n`);
    res.end();
  }
});

export default router;
