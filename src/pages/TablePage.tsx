import React, { useMemo, useState, useCallback, useEffect } from 'react';
import URLGenerator from '../components/URLGenerator';
import { TablePageProps } from '../types';
import { getGlnkUsername, getPublicUrl, isAuthorizedOnly } from '../utils/env';
import { ExternalLinkIcon } from '../components/icons/ExternalLinkIcon';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { CloseIcon } from '../components/icons/CloseIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { LoginOverlay } from '../components/LoginOverlay';
import { useAuth } from '../contexts/AuthContext';

interface EditableLink {
  id: string;
  subpath: string;
  redirectLink: string;
  isNew?: boolean;
}

const TablePage: React.FC<TablePageProps> = ({ redirectMap }) => {
  const glnkUsername = getGlnkUsername();
  const publicUrl = getPublicUrl();
  const authorizedOnly = isAuthorizedOnly();
  const { user, isAuthenticated, logout, login, loginError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showMismatchMessage, setShowMismatchMessage] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableLinks, setEditableLinks] = useState<EditableLink[]>([]);
  
  const showLoginOverlay = authorizedOnly && !isAuthenticated;

  const links = useMemo(
    () =>
      Object.entries(redirectMap).map(([key, value]) => ({
        subpath: key,
        redirectLink: value,
      })),
    [redirectMap]
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!isEditMode) return false;
    if (editableLinks.length !== links.length) return true;
    return editableLinks.some((editLink, index) => {
      const originalLink = links[index];
      if (!originalLink) return true;
      return editLink.subpath !== originalLink.subpath || 
             editLink.redirectLink !== originalLink.redirectLink;
    });
  }, [isEditMode, editableLinks, links]);

  useEffect(() => {
    if (loginError === 'username_mismatch') {
      setShowMismatchMessage(true);
    }
  }, [loginError]);

  useEffect(() => {
    if (!isAuthenticated && isEditMode) {
      setIsEditMode(false);
      setEditableLinks(
        Object.entries(redirectMap).map(([key, value], index) => ({
          id: `link-${index}`,
          subpath: key,
          redirectLink: value,
        }))
      );
    }
  }, [isAuthenticated, isEditMode, redirectMap]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    setEditableLinks(
      Object.entries(redirectMap).map(([key, value], index) => ({
        id: `link-${index}`,
        subpath: key,
        redirectLink: value,
      }))
    );
  }, [redirectMap]);

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

  const handleEnterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const resetEditableLinks = useCallback(() => {
    setEditableLinks(
      Object.entries(redirectMap).map(([key, value], index) => ({
        id: `link-${index}`,
        subpath: key,
        redirectLink: value,
      }))
    );
  }, [redirectMap]);

  const handleExitEditMode = useCallback(() => {
    setIsEditMode(false);
    resetEditableLinks();
  }, [resetEditableLinks]);

  const handleAddLink = useCallback(() => {
    const newId = `new-${Date.now()}`;
    setEditableLinks((prev) => [
      ...prev,
      { id: newId, subpath: '', redirectLink: '', isNew: true },
    ]);
  }, []);

  const handleDeleteLink = useCallback((id: string) => {
    setEditableLinks((prev) => prev.filter((link) => link.id !== id));
  }, []);

  const handleUpdateLink = useCallback(
    (id: string, field: 'subpath' | 'redirectLink', value: string) => {
      setEditableLinks((prev) =>
        prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
      );
    },
    []
  );

  const handleSaveChanges = useCallback(() => {
    // TODO: Implement GitHub commit
    console.log('Saving changes:', editableLinks);
    setIsEditMode(false);
  }, [editableLinks]);

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
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      if (window.confirm('Your changes have not been saved. Are you sure you want to sign out?')) {
                        logout();
                      }
                    } else {
                      logout();
                    }
                  }}
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
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-400"
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
                <h3 className="text-base font-semibold mb-1">
                  <span className="text-gray-800">This site belongs to </span>
                  <span className="text-gray-600">{glnkUsername}</span>
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your GitHub account doesn't have access to this glnk.dev site. 
                  You can register for your own personalized short link domain.
                </p>
                <a
                  href="https://glnk.dev/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <span>Get your own glnk.dev</span>
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>
              </div>
              <button
                onClick={() => setShowMismatchMessage(false)}
                className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                type="button"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}
        {(isEditMode ? editableLinks.length > 0 : links.length > 0) || isEditMode ? (
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
                  <th className="w-12 text-right pr-4">
                    {isAuthenticated && (
                      isEditMode ? (
                        <button
                          onClick={handleSaveChanges}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          title="Save"
                          type="button"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleEnterEditMode}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit"
                          type="button"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isEditMode ? (
                  editableLinks.map((link) => (
                    <tr
                      key={link.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <input
                          type="text"
                          value={link.subpath}
                          onChange={(e) =>
                            handleUpdateLink(link.id, 'subpath', e.target.value)
                          }
                          placeholder="/path"
                          className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:border-gray-400 focus:outline-none transition-colors font-mono"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <input
                          type="text"
                          value={link.redirectLink}
                          onChange={(e) =>
                            handleUpdateLink(link.id, 'redirectLink', e.target.value)
                          }
                          placeholder="https://example.com"
                          className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:border-gray-400 focus:outline-none transition-colors"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                          type="button"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  links.map(({ subpath, redirectLink }) => (
                    <URLGenerator
                      key={subpath}
                      subpath={subpath}
                      template={redirectLink}
                    />
                  ))
                )}
              </tbody>
            </table>
            {isEditMode && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={handleAddLink}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  type="button"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add new link</span>
                </button>
                <button
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      if (window.confirm('Are you sure you want to discard your changes?')) {
                        handleExitEditMode();
                      }
                    } else {
                      handleExitEditMode();
                    }
                  }}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            )}
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
