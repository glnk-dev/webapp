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
import { VideoAdPlayer } from '../components/VideoAdPlayer';
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

const DEPLOY_AD_KEY = 'glnk_deploy_ad_until';
const DEPLOY_DURATION = 5 * 60 * 1000; // 5 minutes

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
  const [showMismatchMessage, setShowMismatchMessage] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableLinks, setEditableLinks] = useState<EditableLink[]>([]);
  const [adKey, setAdKey] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [savedLinks, setSavedLinks] = useState<{ subpath: string; redirectLink: string }[] | null>(null);
  const [editLockWarningShown, setEditLockWarningShown] = useState(false);
  
  const [showDeployAd, setShowDeployAd] = useState(() => {
    const stored = localStorage.getItem(DEPLOY_AD_KEY);
    if (stored) {
      const expiresAt = parseInt(stored, 10);
      return Date.now() < expiresAt;
    }
    return false;
  });

  const showLoginOverlay = privateMode && !isAuthenticated;
  const isEditLocked = showDeployAd;

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
    if (!editLockWarningShown) return;
    const handleClick = () => setEditLockWarningShown(false);
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick, { once: true });
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, [editLockWarningShown]);

  useEffect(() => {
    const updateTimer = () => {
      const stored = localStorage.getItem(DEPLOY_AD_KEY);
      if (stored) {
        const expiresAt = parseInt(stored, 10);
        const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        setRemainingSeconds(remaining);
        
        if (remaining <= 0) {
          localStorage.removeItem(DEPLOY_AD_KEY);
          setShowDeployAd(false);
          setSavedLinks(null);
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.URL_MAP] });
        }
      } else {
        setRemainingSeconds(0);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

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
    setEditLockWarningShown(false);
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
      setSavedLinks(editableLinks.map((l) => ({ subpath: l.subpath.trim(), redirectLink: l.redirectLink.trim() })));
      setIsEditMode(false);
      const expiresAt = Date.now() + DEPLOY_DURATION;
      localStorage.setItem(DEPLOY_AD_KEY, expiresAt.toString());
      setShowDeployAd(true);
      setAdKey(0);
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

        {showDeployAd && (
          <div className="mb-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 018 0v4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Deploying your changes...</h3>
                    <p className="text-sm text-white/80">
                      Editing locked for {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://github.com/glnk-dev/glnk-${glnkUsername}/actions/workflows/deploy-pages.yaml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 text-sm font-medium rounded-xl transition-colors text-center"
                >
                  View Action
                </a>
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-col items-center gap-3">
                <div className="w-full max-w-lg aspect-video">
                  <VideoAdPlayer
                    key={adKey}
                    autoplay
                    onAdComplete={() => setAdKey(k => k + 1)}
                    onAdError={() => setAdKey(k => k + 1)}
                  />
                </div>
                <p className="text-xs text-gray-400">Thank you for supporting glnk.dev!</p>
              </div>
            </div>
          </div>
        )}

        {isEditMode || (savedLinks || links).length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between py-4 px-4 sm:px-6 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                <span className="hidden sm:inline">Subpath / Redirect Link</span>
                <span className="sm:hidden">Links</span>
              </span>
              {isAuthenticated && !staticMode && (
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
                  ) : isEditLocked ? (
                    <div className="relative">
                      <button
                        onClick={() => {
                          if (editLockWarningShown) {
                            setEditLockWarningShown(false);
                            handleEnterEditMode();
                          } else {
                            setEditLockWarningShown(true);
                          }
                        }}
                        className={`transition-colors ${
                          editLockWarningShown 
                            ? 'text-orange-500 hover:text-orange-600' 
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                        title={editLockWarningShown ? "Click again to edit anyway" : "Editing locked during deployment"}
                        type="button"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      {editLockWarningShown && (
                        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-lg z-10">
                          <p className="text-xs text-amber-800 font-medium mb-1">⚠️ Deployment in progress</p>
                          <p className="text-xs text-amber-700">Editing now may cause conflicts. Click the edit button again if you still want to proceed.</p>
                        </div>
                      )}
                    </div>
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
                : (savedLinks || links).map(({ subpath, redirectLink }) => (
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
