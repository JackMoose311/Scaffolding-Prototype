import { useState } from 'react';

interface LevelSelectorProps {
  onSelectLevel: (level: string) => void;
}

const LEVELS = [
  {
    id: '1-2',
    title: 'Turtle Graphics 1-2',
    description: 'Draw a 1x1 square using turtle commands',
    difficulty: 'Beginner',
  },
  {
    id: '1-3',
    title: 'Turtle Graphics 1-3',
    description: 'Draw a square using only left turns and forward moves',
    difficulty: 'Beginner',
  },
  {
    id: '1-4',
    title: 'Turtle Graphics 1-4',
    description: 'Draw a 3x3 grid using turtle commands',
    difficulty: 'Intermediate',
  },
  {
    id: '2-2',
    title: 'Functions 2-2',
    description: 'Define and call a turnAround function',
    difficulty: 'Intermediate',
  },
  {
    id: '2-3',
    title: 'Functions 2-3',
    description: 'Create a plus sign using functions',
    difficulty: 'Intermediate',
  },
];

export function LevelSelector({ onSelectLevel }: LevelSelectorProps) {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-50 mb-4">Code.org Learning</h1>
          <p className="text-xl text-slate-400">
            Select a level and get AI-powered guidance to learn coding
          </p>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => onSelectLevel(level.id)}
              onMouseEnter={() => setHoveredLevel(level.id)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                hoveredLevel === level.id
                  ? 'bg-slate-700 border-slate-500 shadow-lg shadow-slate-500/50'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Difficulty Badge */}
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  level.difficulty === 'Beginner'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-orange-500/20 text-orange-300'
                }`}
              >
                {level.difficulty}
              </div>

              {/* Level ID */}
              <h2 className="text-2xl font-bold text-slate-50 mb-2">{level.id}</h2>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-200 mb-2">{level.title}</h3>

              {/* Description */}
              <p className="text-slate-400 mb-4 text-sm">{level.description}</p>

              {/* Arrow */}
              <div
                className={`flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors ${
                  hoveredLevel === level.id ? 'translate-x-2' : ''
                } duration-300`}
              >
                <span>Start Learning</span>
                <span className="text-lg">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            💡 Each level will provide tips, then guide you through your code without giving away the solution
          </p>
        </div>
      </div>
    </div>
  );
}
