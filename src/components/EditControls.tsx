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
  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
    {error && (
      <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
        {error}
      </div>
    )}
    <button
      onClick={onAdd}
      disabled={isSaving}
      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors disabled:opacity-50"
      type="button"
    >
      <PlusIcon className="w-4 h-4" />
      <span>Add new link</span>
    </button>
  </div>
);
