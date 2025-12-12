import React from 'react';
import { GitHubIcon } from './icons/GitHubIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { User } from '../types';

interface NavBarProps {
  username: string;
  publicUrl: string;
  staticMode: boolean;
  isAuthenticated: boolean;
  user: User | null;
  isSigningIn: boolean;
  hasUnsavedChanges: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  username,
  publicUrl,
  staticMode,
  isAuthenticated,
  user,
  isSigningIn,
  hasUnsavedChanges,
  onLogin,
  onLogout,
}) => {
  const handleLogout = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Your changes have not been saved. Are you sure you want to sign out?')) {
        onLogout();
      }
    } else {
      onLogout();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <a
            href={publicUrl}
            className="text-xl font-semibold text-gray-900 hover:text-gray-600 transition-colors"
          >
            <span className="font-bold">{username}</span>
            <span className="text-gray-500">.glnk.dev</span>
          </a>
          {!staticMode && (
            isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-600">
                  {user.displayName || user.email || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Sign out"
                  type="button"
                >
                  <LogoutIcon />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isSigningIn}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                type="button"
              >
                <GitHubIcon />
                <span className="text-sm">{isSigningIn ? 'Signing in...' : 'Sign in'}</span>
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

