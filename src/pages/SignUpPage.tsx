import React, { useState, useCallback } from 'react';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { ExternalLinkIcon } from '../components/icons/ExternalLinkIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { useAuth } from '../contexts/AuthContext';
import { requestSignup } from '../lib/firebase';

interface InitialLink {
  subpath: string;
  redirectLink: string;
}

const getDefaultLinks = (username: string): InitialLink[] => [
  { subpath: 'github', redirectLink: `https://github.com/${username}` },
  { subpath: 'blog', redirectLink: `https://${username}.github.io` },
];

const SignUpPage: React.FC = () => {
  const { githubLogin, login, logout, isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<InitialLink[]>([]);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const username = githubLogin || '';
  const previewUrl = username ? `${username.toLowerCase()}.glnk.dev` : 'username.glnk.dev';

  // Initialize/reset links when username changes
  React.useEffect(() => {
    if (username && username !== initializedFor) {
      setLinks(getDefaultLinks(username));
      setInitializedFor(username);
    } else if (!username && initializedFor) {
      setLinks([]);
      setInitializedFor(null);
    }
  }, [username, initializedFor]);

  const handleGitHubLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch {
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAddLink = useCallback(() => {
    setLinks((prev) => [...prev, { subpath: '', redirectLink: '' }]);
  }, []);

  const handleDeleteLink = useCallback((index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdateLink = useCallback((index: number, field: 'subpath' | 'redirectLink', value: string) => {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }, []);

  const getValidLinks = (linkList: InitialLink[]): InitialLink[] => {
    return linkList.filter((l) => l.subpath.trim() && l.redirectLink.trim());
  };

  const hasDuplicates = (linkList: InitialLink[]): boolean => {
    const subpaths = linkList.map((l) => l.subpath.trim()).filter(Boolean);
    return new Set(subpaths).size !== subpaths.length;
  };

  const linksToYaml = (linkList: InitialLink[]): string => {
    const validLinks = getValidLinks(linkList);
    if (validLinks.length === 0) return '';
    return validLinks.map((l) => `"/${l.subpath.trim()}": "${l.redirectLink.trim()}"`).join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !requestSignup) return;

    if (hasDuplicates(links)) {
      setError('Duplicate paths are not allowed');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const initialLinks = linksToYaml(links);
      await requestSignup({ username, initial_links: initialLinks });
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit request';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validLinkCount = links.filter((l) => l.subpath.trim() && l.redirectLink.trim()).length;

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
        <div className="w-full max-w-xl">
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

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Initial Links</h3>
                    <span className="text-xs text-gray-400">
                      {validLinkCount} link{validLinkCount !== 1 ? 's' : ''} configured
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="w-28 text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Path</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Redirect URL</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {links.map((link, index) => {
                          const isDuplicate = links.some((l, i) => i !== index && l.subpath.trim() === link.subpath.trim() && link.subpath.trim());
                          return (
                            <tr key={index} className={index !== links.length - 1 ? 'border-b border-gray-100' : ''}>
                              <td className="py-2 px-3">
                                <div className="flex items-center">
                                  <span className="text-gray-400 text-sm mr-1">/</span>
                                  <input
                                    type="text"
                                    value={link.subpath}
                                    onChange={(e) => handleUpdateLink(index, 'subpath', e.target.value)}
                                    placeholder="path"
                                    className={`w-full text-sm bg-transparent focus:outline-none font-mono ${isDuplicate ? 'text-red-500' : ''}`}
                                  />
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={link.redirectLink}
                                  onChange={(e) => handleUpdateLink(index, 'redirectLink', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full text-sm bg-transparent focus:outline-none text-gray-600"
                                />
                              </td>
                              <td className="py-2 pr-3">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLink(index)}
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add link</span>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">You can always add or edit links after your site is created.</p>
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
