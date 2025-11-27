import { Router, Response } from 'express';
import { getDatabase } from '../database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Create new conversation
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const db = await getDatabase();

    const result = await db.run(
      'INSERT INTO conversations (user_id, title) VALUES (?, ?)',
      [req.userId, title || 'New Chat']
    );

    const conversation = await db.get('SELECT * FROM conversations WHERE id = ?', [
      result.lastID,
    ]);

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get user's conversations
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDatabase();
    const conversations = await db.all(
      'SELECT id, title, created_at, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
      [req.userId]
    );
    res.json(conversations);
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get specific conversation with messages
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Verify ownership
    const conversation = await db.get(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await db.all(
      'SELECT id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [id]
    );

    res.json({ ...conversation, messages });
  } catch (error) {
    console.error('Fetch conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Delete conversation
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Verify ownership
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await db.run('DELETE FROM conversations WHERE id = ?', [id]);
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
