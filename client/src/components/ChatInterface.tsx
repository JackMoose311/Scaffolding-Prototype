import { useEffect, useState } from 'react';
import axios from 'axios';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface EducationalChatProps {
  level: string;
  token: string;
  onBack: () => void;
}

const LEVEL_TIPS: Record<string, string> = {
  '1-2': `Welcome to Turtle Graphics! Here are the essential tips:
  
  🐢 **Turtle Commands:**
  - \`moveForward()\` - Move the turtle forward
  - \`turnLeft()\` - Turn left 90 degrees
  - These are your only tools for this level!
  
  **Goal:** Draw a 1x1 square to the front and left, ending where you started.
  
  **Hint:** Think about how many sides a square has and how many times you need to turn.
  
  Ready? Send your code and I'll guide you!`,

  '1-3': `Great! Now let's level up with **Turtle Graphics 1-3**:
  
  🐢 **Important:** No turnRight() this time! You only have:
  - \`moveForward()\` - Move forward
  - \`turnLeft()\` - Turn left 90 degrees
  
  **Goal:** Draw a 1x1 square to the front and RIGHT using only left turns!
  
  **Challenge:** How many left turns equal one right turn? 🤔
  
  Send your code when ready!`,

  '1-4': `Welcome to **Turtle Graphics 1-4**:
  
  🐢 **Commands Available:**
  - \`moveForward()\` - Move forward
  - \`turnLeft()\` - Turn left 90 degrees
  
  **Goal:** Draw a 3x3 grid (9 squares) to the front and right.
  
  **Think About:**
  - How many lines do you need?
  - What pattern can help you draw this efficiently?
  - Can you use loops? 
  
  Ready? Share your code!`,

  '2-2': `Excellent! Now we're learning **Functions 2-2**:
  
  📝 **Function Basics:**
  - A function is reusable code you write once and call many times
  - Define with \`function functionName() { }\`
  - Call it with \`functionName()\`
  
  **Goal:** Define a \`turnAround()\` function that turns the turtle 180 degrees.
  
  **Remember:** Call your functions BEFORE defining them in this lesson!
  
  Send your code to see how it works!`,

  '2-3': `Perfect! Let's master **Functions 2-3**:
  
  📝 **What You Know:**
  - How to define functions
  - turnAround() is pre-defined for you this time
  - moveForward() works as always
  
  **Goal:** Create a plus sign centered at the turtle's starting position.
  
  **Think About:**
  - A plus has 4 segments (up, down, left, right)
  - Each segment is one moveForward() long
  - Turtle should end where it started
  
  Send your code!`,
};

export function EducationalChat({ level, token, onBack }: EducationalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [tipsShown, setTipsShown] = useState(false);

  useEffect(() => {
    initializeChat();
  }, [level]);

  const initializeChat = async () => {
    try {
      setLoading(false);
      // Start with tips message
      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: LEVEL_TIPS[level] || 'Welcome! Ready to code?',
          created_at: new Date().toISOString(),
        },
      ]);
      setTipsShown(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input;
    setInput('');
    setSending(true);

    try {
      // Add user message
      const newMessage: Message = {
        id: messages.length + 1,
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);

      // TODO: Call Qwen API for AI response
      // For now, add placeholder response
      const aiResponse: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content:
          'I see your code! Let me guide you... [AI guidance would appear here when integrated with Qwen]',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleRequestHint = async () => {
    setSending(true);
    try {
      setHintCount(hintCount + 1);
      const hintMessage: Message = {
        id: messages.length + 1,
        role: 'assistant',
        content: `💡 **Hint ${hintCount + 1}:** [Specific hint based on your code would appear here]`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, hintMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleComplete = () => {
    setShowFeedbackForm(true);
  };

  const handleSubmitFeedback = async () => {
    // Export data to file
    const sessionData = {
      level,
      timestamp: new Date().toISOString(),
      hintsUsed: hintCount,
      conversation: messages,
      userFeedback: feedback,
    };

    // Download as JSON
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessionData, null, 2)));
    element.setAttribute('download', `level-${level}-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Reset and go back
    setShowFeedbackForm(false);
    setFeedback('');
    onBack();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (showFeedbackForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-slate-50 mb-2">Great Job! 🎉</h2>
            <p className="text-slate-400 mb-6">
              You completed level {level} using {hintCount} hint{hintCount !== 1 ? 's' : ''}!
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmitFeedback(); }} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  📝 Tell us about your experience:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  placeholder="How helpful was the AI? What could be improved? What did you learn?"
                  className="w-full h-32 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400 focus:ring-opacity-20"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-500 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Submit & Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Level {level}</h1>
            <p className="text-slate-400 text-sm">AI-Guided Coding Practice</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-slate-400 text-xs">Hints Used</p>
              <p className="text-2xl font-bold text-slate-50">{hintCount}</p>
            </div>
            <button
              onClick={onBack}
              className="bg-slate-600 hover:bg-slate-500 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-md lg:max-w-xl px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-slate-600 text-slate-50'
                  : 'bg-slate-700 text-slate-50 border border-slate-600'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className="text-xs text-slate-400 mt-2 block">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="border-t border-slate-700 bg-slate-900 p-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={handleRequestHint}
            disabled={sending}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            💡 Get a Hint
          </button>
          <button
            onClick={handleComplete}
            disabled={sending}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ✓ I'm Done!
          </button>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder="Paste your code or ask a question..."
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400 focus:ring-opacity-20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-slate-50 font-medium px-6 py-2 rounded-lg transition-colors"
          >
            {sending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

