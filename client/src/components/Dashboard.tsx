import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatInterface } from './ChatInterface.tsx';
import axios from 'axios';

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export function Dashboard() {
  const { token, logout, email } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await axios.post(
        '/api/conversations',
        { title: 'New Chat' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations([response.data, ...conversations]);
      setSelectedConversation(response.data.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const deleteConversation = async (id: number) => {
    try {
      await axios.delete(`/api/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(conversations.filter((c) => c.id !== id));
      if (selectedConversation === id) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={createNewConversation}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors mb-2"
          >
            + New Chat
          </button>
          <div className="text-xs text-slate-400 truncate">{email}</div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-slate-500 text-sm">No conversations yet</div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group flex items-center gap-2"
                >
                  <button
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg truncate transition-colors ${
                      selectedConversation === conv.id
                        ? 'bg-slate-600 text-slate-50'
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-50'
                    }`}
                  >
                    {conv.title}
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-all"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface
            conversationId={selectedConversation}
            token={token || ''}
            onConversationUpdate={fetchConversations}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p>Select a conversation or create a new one to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
