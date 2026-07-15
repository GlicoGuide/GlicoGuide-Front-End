import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Keychain from 'react-native-keychain';
import {
  login as apiLogin, register as apiRegister, setToken, setRefreshToken, setUnauthorizedHandler,
} from '../services/api';

interface User {
  email: string;
  name:  string;
}

interface AuthContextData {
  user:      User | null;
  token:     string | null;
  isLoading: boolean;
  signIn:    (email: string, password: string) => Promise<void>;
  signUp:    (name: string, email: string, password: string, consentimento: boolean) => Promise<void>;
  signOut:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const KEYCHAIN_SERVICE = 'glicoguide_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]       = useState<User | null>(null);
  const [token,     setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading]  = useState(true);

  // Restaura sessão ao abrir o app
  useEffect(() => {
    async function restoreSession() {
      try {
        const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
        if (credentials) {
          const { username: jwt, password: savedData } = credentials;
          const { name, email, refreshToken } = JSON.parse(savedData);
          setToken(jwt);
          setRefreshToken(refreshToken ?? null);
          setTokenState(jwt);
          setUser({ name, email });
        }
      } catch {
        // sem sessão salva
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  // Desloga automaticamente se o refresh token também expirar/for inválido
  useEffect(() => {
    setUnauthorizedHandler(() => { signOut(); });
    return () => setUnauthorizedHandler(null);
  }, []);

  async function signIn(email: string, password: string) {
    const { token: jwt, refresh_token: refreshToken, name, email: userEmail } = await apiLogin(email, password);

    // Armazena tokens de forma segura no keychain do dispositivo

    await Keychain.setGenericPassword(
      jwt,
      JSON.stringify({ name, email: userEmail, refreshToken }),
      { service: KEYCHAIN_SERVICE },
    );

    setToken(jwt);
    setRefreshToken(refreshToken);
    setTokenState(jwt);
    setUser({ email: userEmail, name: name || userEmail.split('@')[0] });
  }

  async function signUp(name: string, email: string, password: string, consentimento: boolean) {
    await apiRegister(name, email, password, consentimento);
    await signIn(email, password);
  }

  async function signOut() {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    setToken(null);
    setRefreshToken(null);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
