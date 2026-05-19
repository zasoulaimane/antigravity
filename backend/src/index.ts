import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import agentRoutes from './routes/agents.js';
import brainRoutes from './routes/brain.js';
import togafRoutes from './routes/togaf.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'antigravity-backend'
  });
});

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/brain', brainRoutes);
app.use('/api/togaf', togafRoutes);

app.listen(PORT, () => {
  console.log(`Antigravity backend running on port ${PORT}`);
});

export default app;
