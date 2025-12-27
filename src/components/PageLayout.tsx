import React from 'react';
import { Link } from 'react-router-dom';
import { GitHubIcon } from './icons/GitHubIcon';
import { XIcon, MailIcon } from './icons/FeatureIcons';
import { useAuth } from '../contexts/AuthContext';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const { login, isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/favicon.png" alt="glnk" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">glnk.dev</span>
            </Link>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={login}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <GitHubIcon className="w-5 h-5" />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        {children}
      </main>

      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <img src="/favicon.png" alt="glnk" className="w-5 h-5 opacity-50" />
              <span className="hidden sm:inline text-sm text-gray-500">© 2026 glnk.dev</span>
              <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-400">
                <Link to="/docs" className="hover:text-gray-600 transition-colors">Docs</Link>
                <Link to="/guide" className="hover:text-gray-600 transition-colors">Guide</Link>
                <Link to="/faq" className="hover:text-gray-600 transition-colors">FAQ</Link>
                <span className="text-gray-300">|</span>
                <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
              </div>
            </div>
            <div className="flex items-center gap-5 text-gray-400">
              <a href="https://github.com/glnk-dev" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors" title="GitHub">
                <GitHubIcon className="w-5 h-5" />
              </a>
              <a href="https://x.com/GlnkDev" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors" title="@GlnkDev">
                <XIcon className="w-5 h-5" />
              </a>
              <a href="mailto:support@glnk.dev" className="hover:text-gray-900 transition-colors" title="support@glnk.dev">
                <MailIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;


