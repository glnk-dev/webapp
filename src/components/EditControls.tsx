import React from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface EditControlsProps {
  error: string | null;
  isSaving: boolean;
  onAdd: () => void;
}

export const EditControls: React.FC<EditControlsProps> = ({
  error,
  isSaving,
  onAdd,
}) => (
  <div className="px-4 sm:px-6 py-3 border-t border-gray-100">
    {error && (
      <div className="mb-3 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
        {error}
      </div>
    )}
    <button
      onClick={onAdd}
      disabled={isSaving}
      className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-gray-400 transition-colors disabled:opacity-50"
      type="button"
    >
      <PlusIcon className="w-3.5 h-3.5" />
      <span>Add new link</span>
    </button>
  </div>
);
