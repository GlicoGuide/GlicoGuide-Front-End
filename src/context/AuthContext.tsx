import React, { createContext, useContext, useState } from 'react';
import { login as apiLogin, register as apiRegister, setToken } from '../services/api';

interface User {
  email: string;
  name: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  async function signIn(email: string, password: string) {
    // O backend retorna token + name + email diretamente
    const { token: jwt, name, email: userEmail } = await apiLogin(email, password);
    setToken(jwt);
    setTokenState(jwt);
    setUser({ email: userEmail, name: name || userEmail.split('@')[0] });
  }

  async function signUp(name: string, email: string, password: string) {
    await apiRegister(name, email, password);
    await signIn(email, password);
  }

  function signOut() {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
