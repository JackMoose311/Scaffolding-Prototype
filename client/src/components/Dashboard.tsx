import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EducationalChat } from './ChatInterface.tsx';
import { LevelSelector } from './LevelSelector.tsx';

export function Dashboard() {
  const { logout, email } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [token] = useState(localStorage.getItem('token') || '');

  const handleBackToLevels = () => {
    setSelectedLevel(null);
  };

  if (selectedLevel) {
    return (
      <EducationalChat
        level={selectedLevel}
        token={token}
        onBack={handleBackToLevels}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Code.org Tutor</h1>
            <p className="text-slate-400 text-sm">Learning with AI Guidance</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="text-slate-400">Logged in as</p>
              <p className="text-slate-50 font-medium">{email}</p>
            </div>
            <button
              onClick={logout}
              className="bg-slate-600 hover:bg-slate-500 text-slate-50 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Level Selector */}
      <div className="p-8">
        <LevelSelector onSelectLevel={setSelectedLevel} />
      </div>
    </div>
  );
}
