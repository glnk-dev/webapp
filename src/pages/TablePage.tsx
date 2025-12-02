import React, { useMemo, useState, useCallback } from 'react';
import URLGenerator from '../components/URLGenerator';
import { TablePageProps } from '../types';
import { getGlnkUsername, getPublicUrl } from '../utils/env';
import { GLNK_BASE_URL } from '../constants';
import { ExternalLinkIcon } from '../components/icons/ExternalLinkIcon';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { useAuth } from '../contexts/AuthContext';

const TablePage: React.FC<TablePageProps> = ({ redirectMap }) => {
  const glnkUsername = getGlnkUsername();
  const publicUrl = getPublicUrl();
  const { user, isAuthenticated, logout, login } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

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
      <nav className="border-b border-gray-200">
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
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  type="button"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGitHubLogin}
                  disabled={isSigningIn}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                  type="button"
                >
                  <GitHubIcon />
                  <span className="text-sm">{isSigningIn ? 'Signing in...' : 'Sign in'}</span>
                </button>
                <a
                  href={GLNK_BASE_URL}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Join glnk.dev"
                >
                  <ExternalLinkIcon />
                  <span className="text-sm">Join glnk.dev</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
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
    </div>
  );
};

export default TablePage;
