import React, { useState } from 'react';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { ExternalLinkIcon } from '../components/icons/ExternalLinkIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { useAuth } from '../contexts/AuthContext';
import { requestSignup } from '../lib/firebase';

const SignUpPage: React.FC = () => {
  const { githubLogin, login, logout, isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const username = githubLogin || '';
  const previewUrl = username ? `${username.toLowerCase()}.glnk.dev` : 'username.glnk.dev';

  const handleGitHubLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch {
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !requestSignup) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await requestSignup({ username });
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit request';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Request Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your registration request for <span className="font-medium text-gray-900">{username}.glnk.dev</span> has been submitted.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">1.</span>
                  <span>A GitHub repository will be created for your site</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">2.</span>
                  <span>GitHub Pages will deploy your site automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">3.</span>
                  <span>You'll receive an email when your site is ready</span>
                </li>
              </ul>
            </div>
            <a
              href={`https://${previewUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              <span>Check your site</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-semibold text-gray-900">glnk.dev</span>
            {isAuthenticated && user && (
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img src={user.photoURL} alt={githubLogin || 'User'} className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-gray-600">{githubLogin}</span>
                <button onClick={logout} className="text-gray-400 hover:text-gray-600 transition-colors" type="button">
                  <LogoutIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create your glnk.dev</h1>
              <p className="text-gray-500 text-sm">Get your own personalized short link domain</p>
            </div>

            {!isAuthenticated || !username ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-6">
                  {isAuthenticated ? 'Please sign in again to continue' : 'Sign in with GitHub to continue'}
                </p>
                <button
                  onClick={handleGitHubLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
                  type="button"
                >
                  <GitHubIcon className="w-5 h-5" />
                  <span>{isLoggingIn ? 'Signing in...' : 'Continue with GitHub'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your site will be</p>
                  <p className="text-lg font-semibold">
                    <span className="text-gray-900">{username}</span>
                    <span className="text-gray-400">.glnk.dev</span>
                  </p>
                </div>

                <div className="mb-6 space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">What you'll get:</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {['Your own domain', 'Unlimited short links', 'Free GitHub Pages hosting', 'Full control'].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!username || isSubmitting || !requestSignup}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating your site...</span>
                    </>
                  ) : (
                    <span>Create {previewUrl}</span>
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-gray-400">By continuing, you agree to our terms of service</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

