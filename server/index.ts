import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from root directory
// __dirname is server/dist after compilation, so go up two levels to reach root
const envPath = path.resolve(__dirname, '..', '..', '.env');
console.log('Loading .env from:', envPath);

// Check if file exists
if (fs.existsSync(envPath)) {
  console.log('.env file exists');
  const result = dotenv.config({ path: envPath });
  console.log('Dotenv config result:', result.error ? `Error: ${result.error}` : 'Success');
  
  // Log what was parsed
  if (result.parsed) {
    console.log('Parsed variables:', Object.keys(result.parsed));
  }
} else {
  console.log('.env file NOT found at', envPath);
}

// Import config to ensure all environment variables are loaded
import { config } from './config';

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database';
import authRoutes from './routes/auth';
import conversationRoutes from './routes/conversations';
import messageRoutes from './routes/messages';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
let dbReady = false;
initializeDatabase()
  .then(() => {
    dbReady = true;
    console.log('Database ready');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', dbReady });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
