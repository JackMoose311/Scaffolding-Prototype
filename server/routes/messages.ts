import { Router, Response } from 'express';
import { getDatabase } from '../database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Add message to conversation
router.post('/:conversationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content required' });
    }

    const db = await getDatabase();

    // Verify conversation ownership
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      [conversationId, req.userId]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Add message
    const result = await db.run(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversationId, role, content]
    );

    // Update conversation timestamp
    await db.run('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      conversationId,
    ]);

    const message = await db.get('SELECT id, role, content, created_at FROM messages WHERE id = ?', [
      result.lastID,
    ]);

    res.status(201).json(message);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Get conversation messages
router.get('/:conversationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const db = await getDatabase();

    // Verify conversation ownership
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      [conversationId, req.userId]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await db.all(
      'SELECT id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
