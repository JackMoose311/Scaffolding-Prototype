import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router, Response } from 'express';
import { getDatabase } from '../database';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { config } from '../config';

const router = Router();

// Register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = await getDatabase();

    // Check if user exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.run(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    const userId = result.lastID;
    const token = jwt.sign({ userId }, config.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ userId, token, email });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = await getDatabase();

    // Find user
    const user = await db.get('SELECT id, password FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ userId: user.id, token, email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDatabase();
    const user = await db.get('SELECT id, email, created_at FROM users WHERE id = ?', [
      req.userId,
    ]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
