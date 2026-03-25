import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface AuthState {
  isLoggedIn: boolean;
  cashOpened: boolean;
  cashOpenAmount: number;
  cashOpenDate: string;
}

interface AuthContextType extends AuthState {
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  openCash: (amount: number) => void;
}

const SESSION_KEY = 'pdv_session';

function loadSession(): AuthState {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) return JSON.parse(stored);
  return { isLoggedIn: false, cashOpened: false, cashOpenAmount: 0, cashOpenDate: '' };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadSession);

  const persist = (s: AuthState) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setState(s);
  };

  const login = useCallback((user: string, pass: string) => {
    if (user === '0001' && pass === '00000') {
      persist({ ...state, isLoggedIn: true });
      return true;
    }
    return false;
  }, [state]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setState({ isLoggedIn: false, cashOpened: false, cashOpenAmount: 0, cashOpenDate: '' });
  }, []);

  const openCash = useCallback((amount: number) => {
    const newState = { ...state, isLoggedIn: true, cashOpened: true, cashOpenAmount: amount, cashOpenDate: new Date().toISOString() };
    persist(newState);
  }, [state]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, openCash }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
