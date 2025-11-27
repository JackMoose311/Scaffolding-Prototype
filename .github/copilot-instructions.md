# Copilot Instructions for Code.org AI Learning Tutor

## Project Overview
This is an AI-powered educational platform for learning to code. Students work through Code.org levels with personalized guidance from Qwen AI. The AI teaches concepts without giving away solutions, using a Socratic method approach.

- **Frontend**: React + TypeScript + Tailwind CSS (gray metallic theme)
- **Backend**: Node.js/Express + SQLite
- **Authentication**: JWT with bcrypt password hashing
- **AI**: Qwen API for educational guidance

## Key Architecture Decisions

### Educational Flow (see `client/src/components/`)
- **LevelSelector.tsx**: Grid of Code.org levels with difficulty indicators
- **EducationalChat.tsx**: Main learning interface with:
  - AI tips on level topic (shown at start)
  - Student code submission area
  - Hint request button (with counter)
  - "I'm Done!" button for completion
  - Feedback form with session export

### Database Schema (see `server/database.ts`)
- **users**: Email-based authentication with bcrypt hashed passwords
- **conversations**: Legacy table (can be repurposed for session tracking)
- **messages**: Stores chat history per session

### Authentication Flow (see `server/middleware/auth.ts`)
- JWT tokens issued on login/register, stored in localStorage
- Token passed via `Authorization: Bearer <token>` header
- `authenticateToken` middleware verifies JWT and extracts userId

### Session Data Export
When students complete a level, the system exports:
```json
{
  "level": "1-2",
  "timestamp": "...",
  "hintsUsed": 2,
  "userFeedback": "...",
  "conversation": [...]
}
```
Downloaded as `level-{level}-{timestamp}.json`

## Critical Development Workflows

### Local Development
```bash
npm run setup      # Install all dependencies
npm run dev        # Start both server (5000) and client (5174) concurrently
npm run dev:server # Start backend only
npm run dev:client # Start frontend only
```

### Adding Qwen AI Integration
1. Set `QWEN_API_KEY` in `.env`
2. Create `server/services/qwenAI.ts` with function that calls Qwen API
3. Update `EducationalChat.tsx` to call Qwen when:
   - User sends code (for guidance)
   - User clicks "Get a Hint" (for hint)
4. Use system prompts that emphasize Socratic method

### Level Configuration
Add new levels in `client/src/components/LevelSelector.tsx`:
- Add to `LEVELS` array with id, title, description, difficulty
- Add tips to `LEVEL_TIPS` object in `EducationalChat.tsx`

## Project-Specific Patterns

### Error Handling
Consistent pattern across all routes:
```typescript
try {
  // Business logic
} catch (error) {
  console.error('Context-specific error:', error);
  res.status(500).json({ error: 'User-friendly message' });
}
```

### Authorization
Always verify user owns resource before modifying:
```typescript
const resource = await db.get(
  'SELECT * FROM table WHERE id = ? AND user_id = ?',
  [resourceId, req.userId]
);
if (!resource) return res.status(404).json({ error: '...' });
```

### Hint System
Track hints in component state (`hintCount`), display counter in header.
Each hint click:
1. Increments counter
2. Calls Qwen API with `isHint: true` flag
3. Adds response to messages

### Feedback Collection
Shows modal after user clicks "I'm Done!":
- Textarea for experience feedback
- Submit button exports JSON + shows success
- Cancel button returns to chat

## Styling & Theme

All UI uses Tailwind CSS with gray metallic palette:
- **Dark backgrounds**: slate-900 (`#0f172a`), slate-800 (`#1e293b`)
- **Interactive elements**: slate-600/700 for buttons/inputs
- **Success states**: green-600 for completion buttons
- **Hint buttons**: yellow-600 for visual distinction
- **Text**: slate-50/100 for high contrast

CSS baseline in `client/src/index.css` sets global colors.

## Testing & Debugging

### Backend Debugging
```bash
npm run dev:server
# Check logs for "Database initialized", "Server running on port 5000"
# Database file: ./data/app.db
```

### Frontend Debugging
- Check localStorage for `token`, `userId`, `email`
- Network tab shows API calls with auth headers
- React DevTools to inspect component state (hintCount, showFeedbackForm)

### Common Issues
- **CORS errors**: Verify `cors()` is first middleware in Express
- **401 Unauthorized**: Check token in localStorage and auth headers
- **Session not exporting**: Verify feedback form submission completes
- **AI not responding**: Check QWEN_API_KEY in .env

## Files to Reference When Adding Features

| Feature | Files |
|---------|-------|
| New level | `LevelSelector.tsx` (add to LEVELS), `EducationalChat.tsx` (add tips) |
| AI integration | `server/services/qwenAI.ts` (create), `EducationalChat.tsx` (call API) |
| Session tracking | `server/database.ts` (extend schema), API routes |
| Hint system enhancements | `EducationalChat.tsx` (handleRequestHint) |
| Export format changes | `EducationalChat.tsx` (handleSubmitFeedback) |

## Build & Deployment

```bash
npm run build     # Builds client React app to ./client/dist/
```

For production:
- Change NODE_ENV to "production"
- Add QWEN_API_KEY to production environment
- Use process manager (PM2) for Node server
- Serve static files from ./client/dist/
- Set secure JWT_SECRET and CORS domain

