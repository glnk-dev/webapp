import React from 'react';
import { TrashIcon } from './icons/TrashIcon';

interface EditableRowProps {
  id: string;
  subpath: string;
  redirectLink: string;
  onUpdate: (id: string, field: 'subpath' | 'redirectLink', value: string) => void;
  onDelete: (id: string) => void;
}

export const EditableRow: React.FC<EditableRowProps> = ({
  id,
  subpath,
  redirectLink,
  onUpdate,
  onDelete,
}) => (
  <div className="flex items-start justify-between gap-4 py-5 px-4 sm:px-6 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
    <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={subpath}
        onChange={(e) => onUpdate(id, 'subpath', e.target.value)}
        placeholder="/path"
        className="w-full sm:w-48 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-orange-300 focus:bg-white focus:outline-none transition-all font-mono flex-shrink-0"
      />
      <input
        type="text"
        value={redirectLink}
        onChange={(e) => onUpdate(id, 'redirectLink', e.target.value)}
        placeholder="https://example.com"
        className="flex-1 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-orange-300 focus:bg-white focus:outline-none transition-all"
      />
    </div>
    <button
      onClick={() => onDelete(id)}
      className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
      title="Delete"
      type="button"
    >
      <TrashIcon />
    </button>
  </div>
);
