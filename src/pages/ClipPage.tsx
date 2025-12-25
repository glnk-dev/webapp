import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { CopyIcon } from '../components/icons/CopyIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { listClips, createClip, deleteClip, Clip } from '../lib/firebase';

const ClipPage: React.FC = () => {
  const { user, isAuthenticated, login, logout, isLoading: authLoading, githubLogin } = useAuth();
  const [clips, setClips] = useState<Clip[]>([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingClips, setIsLoadingClips] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const username = githubLogin || '';

  useEffect(() => {
    if (!username) {
      setClips([]);
      return;
    }

    const fetchClips = async () => {
      if (!listClips) return;
      setIsLoadingClips(true);
      try {
        const result = await listClips({ username });
        setClips(result.data.clips);
      } catch (err: any) {
        console.error('Failed to fetch clips:', err);
        setError(err.message || 'Failed to load clips');
      } finally {
        setIsLoadingClips(false);
      }
    };

    fetchClips();
  }, [username]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim() || !username || !createClip) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const result = await createClip({ username, content: content.trim() });
        setClips((prev) => [result.data.clip, ...prev]);
        setContent('');
      } catch (err: any) {
        setError(err.message || 'Failed to save clip');
      } finally {
        setIsSubmitting(false);
      }
    },
    [content, username]
  );

  const handleDelete = useCallback(
    async (clipId: string) => {
      if (!username || !deleteClip) return;

      try {
        await deleteClip({ username, clipId });
        setClips((prev) => prev.filter((c) => c.id !== clipId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete clip');
      }
    },
    [username]
  );

  const handleCopy = useCallback(async (clip: Clip) => {
    await navigator.clipboard.writeText(clip.content);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="clip" className="w-6 h-6" />
              <span className="text-lg font-semibold">
                <span className="text-gray-900">clip</span>
                <span className="text-gray-400">.glnk.dev</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                  )}
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Sign out"
                  >
                    <LogoutIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={login}
                  disabled={authLoading}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <GitHubIcon className="w-5 h-5" />
                  <span>{authLoading ? 'Signing in...' : 'Sign in'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cloud Clipboard
          </h1>
          <p className="text-gray-500">Save text, access anywhere</p>
        </div>

        {/* Not logged in */}
        {!isAuthenticated && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 mb-4">Sign in with GitHub to save clips</p>
            <button
              onClick={login}
              disabled={authLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <GitHubIcon className="w-5 h-5" />
              <span>Sign in with GitHub</span>
            </button>
          </div>
        )}

        {/* Logged in */}
        {isAuthenticated && username && (
          <>
            {/* User info */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 text-center text-sm">
              <span className="text-orange-700">
                Saving to <strong>{username}</strong>'s clipboard
              </span>
            </div>

            {/* New clip form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm"
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-24 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-orange-300 focus:bg-white transition-all"
              />
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save clip'}
                </button>
              </div>
            </form>

            {/* Clips list */}
            {isLoadingClips ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : clips.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No clips yet. Create your first one!
              </div>
            ) : (
              <div className="space-y-3">
                {clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow group relative"
                  >
                    <div className="flex items-start gap-3">
                      <pre className="flex-1 text-sm text-gray-700 font-mono bg-gray-50 rounded-lg p-3 whitespace-pre-wrap break-all overflow-x-auto min-h-[60px]">
                        {clip.content}
                      </pre>
                      <div className="flex flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(clip)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Copy"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(clip.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(clip.createdAt).toLocaleString()}
                    </div>
                    {copiedId === clip.id && (
                      <div className="absolute top-2 right-12 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                        Copied!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <a
          href="https://glnk.dev"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Part of glnk.dev
        </a>
      </footer>
    </div>
  );
};

export default ClipPage;
