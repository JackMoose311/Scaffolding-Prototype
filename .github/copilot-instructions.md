# Copilot Instructions for AI Chat Interface Project

## Project Overview
This is a full-stack ChatGPT-like conversation interface with user authentication and persistent conversation history. It uses:
- **Frontend**: React + TypeScript + Tailwind CSS (gray metallic theme)
- **Backend**: Node.js/Express + SQLite
- **Authentication**: JWT with bcrypt password hashing

## Key Architecture Decisions

### Database Schema (see `server/database.ts`)
- **users**: Email-based registration with bcrypt hashed passwords
- **conversations**: User-owned chat threads with timestamps
- **messages**: Role-based messages (user/assistant) with timestamps
- Foreign key constraints enforce data integrity; cascade deletes clean up orphaned data

### Authentication Flow (see `server/middleware/auth.ts` & `server/routes/auth.ts`)
- JWT tokens issued on login/register, stored in localStorage on client
- Token passed via `Authorization: Bearer <token>` header in API requests
- `authenticateToken` middleware verifies JWT and extracts userId for route handlers

### Frontend State Management (see `client/src/contexts/AuthContext.tsx`)
- AuthContext provides global auth state (token, userId, email)
- `useAuth()` hook used throughout components to access auth state
- Local storage persists tokens across page refreshes

### Component Structure (see `client/src/components/`)
- **Login.tsx**: Auth page with register/login toggle
- **Dashboard.tsx**: Sidebar with conversation list + main chat area
- **ChatInterface.tsx**: Message display + input form for selected conversation

## Critical Development Workflows

### Local Development
```bash
npm run setup      # Install all dependencies
npm run dev        # Start both server (5000) and client (5173) concurrently
npm run dev:server # Start backend only (useful for debugging)
npm run dev:client # Start frontend only
```

### Adding New API Endpoints
1. Create new route file in `server/routes/`
2. Import and use `authenticateToken` middleware for protected routes
3. Access userId via `req.userId` from the AuthRequest interface
4. Get database via `const db = await getDatabase()`
5. Register route in `server/index.ts`: `app.use('/api/newroute', routeHandler)`

### Database Queries
Always use the sqlite API (not raw SQL) for safety:
```typescript
const db = await getDatabase();
const result = await db.run('INSERT INTO table ...', [param1, param2]);
const rows = await db.all('SELECT * FROM table');
const row = await db.get('SELECT * FROM table WHERE id = ?', [id]);
```

## Project-Specific Patterns

### Error Handling Pattern
Consistent across all routes:
```typescript
try {
  // Business logic
} catch (error) {
  console.error('Context-specific error:', error);
  res.status(500).json({ error: 'User-friendly message' });
}
```

### Authorization Pattern
Always verify resource ownership before returning/modifying:
```typescript
const resource = await db.get(
  'SELECT * FROM table WHERE id = ? AND user_id = ?',
  [resourceId, req.userId]
);
if (!resource) return res.status(404).json({ error: '...' });
```

### Message Role-Based Rendering
Messages are tagged with `role: 'user' | 'assistant'` to enable different styling and behaviors. Client renders user messages right-aligned, assistant messages left-aligned.

## Integration Points for AI

### Current State
Messages are stored in DB but assistant responses are stubbed. To add AI:

1. **In ChatInterface.tsx** (line ~60), after user message is saved:
   ```typescript
   // Call your AI service (OpenAI, Anthropic, local model, etc.)
   const assistantResponse = await callAIService(userMessage);
   
   // Save assistant response to DB
   const aiMsgResponse = await axios.post(`/api/messages/${conversationId}`, 
     { role: 'assistant', content: assistantResponse },
     { headers: { Authorization: `Bearer ${token}` } }
   );
   ```

2. **Environment setup**: Add API keys to `.env` (e.g., `OPENAI_API_KEY`)

3. **Backend integration**: Create `server/services/ai.ts` to handle AI API calls with error handling

## Styling & Theme

All styling uses Tailwind CSS with a custom gray metallic palette defined in `client/tailwind.config.js`:
- **Dark backgrounds**: slate-900 (`#0f172a`), slate-800 (`#1e293b`)
- **Interactive elements**: slate-600/700 for buttons/inputs
- **Text**: slate-50/100 for high contrast

CSS baseline in `client/src/index.css` sets global colors and input styling.

## Testing & Debugging

### Backend Debugging
```bash
# Check database contents
npm run dev:server
# Then in another terminal, you can examine .env DATABASE_PATH (./data/app.db)
```

### Frontend Debugging
- Check localStorage: DevTools → Application → Local Storage
- Network tab shows API requests/responses with auth headers
- React DevTools to inspect component state

### Common Issues
- **CORS errors**: Verify `cors()` middleware is first in Express app
- **401 Unauthorized**: Check token is saved in localStorage and included in request headers
- **Database locked**: Ensure only one process accesses app.db at a time

## Files to Reference When Adding Features

| Feature | Files |
|---------|-------|
| New protected route | `server/middleware/auth.ts`, `server/routes/auth.ts` |
| New data model | `server/database.ts` (add table), `server/routes/*.ts` (add endpoints) |
| New UI component | `client/src/components/`, `client/tailwind.config.js` for styling |
| Error handling | Search for `try/catch` blocks in any `server/routes/*.ts` |
| Auth state | `client/src/contexts/AuthContext.tsx`, `useAuth()` hook usage |

## Build & Deployment

```bash
npm run build     # Builds client React app to ./client/dist/
                  # Backend is deployed as-is (TypeScript needs compilation in production)
```

For production:
- Change NODE_ENV to "production"
- Use a process manager (PM2) to run `server/index.ts`
- Point frontend build to production API URL
- Ensure `.env` variables are set securely on production server
