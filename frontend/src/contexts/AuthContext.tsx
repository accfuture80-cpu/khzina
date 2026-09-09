import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../api/client';

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('khazina_user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(username: string, password: string) {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('khazina_token', data.access_token);
    localStorage.setItem('khazina_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('khazina_token');
    localStorage.removeItem('khazina_user');
    setUser(null);
  }

  function hasRole(...roles: string[]) {
    if (!user) return false;
    return roles.some((r) => user.roles.includes(r));
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth لازم يتستخدم جوا AuthProvider');
  return ctx;
}
