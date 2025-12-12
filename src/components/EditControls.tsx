import React from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface EditControlsProps {
  error: string | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onAdd: () => void;
  onCancel: () => void;
}

export const EditControls: React.FC<EditControlsProps> = ({
  error,
  isSaving,
  hasUnsavedChanges,
  onAdd,
  onCancel,
}) => {
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <button
          onClick={onAdd}
          disabled={isSaving}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          type="button"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add new link</span>
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

