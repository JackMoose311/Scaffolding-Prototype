import React, { useState } from 'react';
import axios from 'axios';

interface AuthContextType {
  token: string | null;
  userId: number | null;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<number | null>(
    localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null
  );
  const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, userId: id, email: userEmail } = response.data;

    setToken(newToken);
    setUserId(id);
    setEmail(userEmail);

    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', id.toString());
    localStorage.setItem('email', userEmail);
  };

  const register = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/register', { email, password });
    const { token: newToken, userId: id, email: userEmail } = response.data;

    setToken(newToken);
    setUserId(id);
    setEmail(userEmail);

    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', id.toString());
    localStorage.setItem('email', userEmail);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setEmail(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  };

  return (
    <AuthContext.Provider value={{ token, userId, email, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
