import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithPopup,
  GithubAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { auth, githubProvider } from '../lib/firebase';
import { User } from '../types';
import { getGlnkUsername } from '../utils/env';

const fetchGitHubUsername = async (accessToken: string): Promise<string | null> => {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  return data.login || null;
};

const extractAccessToken = (result: UserCredential): string | null => {
  const credential = GithubAuthProvider.credentialFromResult(result);
  return credential?.accessToken || null;
};

const isUsernameMismatch = (githubUsername: string | null, glnkUsername: string): boolean => {
  if (!githubUsername) {
    return false;
  }
  return githubUsername.toLowerCase() !== glnkUsername.toLowerCase();
};

const shouldHandleError = (error: any): boolean => {
  const isPopupClosed = error.code === 'auth/popup-closed-by-user';
  const isUsernameMismatch = error.message === 'GitHub username does not match glnk username';
  return !isPopupClosed && !isUsernameMismatch;
};

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

interface AuthProviderProps {
  children: ReactNode;
}

const mapFirebaseUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    providerId: firebaseUser.providerData[0]?.providerId,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const glnkUsername = getGlnkUsername();

  useEffect(() => {
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setUser(mapFirebaseUser(firebaseUser));
      setLoginError(null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (): Promise<void> => {
    if (!auth || typeof signInWithPopup !== 'function') {
      throw new Error('Firebase is not configured');
    }
    
    setLoginError(null);
    
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const accessToken = extractAccessToken(result);
      
      if (!accessToken) {
        throw new Error('Failed to get GitHub access token');
      }
      
      const githubUsername = await fetchGitHubUsername(accessToken);
      
      if (isUsernameMismatch(githubUsername, glnkUsername)) {
        if (auth && typeof firebaseSignOut === 'function') {
          await firebaseSignOut(auth);
        }
        setLoginError('username_mismatch');
        throw new Error('GitHub username does not match glnk username');
      }
    } catch (error: any) {
      if (shouldHandleError(error)) {
        setLoginError('login_failed');
        throw error;
      }
    }
  }, [glnkUsername]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (auth && typeof firebaseSignOut === 'function') {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    loginError,
    login,
    logout,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

