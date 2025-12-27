import React, { useState } from 'react';
import { GitHubIcon } from './icons/GitHubIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { getGlnkUsername } from '../utils/env';

interface LoginOverlayProps {
  onLogin: () => Promise<void>;
}

export const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const glnkUsername = getGlnkUsername();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await onLogin();
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2">
              <span className="text-gray-900">{glnkUsername}</span>
              <span className="text-gray-500">.glnk.dev</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to access this page
            </p>
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
            type="button"
          >
            <GitHubIcon className="w-5 h-5" />
            <span>{isLoading ? 'Signing in...' : 'Continue with GitHub'}</span>
          </button>
          
          <p className="mt-6 text-center text-xs text-gray-400">
            Only the owner of this site can sign in
          </p>
          
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-3">
              Want your own glnk.dev?
            </p>
            <a
              href="https://glnk.dev/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              <span>Join glnk.dev</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
