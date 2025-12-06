import React, { useMemo, useState, useCallback, useEffect } from 'react';
import URLGenerator from '../components/URLGenerator';
import { TablePageProps } from '../types';
import { getGlnkUsername, getPublicUrl, isAuthorizedOnly } from '../utils/env';
import { ExternalLinkIcon } from '../components/icons/ExternalLinkIcon';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { CloseIcon } from '../components/icons/CloseIcon';
import { LoginOverlay } from '../components/LoginOverlay';
import { useAuth } from '../contexts/AuthContext';

const TablePage: React.FC<TablePageProps> = ({ redirectMap }) => {
  const glnkUsername = getGlnkUsername();
  const publicUrl = getPublicUrl();
  const authorizedOnly = isAuthorizedOnly();
  const { user, isAuthenticated, logout, login, loginError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showMismatchMessage, setShowMismatchMessage] = useState(true);
  
  const showLoginOverlay = authorizedOnly && !isAuthenticated;

  useEffect(() => {
    // When loginError becomes 'username_mismatch', show the message again
    if (loginError === 'username_mismatch') {
      setShowMismatchMessage(true);
    }
  }, [loginError]);

  const links = useMemo(
    () =>
      Object.entries(redirectMap).map(([key, value]) => ({
        subpath: key,
        redirectLink: value,
      })),
    [redirectMap]
  );

  const handleGitHubLogin = useCallback(async () => {
    setIsSigningIn(true);
    try {
      await login();
    } catch (error) {
      console.error('GitHub login error:', error);
    } finally {
      setIsSigningIn(false);
    }
  }, [login]);

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <a
              href={publicUrl}
              className="text-xl font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              <span className="font-bold">{glnkUsername}</span>
              <span className="text-gray-500">.glnk.dev</span>
            </a>
            {isAuthenticated && user ? (
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
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Sign out"
                  type="button"
                >
                  <LogoutIcon />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGitHubLogin}
                disabled={isSigningIn}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                type="button"
              >
                <GitHubIcon />
                <span className="text-sm">{isSigningIn ? 'Signing in...' : 'Sign in'}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {loginError === 'username_mismatch' && showMismatchMessage && (
          <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Username Mismatch
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your GitHub username doesn't match this glnk.dev site.
                </p>
                <a
                  href="https://glnk.dev/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span>Register for your own glnk.dev site</span>
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>
              </div>
              <button
                onClick={() => setShowMismatchMessage(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                title="Close"
                type="button"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}
        {links.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Subpath
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Redirect Link
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {links.map(({ subpath, redirectLink }) => (
                  <URLGenerator
                    key={subpath}
                    subpath={subpath}
                    template={redirectLink}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">No links configured yet.</p>
          </div>
        )}
      </main>
      
      {showLoginOverlay && <LoginOverlay onLogin={login} />}
    </div>
  );
};

export default TablePage;
