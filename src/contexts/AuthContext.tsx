import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth, githubProvider } from '../lib/firebase';
import { User } from '../types';
import { getGlnkUsername } from '../utils/env';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const toUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    providerId: firebaseUser.providerData[0]?.providerId,
  };
};

const fetchGitHubLogin = async (accessToken: string): Promise<string | null> => {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.login ?? null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const isValidating = useRef(false);
  const siteOwner = getGlnkUsername();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
      if (isValidating.current) {
        setIsLoading(false);
        return;
      }
      setUser(toUser(firebaseUser));
      setLoginError(null);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async () => {
    if (!auth) throw new Error('Firebase not configured');

    setLoginError(null);
    isValidating.current = true;

    try {
      const result = await signInWithPopup(auth, githubProvider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      const githubLogin = await fetchGitHubLogin(accessToken);
      const isOwner = githubLogin?.toLowerCase() === siteOwner.toLowerCase();

      if (!isOwner) {
        await signOut(auth);
        setLoginError('username_mismatch');
        return;
      }

      setUser(toUser(result.user));
    } catch (error: unknown) {
      const isPopupClosed = (error as { code?: string }).code === 'auth/popup-closed-by-user';
      if (!isPopupClosed && !loginError) {
        setLoginError('login_failed');
      }
    } finally {
      isValidating.current = false;
    }
  }, [siteOwner, loginError]);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        loginError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
