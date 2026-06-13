import React from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { KeyIcon } from './icons/KeyIcon';
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
  onOpenTotp?: () => void;
  onOpenCode?: () => void;
  topOffset?: number;
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
  onOpenTotp,
  onOpenCode,
  topOffset = 0,
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
    <nav className="fixed left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100" style={{ top: `${topOffset}px` }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <a href="https://glnk.dev" className="flex-shrink-0" title="glnk.dev">
              <img src="/favicon.png" alt="glnk.dev" className="w-6 h-6 sm:w-7 sm:h-7" />
            </a>
            <a
              href={publicUrl}
              className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-gray-600 transition-colors truncate"
            >
              <span className="font-bold">{username}</span>
              <span className="text-gray-400">.glnk.dev</span>
            </a>
          </div>
          {staticMode ? (
            <a
              href="https://glnk.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <span className="sm:hidden">glnk.dev</span>
              <span className="hidden sm:inline">Get your own glnk.dev</span>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || username}
                    className="w-5 h-5 sm:w-7 sm:h-7 rounded-full"
                  />
                )}
                <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[150px] truncate">
                  {user.displayName || username}
                </span>
                {onOpenTotp && (
                  <button
                    onClick={onOpenTotp}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Two-factor authentication"
                    type="button"
                  >
                    <ShieldIcon />
                  </button>
                )}
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
              <div className="flex items-center gap-3">
                {onOpenCode && (
                  <button
                    onClick={onOpenCode}
                    className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full transition-colors whitespace-nowrap"
                    type="button"
                    title="Use authenticator code"
                  >
                    <KeyIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Use code</span>
                  </button>
                )}
                <button
                  onClick={onLogin}
                  disabled={isSigningIn}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 whitespace-nowrap"
                  type="button"
                  title="Sign in with GitHub"
                >
                  <GithubIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{isSigningIn ? 'Signing in...' : 'Sign in'}</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
