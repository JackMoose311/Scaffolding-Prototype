# AI Chat Interface

A modern ChatGPT-like conversation interface built with React, Express, and SQLite. Features user authentication, persistent conversation history, and a sleek gray metallic design.

## 🎨 Features

- **Modern UI**: Gray metallic theme with Tailwind CSS
- **User Authentication**: Email/password registration and login with JWT
- **Persistent Conversations**: Save and manage multiple conversations
- **Message History**: Full conversation history stored in SQLite
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Project Structure

```
├── server/                 # Express.js backend
│   ├── index.ts           # Server entry point
│   ├── database.ts        # SQLite setup and initialization
│   ├── middleware/
│   │   └── auth.ts        # JWT authentication middleware
│   └── routes/
│       ├── auth.ts        # Authentication endpoints
│       ├── conversations.ts # Conversation management
│       └── messages.ts    # Message handling
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx       # Auth page (register/login)
│   │   │   ├── Dashboard.tsx   # Main interface with sidebar
│   │   │   └── ChatInterface.tsx # Message display and input
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Auth state management
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Tailwind styles
│   ├── vite.config.ts     # Vite configuration
│   └── tailwind.config.js # Tailwind theme
├── .env                   # Environment variables
├── tsconfig.json          # Server TypeScript config
└── package.json           # Root package dependencies

```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
npm run setup
```

2. **Configure environment variables** (already set in `.env`):
```
PORT=5000
DATABASE_PATH=./data/app.db
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

### Development

Start both server and client in development mode:
```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

### Individual Commands

```bash
npm run dev:server   # Run backend only
npm run dev:client   # Run frontend only
npm run build        # Build for production
npm start            # Run production build
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations` - List user's conversations
- `GET /api/conversations/:id` - Get conversation with messages
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `POST /api/messages/:conversationId` - Add message to conversation
- `GET /api/messages/:conversationId` - Get messages from conversation

## 🎯 Next Steps

1. **Integrate AI Service**: Connect to an AI API (OpenAI, Anthropic, etc.)
   - Modify `ChatInterface.tsx` in the message handler to call your AI API
   - Add assistant response handling

2. **Enhance UI**: 
   - Add message editing and deletion
   - Implement conversation search
   - Add user settings/preferences

3. **Production**:
   - Change JWT_SECRET in `.env`
   - Set up production database
   - Configure CORS for production domain
   - Deploy to hosting service

## 🔐 Database Schema

### users
```sql
- id: INTEGER PRIMARY KEY
- email: TEXT UNIQUE NOT NULL
- password: TEXT NOT NULL (bcrypt hashed)
- created_at: DATETIME
- updated_at: DATETIME
```

### conversations
```sql
- id: INTEGER PRIMARY KEY
- user_id: INTEGER (FOREIGN KEY)
- title: TEXT
- created_at: DATETIME
- updated_at: DATETIME
```

### messages
```sql
- id: INTEGER PRIMARY KEY
- conversation_id: INTEGER (FOREIGN KEY)
- role: TEXT ('user' or 'assistant')
- content: TEXT
- created_at: DATETIME
```

## 🎨 Design System

- **Color Scheme**: Gray metallic theme
  - Dark base: `#0f172a` (slate-900)
  - Cards: `#1e293b` (slate-800)
  - Accents: `#475569` (slate-600)
  - Text: `#f1f5f9` (slate-100)

- **Typography**: System fonts for optimal rendering
- **Spacing**: Tailwind's standard scale

## 🤝 Contributing

Feel free to extend this project! Some ideas:
- Add real-time messaging with WebSockets
- Implement message reactions and pinning
- Add conversation sharing
- Create mobile app version

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.
