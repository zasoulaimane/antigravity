import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  generateTOGAFDocument,
  generateSinglePhase,
  getTOGAFPhases,
  exportToMarkdown
} from '../services/togaf.js';
import type { ChatMessage } from '../types/index.js';

const router = Router();

// Get available TOGAF phases
router.get('/phases', (_req: Request, res: Response) => {
  res.json(getTOGAFPhases());
});

// Generate full TOGAF document
router.post('/generate', async (req: Request, res: Response) => {
  const { synthesis, conversations, title } = req.body as {
    synthesis: string;
    conversations: Record<string, ChatMessage[]>;
    title?: string;
  };

  if (!synthesis) {
    res.status(400).json({ error: 'Synthesis content is required' });
    return;
  }

  try {
    const document = await generateTOGAFDocument(synthesis, conversations ?? {}, title);
    res.json(document);
  } catch (error) {
    console.error('TOGAF generation error:', error);
    res.status(500).json({ error: 'Failed to generate TOGAF document' });
  }
});

// Generate a single TOGAF phase
router.post('/generate/:phaseId', async (req: Request, res: Response) => {
  const phaseId = req.params.phaseId as string;
  const { synthesis } = req.body as { synthesis: string };

  if (!synthesis) {
    res.status(400).json({ error: 'Synthesis content is required' });
    return;
  }

  try {
    const phase = await generateSinglePhase(phaseId, synthesis);
    if (!phase) {
      res.status(404).json({ error: `Phase "${phaseId}" not found` });
      return;
    }
    res.json(phase);
  } catch (error) {
    console.error(`TOGAF phase ${phaseId} generation error:`, error);
    res.status(500).json({ error: 'Failed to generate TOGAF phase' });
  }
});

// Export TOGAF document as Markdown
router.post('/export/markdown', (req: Request, res: Response) => {
  const { document } = req.body as { document: Parameters<typeof exportToMarkdown>[0] };

  if (!document) {
    res.status(400).json({ error: 'Document is required' });
    return;
  }

  try {
    const markdown = exportToMarkdown(document);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename="togaf-architecture.md"');
    res.send(markdown);
  } catch (error) {
    console.error('TOGAF export error:', error);
    res.status(500).json({ error: 'Failed to export document' });
  }
});

export default router;
