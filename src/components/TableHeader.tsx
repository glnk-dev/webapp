import React from 'react';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

const SORT_ICONS: Record<string, string> = {
  none: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4',
  asc: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12',
  desc: 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4',
};

const SortButton: React.FC<{
  sortAsc: boolean | null;
  onToggle: () => void;
}> = ({ sortAsc, onToggle }) => {
  const key = sortAsc === null ? 'none' : sortAsc ? 'asc' : 'desc';
  const title = sortAsc === null ? 'Sort A→Z' : sortAsc ? 'Sort Z→A' : 'Original order';

  return (
    <button
      onClick={onToggle}
      className={`flex items-center transition-colors flex-shrink-0 ${
        sortAsc !== null ? 'text-orange-500' : 'text-gray-300 hover:text-gray-400'
      }`}
      title={title}
      type="button"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={SORT_ICONS[key]} />
      </svg>
    </button>
  );
};

const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <div className="relative flex-1 max-w-xs">
    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Filter links..."
      className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:border-orange-200 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
        type="button"
      >
        <CloseIcon className="w-3 h-3" />
      </button>
    )}
  </div>
);

const DeployLockButton: React.FC<{
  warningShown: boolean;
  onToggleWarning: () => void;
}> = ({ warningShown, onToggleWarning }) => (
  <div className="relative">
    <button
      onClick={onToggleWarning}
      className={`transition-colors ${
        warningShown ? 'text-orange-500 hover:text-orange-600' : 'text-gray-300 hover:text-gray-400'
      }`}
      title={warningShown ? 'Click again to edit anyway' : 'Editing locked during deployment'}
      type="button"
    >
      <PencilIcon className="w-5 h-5" />
    </button>
    {warningShown && (
      <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-lg z-10">
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-amber-800 font-medium mb-1.5">Deployment in progress</p>
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Editing now may cause conflicts. Click the edit button again if you still want to proceed.
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);

interface TableHeaderProps {
  isEditMode: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  staticMode: boolean;
  showDeployAd: boolean;
  editLockWarningShown: boolean;
  searchQuery: string;
  sortAsc: boolean | null;
  onSearchChange: (v: string) => void;
  onSortToggle: () => void;
  onEnterEdit: () => void;
  onExitEdit: () => void;
  onSave: () => void;
  onToggleDeployWarning: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  isEditMode,
  isSaving,
  isAuthenticated,
  staticMode,
  showDeployAd,
  editLockWarningShown,
  searchQuery,
  sortAsc,
  onSearchChange,
  onSortToggle,
  onEnterEdit,
  onExitEdit,
  onSave,
  onToggleDeployWarning,
}) => {
  const canEdit = isAuthenticated && !staticMode;

  return (
    <div className="flex items-center justify-between gap-2 py-3 px-4 sm:px-6 border-b border-gray-100">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isEditMode ? (
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            <span className="hidden sm:inline">Subpath / Redirect Link</span>
            <span className="sm:hidden">Links</span>
          </span>
        ) : (
          <>
            <SearchInput value={searchQuery} onChange={onSearchChange} />
            <SortButton sortAsc={sortAsc} onToggle={onSortToggle} />
          </>
        )}
      </div>

      {canEdit && (
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <>
              <button
                onClick={onExitEdit}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                title="Cancel"
                type="button"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onSave}
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
          ) : showDeployAd ? (
            <DeployLockButton warningShown={editLockWarningShown} onToggleWarning={onToggleDeployWarning} />
          ) : (
            <button
              onClick={onEnterEdit}
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
  );
};

