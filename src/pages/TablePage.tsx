import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import URLGenerator from '../components/URLGenerator';
import { NavBar } from '../components/NavBar';
import { MismatchAlert } from '../components/MismatchAlert';
import { EditableRow } from '../components/EditableRow';
import { EditControls } from '../components/EditControls';
import { LoginOverlay } from '../components/LoginOverlay';
import { TableHeader } from '../components/TableHeader';
import { DeployingBanner } from '../components/DeployingBanner';
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

type LinkEntry = { subpath: string; redirectLink: string };

const DEPLOY_AD_KEY = 'glnk_deploy_ad_until';
const DEPLOY_DURATION_MS = 5 * 60 * 1000;

function getDeploySecondsLeft(): number {
  const stored = localStorage.getItem(DEPLOY_AD_KEY);
  if (!stored) return 0;
  return Math.max(0, Math.ceil((parseInt(stored, 10) - Date.now()) / 1000));
}

function isDeployActive(): boolean {
  return getDeploySecondsLeft() > 0;
}

function clearDeploy() {
  localStorage.removeItem(DEPLOY_AD_KEY);
}

const TablePage: React.FC<TablePageProps> = ({ redirectMap }) => {
  const glnkUsername = getGlnkUsername();
  const publicUrl = getPublicUrl();
  const privateMode = isPrivate();
  const staticMode = isStatic();
  const { user, isAuthenticated, logout, loginWithGithub, loginError } = useAuth();
  const queryClient = useQueryClient();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showMismatchMessage, setShowMismatchMessage] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableLinks, setEditableLinks] = useState<EditableLink[]>([]);
  const [savedLinks, setSavedLinks] = useState<LinkEntry[] | null>(null);
  const [editLockWarningShown, setEditLockWarningShown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);
  const [showDeployAd, setShowDeployAd] = useState(isDeployActive);

  const links = useMemo<LinkEntry[]>(
    () => Object.entries(redirectMap).map(([subpath, redirectLink]) => ({ subpath, redirectLink })),
    [redirectMap]
  );

  const filterByQuery = useCallback(<T extends { subpath: string; redirectLink: string }>(items: T[]): T[] => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((l) => l.subpath.toLowerCase().includes(q) || l.redirectLink.toLowerCase().includes(q));
  }, [searchQuery]);

  const displayLinks = useMemo(() => {
    let result = filterByQuery(savedLinks || links);
    if (sortAsc !== null) {
      result = [...result].sort((a, b) =>
        sortAsc ? a.subpath.localeCompare(b.subpath) : b.subpath.localeCompare(a.subpath)
      );
    }
    return result;
  }, [savedLinks, links, filterByQuery, sortAsc]);

  const filteredEditableLinks = useMemo(() => filterByQuery(editableLinks), [filterByQuery, editableLinks]);

  const toEditableLinks = useCallback(
    () => Object.entries(redirectMap).map(([subpath, redirectLink], i) => ({ id: `link-${i}`, subpath, redirectLink })),
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

  const bannerInitialSeconds = useMemo(() => (showDeployAd ? getDeploySecondsLeft() : 300), [showDeployAd]);

  const invalidateAndReset = useCallback(() => {
    clearDeploy();
    setShowDeployAd(false);
    setSavedLinks(null);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.URL_MAP] });
  }, [queryClient]);

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
      if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  useEffect(() => { setEditableLinks(toEditableLinks()); }, [toEditableLinks]);

  useEffect(() => {
    if (!editLockWarningShown) return;
    const dismiss = () => setEditLockWarningShown(false);
    const timer = setTimeout(() => document.addEventListener('click', dismiss, { once: true }), 100);
    return () => { clearTimeout(timer); document.removeEventListener('click', dismiss); };
  }, [editLockWarningShown]);

  useEffect(() => {
    const check = () => { if (!isDeployActive()) invalidateAndReset(); };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [invalidateAndReset]);

  const handleLogin = useCallback(async () => {
    setIsSigningIn(true);
    try { await loginWithGithub(); } finally { setIsSigningIn(false); }
  }, [loginWithGithub]);

  const handleEnterEditMode = useCallback(() => {
    setIsEditMode(true);
    setSaveError(null);
    setEditLockWarningShown(false);
  }, []);

  const handleExitEditMode = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm('Are you sure you want to discard your changes?')) return;
    setIsEditMode(false);
    setEditableLinks(toEditableLinks());
  }, [toEditableLinks, hasUnsavedChanges]);

  const handleAddLink = useCallback(() => {
    setEditableLinks((prev) => [...prev, { id: `new-${Date.now()}`, subpath: '', redirectLink: '' }]);
  }, []);

  const handleDeleteLink = useCallback((id: string) => {
    setEditableLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleUpdateLink = useCallback((id: string, field: 'subpath' | 'redirectLink', value: string) => {
    setEditableLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }, []);

  const handleSaveChanges = useCallback(async () => {
    if (!hasUnsavedChanges) { setIsEditMode(false); return; }
    if (!updateLinks) { setSaveError('Edit functionality is not available'); return; }

    const trimmed = editableLinks.map((l) => ({ subpath: l.subpath.trim(), redirectLink: l.redirectLink.trim() }));
    if (trimmed.some((l) => !l.subpath || !l.redirectLink)) {
      setSaveError('All links must have both subpath and redirect URL'); return;
    }
    if (new Set(trimmed.map((l) => l.subpath)).size !== trimmed.length) {
      setSaveError('Duplicate subpaths are not allowed'); return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await updateLinks({ username: glnkUsername, links: trimmed });
      setSavedLinks(trimmed);
      setIsEditMode(false);
      localStorage.setItem(DEPLOY_AD_KEY, (Date.now() + DEPLOY_DURATION_MS).toString());
      setShowDeployAd(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [editableLinks, glnkUsername, hasUnsavedChanges]);

  const handleToggleDeployWarning = useCallback(() => {
    if (editLockWarningShown) {
      setEditLockWarningShown(false);
      handleEnterEditMode();
    } else {
      setEditLockWarningShown(true);
    }
  }, [editLockWarningShown, handleEnterEditMode]);

  const hasLinks = isEditMode || (savedLinks || links).length > 0;

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

      <main className="flex-1 max-w-6xl mx-auto px-6 sm:px-8 py-8 w-full" style={{ paddingTop: '96px' }}>
        {loginError === 'username_mismatch' && showMismatchMessage && (
          <MismatchAlert username={glnkUsername} onClose={() => setShowMismatchMessage(false)} />
        )}

        {showDeployAd && glnkUsername && (
          <div className="mb-6 -mx-6 sm:-mx-8">
            <div className="mx-6 sm:mx-8">
              <DeployingBanner
                username={glnkUsername}
                onComplete={invalidateAndReset}
                initialSeconds={bannerInitialSeconds}
                variant="inline"
              />
            </div>
          </div>
        )}

        {hasLinks ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <TableHeader
              isEditMode={isEditMode}
              isSaving={isSaving}
              isAuthenticated={isAuthenticated}
              staticMode={staticMode}
              showDeployAd={showDeployAd}
              editLockWarningShown={editLockWarningShown}
              searchQuery={searchQuery}
              sortAsc={sortAsc}
              onSearchChange={setSearchQuery}
              onSortToggle={() => setSortAsc((p) => p === null ? true : p ? false : null)}
              onEnterEdit={handleEnterEditMode}
              onExitEdit={handleExitEditMode}
              onSave={handleSaveChanges}
              onToggleDeployWarning={handleToggleDeployWarning}
            />
            <div>
              {isEditMode
                ? filteredEditableLinks.length > 0
                  ? filteredEditableLinks.map((link) => (
                      <EditableRow
                        key={link.id}
                        id={link.id}
                        subpath={link.subpath}
                        redirectLink={link.redirectLink}
                        onUpdate={handleUpdateLink}
                        onDelete={handleDeleteLink}
                      />
                    ))
                  : searchQuery
                    ? <div className="py-8 text-center text-sm text-gray-400">No links matching "{searchQuery}"</div>
                    : null
                : displayLinks.length > 0
                  ? displayLinks.map(({ subpath, redirectLink }) => (
                      <URLGenerator key={subpath} subpath={subpath} template={redirectLink} />
                    ))
                  : searchQuery
                    ? <div className="py-8 text-center text-sm text-gray-400">No links matching "{searchQuery}"</div>
                    : null}
            </div>
            {isEditMode && <EditControls error={saveError} isSaving={isSaving} onAdd={handleAddLink} />}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-gray-400">No links configured yet.</p>
          </div>
        )}
      </main>

      {privateMode && !isAuthenticated && <LoginOverlay onLogin={loginWithGithub} />}
    </div>
  );
};

export default TablePage;
