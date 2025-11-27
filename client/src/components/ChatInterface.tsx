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
  '1-2': 'Draw a 1x1 square to the front and left. Available: moveForward(), turnLeft(). Think about the geometry and command order.',

  '1-3': 'Draw a 1x1 square to the front and right using only left turns. Available: moveForward(), turnLeft(). Consider how multiple left turns work.',

  '1-4': 'Draw a 3x3 grid. Available: moveForward(), turnLeft(). Think about patterns and efficiency.',

  '2-2': 'Define a turnAround() function that rotates 180 degrees. Remember: functions are called before they are defined in this lesson.',

  '2-3': 'Create a plus sign centered at your starting position using functions. A plus has 4 segments.',
};

export function EducationalChat({ level, token, onBack }: EducationalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    initializeChat();
  }, [level]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError('');

      // Get AI-generated tips
      const tipsResponse = await axios.post(
        `/api/ai/tips/${level}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: tipsResponse.data.tips,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: LEVEL_TIPS[level] || 'Welcome! Ready to code?',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input;
    setInput('');
    setSending(true);
    setError('');

    try {
      // Add user message
      const newUserMessage: Message = {
        id: messages.length + 1,
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newUserMessage]);

      // Get AI guidance
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const guidanceResponse = await axios.post(
        '/api/ai/guidance',
        {
          level,
          userMessage,
          conversationHistory,
          isHint: false,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add AI response
      const aiMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: guidanceResponse.data.guidance,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.error || 'Failed to get AI response');
    } finally {
      setSending(false);
    }
  };

  const handleRequestHint = async () => {
    setSending(true);
    setError('');
    try {
      setHintCount(hintCount + 1);

      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const hintResponse = await axios.post(
        '/api/ai/guidance',
        {
          level,
          userMessage: 'Can you give me a hint on what I should do next?',
          conversationHistory,
          isHint: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const hintMessage: Message = {
        id: messages.length + 1,
        role: 'assistant',
        content: `Hint ${hintCount}: ${hintResponse.data.guidance}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, hintMessage]);
    } catch (err: any) {
      console.error('Failed to get hint:', err);
      setError(err.response?.data?.error || 'Failed to get hint');
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
        <div className="text-center">
          <div className="text-slate-400 mb-4">Loading tips...</div>
          <div className="inline-block animate-spin">⏳</div>
        </div>
      </div>
    );
  }

  if (showFeedbackForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-slate-50 mb-2">Complete</h2>
            <p className="text-slate-400 mb-6">
              You completed level {level} using {hintCount} hint{hintCount !== 1 ? 's' : ''}.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmitFeedback(); }} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Feedback:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  placeholder="How was your experience? What would you improve?"
                  className="w-full h-32 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400 focus:ring-opacity-20"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-500 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Submit and Save
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
            <p className="text-slate-400 text-sm">Coding Practice</p>
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
              Back
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 mx-6 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-slate-700 bg-slate-900 p-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={handleRequestHint}
            disabled={sending}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Get a Hint
          </button>
          <button
            onClick={handleComplete}
            disabled={sending}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Done
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

