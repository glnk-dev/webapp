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
import { getGlnkUsername, isStatic, isHomepage } from '../utils/env';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  githubLogin: string | null;
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

const GITHUB_LOGIN_KEY = 'glnk_github_login';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const staticMode = isStatic();
  const homepageMode = isHomepage();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!staticMode);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [githubLogin, setGithubLogin] = useState<string | null>(() => localStorage.getItem(GITHUB_LOGIN_KEY));
  const isValidating = useRef(false);
  const siteOwner = getGlnkUsername();

  useEffect(() => {
    if (staticMode || !auth) {
      setIsLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
      if (isValidating.current) {
        setIsLoading(false);
        return;
      }
      setUser(toUser(firebaseUser));
      if (!firebaseUser) {
        localStorage.removeItem(GITHUB_LOGIN_KEY);
        setGithubLogin(null);
      }
      setLoginError(null);
      setIsLoading(false);
    });
  }, [staticMode]);

  const login = useCallback(async () => {
    if (!auth || !githubProvider) throw new Error('Firebase not configured');

    setLoginError(null);
    isValidating.current = true;

    try {
      const result = await signInWithPopup(auth, githubProvider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      const ghLogin = await fetchGitHubLogin(accessToken);

      if (homepageMode) {
        if (ghLogin) {
          localStorage.setItem(GITHUB_LOGIN_KEY, ghLogin);
        }
        setGithubLogin(ghLogin);
        setUser(toUser(result.user));
      } else {
        const isTestUser = siteOwner === '_test';
        const isOwner = isTestUser || ghLogin?.toLowerCase() === siteOwner.toLowerCase();
        if (!isOwner) {
          await signOut(auth);
          setLoginError('username_mismatch');
          return;
        }
        setUser(toUser(result.user));
      }
    } catch (error: unknown) {
      const isPopupClosed = (error as { code?: string }).code === 'auth/popup-closed-by-user';
      if (!isPopupClosed && !loginError) {
        setLoginError('login_failed');
      }
    } finally {
      isValidating.current = false;
    }
  }, [siteOwner, loginError, homepageMode]);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
    localStorage.removeItem(GITHUB_LOGIN_KEY);
    setGithubLogin(null);
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
        githubLogin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
