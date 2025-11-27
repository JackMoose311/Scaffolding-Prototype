import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-50 mb-2">AI Chat</h1>
          <p className="text-slate-400">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400 focus:ring-opacity-20"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400 focus:ring-opacity-20"
                placeholder="••••••••"
              />
            </div>

            {/* Error */}
            {error && <div className="text-red-400 text-sm">{error}</div>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-slate-50 font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading
                ? 'Loading...'
                : isRegister
                  ? 'Create Account'
                  : 'Sign In'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isRegister
                ? 'Already have an account? '
                : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
              >
                {isRegister ? 'Sign In' : 'Create One'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          Your conversations are encrypted and private
        </p>
      </div>
    </div>
  );
}
