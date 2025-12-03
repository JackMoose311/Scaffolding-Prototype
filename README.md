# Code.org AI Learning Tutor

An AI-powered educational platform for learning to code using Qwen AI. Students work through Code.org levels with personalized AI guidance that teaches concepts without giving away solutions. Features user authentication, progress tracking, and session feedback collection.

## Features

- **Level-Based Learning**: Select from Code.org practice levels (1-2, 1-3, 2-2, etc.)
- **AI Guidance**: Groq AI provides tips, hints, and guidance without solving the problem
- **Hint Tracking**: Track how many hints were used per level
- **User Authentication**: Secure email/password registration and login with JWT
- **Session Feedback**: Collect user experience feedback after completing each level
- **Data Export**: Save complete session data (conversation, feedback, hint count) to JSON
- **Modern UI**: Gray metallic theme optimized for learning environment

## Project Structure

```
├── server/                 # Express.js backend
│   ├── index.ts           # Server entry point
│   ├── database.ts        # SQLite setup and initialization
│   ├── middleware/
│   │   └── auth.ts        # JWT authentication middleware
│   └── routes/
│       ├── auth.ts        # Authentication endpoints
│       ├── conversations.ts # Conversation management (future use)
│       └── messages.ts    # Message handling (future use)
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx           # Auth page (register/login)
│   │   │   ├── Dashboard.tsx       # Level selector and main interface
│   │   │   ├── LevelSelector.tsx   # Code.org level grid
│   │   │   └── ChatInterface.tsx   # Educational chat with hints & feedback
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

## Prerequisites
- Node.js 16+
- npm or yarn
- Groq API key (for AI guidance)

## Installation

1. **Clone and install dependencies**:
```bash
npm run setup
```

2. **Configure environment variables** (already set in `.env`):
```
PORT=5000
GROQ_API_KEY=your_groq_api_key
DATABASE_PATH=./data/app.db
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

## Development

Start both server and client in development mode:
```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## Individual Commands

```bash
npm run dev:server   # Run backend only
npm run dev:client   # Run frontend only
npm run build        # Build for production
npm start            # Run production build
```

## How It Works

### User Flow

1. **Register/Login**: Users create an account with email and password
2. **Select Level**: Browse available Code.org levels
3. **Receive Tips**: AI provides essential tips about the level topic
4. **Submit Code**: Paste their code for AI guidance
5. **Get Hints**: Request unlimited hints - AI guides without solving
6. **Mark Complete**: Click "I'm Done!" when finished
7. **Feedback**: Write about their experience and what could improve
8. **Export**: Session data saved as JSON (conversation, hints used, feedback)

### Educational Strategy

- **No Direct Answers**: AI guides students to solutions using Socratic method
- **Hint System**: Each hint is logged for progress tracking
- **Feedback Collection**: Understand what worked and what didn't
- **Session History**: Complete conversation preserved for review

## Available Levels

- **1-2**: Draw 1x1 square (basic turtle commands)
- **1-3**: Draw square with only left turns
- **1-4**: Draw 3x3 grid
- **2-2**: Define and call functions
- **2-3**: Use functions to create a plus sign
