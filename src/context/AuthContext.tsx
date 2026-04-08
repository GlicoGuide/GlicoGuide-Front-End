import React, { createContext, useContext, useState } from 'react';
import { login as apiLogin, setToken } from '../services/api';

interface User {
  email: string;
  name: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function decodeJwtName(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || '';
  } catch {
    return '';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  async function signIn(email: string, password: string) {
    const jwt = await apiLogin(email, password);
    setToken(jwt);
    setTokenState(jwt);
    const name = decodeJwtName(jwt) || email.split('@')[0];
    setUser({ email, name });
  }

  function signOut() {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
