import { Router, Response } from 'express';
import { getAIGuidance, getInitialTips } from '../services/openaiService';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get initial tips for a level
router.post('/tips/:level', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.params;
    const tips = await getInitialTips(level);
    res.json({ tips });
  } catch (error) {
    console.error('Error getting tips:', error);
    res.status(500).json({ error: 'Failed to get tips' });
  }
});

// Get AI guidance on user code
router.post('/guidance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { level, userMessage, conversationHistory, isHint } = req.body;

    if (!level || !userMessage) {
      return res.status(400).json({ error: 'Level and message required' });
    }

    const guidance = await getAIGuidance(
      level,
      userMessage,
      conversationHistory || [],
      isHint || false
    );

    res.json({ guidance });
  } catch (error: any) {
    console.error('Error getting guidance:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to get AI guidance' });
  }
});

export default router;
