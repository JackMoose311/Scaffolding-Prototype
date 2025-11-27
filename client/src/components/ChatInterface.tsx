import { useEffect, useState } from 'react';
import axios from 'axios';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  conversationId: number;
  token: string;
  onConversationUpdate: () => void;
}

export function ChatInterface({
  conversationId,
  token,
  onConversationUpdate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
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

    try {
      // Add user message
      const userResponse = await axios.post(
        `/api/messages/${conversationId}`,
        { role: 'user', content: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [...prev, userResponse.data]);
      onConversationUpdate();

      // TODO: Call AI API here and add assistant response
      // For now, you can add a placeholder response or integrate your AI service
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="text-slate-400">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400 text-center">
              <div className="text-4xl mb-2">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-slate-600 text-slate-50'
                    : 'bg-slate-700 text-slate-50'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs text-slate-400 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-900 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400 focus:ring-opacity-20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-slate-50 font-medium px-6 py-2 rounded-lg transition-colors"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
