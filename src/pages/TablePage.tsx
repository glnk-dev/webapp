import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import URLGenerator from '../components/URLGenerator';
import { NavBar } from '../components/NavBar';
import { MismatchAlert } from '../components/MismatchAlert';
import { EditableRow } from '../components/EditableRow';
import { EditControls } from '../components/EditControls';
import { LoginOverlay } from '../components/LoginOverlay';
import { PencilIcon } from '../components/icons/PencilIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { CloseIcon } from '../components/icons/CloseIcon';
import { useAuth } from '../contexts/AuthContext';
import { updateLinks } from '../lib/firebase';
import { TablePageProps } from '../types';
import { getGlnkUsername, getPublicUrl, isPrivate, isStatic } from '../utils/env';
import { QUERY_KEYS } from '../constants';

interface EditableLink {
  id: string;
  subpath: string;
  redirectLink: string;
}

const TablePage: React.FC<TablePageProps> = ({ redirectMap }) => {
  const glnkUsername = getGlnkUsername();
  const publicUrl = getPublicUrl();
  const privateMode = isPrivate();
  const staticMode = isStatic();
  const { user, isAuthenticated, logout, login, loginError } = useAuth();
  const queryClient = useQueryClient();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deployCountdown, setDeployCountdown] = useState(0);
  const [showMismatchMessage, setShowMismatchMessage] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableLinks, setEditableLinks] = useState<EditableLink[]>([]);
  const [editLockedUntil, setEditLockedUntil] = useState<number | null>(null);

  const showLoginOverlay = privateMode && !isAuthenticated;
  const isEditLocked = editLockedUntil !== null && Date.now() < editLockedUntil;
  const canEdit = isAuthenticated && !staticMode && !isEditLocked;

  const links = useMemo(
    () => Object.entries(redirectMap).map(([key, value]) => ({ subpath: key, redirectLink: value })),
    [redirectMap]
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!isEditMode) return false;
    if (editableLinks.length !== links.length) return true;
    return editableLinks.some((edit, i) => {
      const orig = links[i];
      return !orig || edit.subpath !== orig.subpath || edit.redirectLink !== orig.redirectLink;
    });
  }, [isEditMode, editableLinks, links]);

  const toEditableLinks = useCallback(
    () => Object.entries(redirectMap).map(([key, value], i) => ({ id: `link-${i}`, subpath: key, redirectLink: value })),
    [redirectMap]
  );

  useEffect(() => {
    if (loginError === 'username_mismatch') setShowMismatchMessage(true);
  }, [loginError]);

  useEffect(() => {
    if (!isAuthenticated && isEditMode) {
      setIsEditMode(false);
      setEditableLinks(toEditableLinks());
    }
  }, [isAuthenticated, isEditMode, toEditableLinks]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    setEditableLinks(toEditableLinks());
  }, [toEditableLinks]);

  useEffect(() => {
    if (!saveSuccess) return;
    setDeployCountdown(300);
    const interval = setInterval(() => {
      setDeployCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.URL_MAP] });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [saveSuccess, queryClient]);

  const handleLogin = useCallback(async () => {
    setIsSigningIn(true);
    try {
      await login();
    } finally {
      setIsSigningIn(false);
    }
  }, [login]);

  const handleEnterEditMode = useCallback(() => {
    setIsEditMode(true);
    setSaveError(null);
  }, []);

  const handleExitEditMode = useCallback(() => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Are you sure you want to discard your changes?')) {
        return;
      }
    }
    setIsEditMode(false);
    setEditableLinks(toEditableLinks());
  }, [toEditableLinks, hasUnsavedChanges]);

  const handleAddLink = useCallback(() => {
    setEditableLinks((prev) => [...prev, { id: `new-${Date.now()}`, subpath: '', redirectLink: '' }]);
  }, []);

  const handleDeleteLink = useCallback((id: string) => {
    setEditableLinks((prev) => prev.filter((link) => link.id !== id));
  }, []);

  const handleUpdateLink = useCallback((id: string, field: 'subpath' | 'redirectLink', value: string) => {
    setEditableLinks((prev) => prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)));
  }, []);

  const handleSaveChanges = useCallback(async () => {
    if (!hasUnsavedChanges) {
      setIsEditMode(false);
      return;
    }

    if (!updateLinks) {
      setSaveError('Edit functionality is not available');
      return;
    }

    const emptyLinks = editableLinks.filter((l) => !l.subpath.trim() || !l.redirectLink.trim());
    if (emptyLinks.length > 0) {
      setSaveError('All links must have both subpath and redirect URL');
      return;
    }

    const subpaths = editableLinks.map((l) => l.subpath.trim());
    if (subpaths.length !== new Set(subpaths).size) {
      setSaveError('Duplicate subpaths are not allowed');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await updateLinks({
        username: glnkUsername,
        links: editableLinks.map((l) => ({ subpath: l.subpath.trim(), redirectLink: l.redirectLink.trim() })),
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.URL_MAP] });
      setIsEditMode(false);
      setSaveSuccess(true);
      setEditLockedUntil(Date.now() + 60000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [editableLinks, glnkUsername, queryClient, hasUnsavedChanges]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar
        username={glnkUsername}
        publicUrl={publicUrl}
        staticMode={staticMode}
        isAuthenticated={isAuthenticated}
        user={user}
        isSigningIn={isSigningIn}
        hasUnsavedChanges={hasUnsavedChanges}
        onLogin={handleLogin}
        onLogout={logout}
      />

      <main className="flex-1 max-w-6xl mx-auto px-6 sm:px-8 py-8 w-full">
        {loginError === 'username_mismatch' && showMismatchMessage && (
          <MismatchAlert username={glnkUsername} onClose={() => setShowMismatchMessage(false)} />
        )}

        {saveSuccess && (
          <div className="mb-6 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Changes saved!</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Your links have been updated. It may take a few minutes for changes to appear.
                </p>
                <a
                  href={`https://github.com/glnk-dev/glnk-${glnkUsername}/actions/workflows/deploy-pages.yaml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    deployCountdown > 0
                      ? 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                      : 'text-white bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {deployCountdown > 0 ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>~{Math.floor(deployCountdown / 60)}:{String(deployCountdown % 60).padStart(2, '0')}</span>
                    </>
                  ) : (
                    'Check deploy status'
                  )}
                </a>
              </div>
              <button
                onClick={() => setSaveSuccess(false)}
                className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                type="button"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
          </div>
        )}

        {isEditMode || links.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between py-4 px-4 sm:px-6 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                <span className="hidden sm:inline">Subpath / Redirect Link</span>
                <span className="sm:hidden">Links</span>
              </span>
              {canEdit && (
                <div className="flex items-center gap-3">
                  {isEditMode ? (
                    <>
                      <button
                        onClick={handleExitEditMode}
                        disabled={isSaving}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        title="Cancel"
                        type="button"
                      >
                        <CloseIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className={`transition-colors ${isSaving ? 'text-gray-300' : 'text-gray-400 hover:text-orange-500'}`}
                        title={isSaving ? 'Saving...' : 'Save'}
                        type="button"
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
                        ) : (
                          <CheckIcon className="w-5 h-5" />
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEnterEditMode}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit"
                      type="button"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div>
              {isEditMode
                ? editableLinks.map((link) => (
                    <EditableRow
                      key={link.id}
                      id={link.id}
                      subpath={link.subpath}
                      redirectLink={link.redirectLink}
                      onUpdate={handleUpdateLink}
                      onDelete={handleDeleteLink}
                    />
                  ))
                : links.map(({ subpath, redirectLink }) => (
                    <URLGenerator key={subpath} subpath={subpath} template={redirectLink} />
                  ))}
            </div>
            {isEditMode && (
              <EditControls
                error={saveError}
                isSaving={isSaving}
                onAdd={handleAddLink}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-gray-400">No links configured yet.</p>
          </div>
        )}
      </main>

      <footer className="mt-auto py-4">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <a
            href="https://glnk.dev"
            className="flex items-center justify-center gap-1.5 text-gray-300 hover:text-gray-500 transition-colors text-xs"
          >
            <img src="/favicon.png" alt="glnk.dev" className="w-4 h-4 opacity-50" />
            <span>glnk.dev</span>
          </a>
        </div>
      </footer>

      {showLoginOverlay && <LoginOverlay onLogin={login} />}
    </div>
  );
};

export default TablePage;
