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
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
    <td className="py-4 px-4">
      <input
        type="text"
        value={subpath}
        onChange={(e) => onUpdate(id, 'subpath', e.target.value)}
        placeholder="/path"
        className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-2 focus:border-gray-400 focus:outline-none transition-colors font-mono"
      />
    </td>
    <td className="py-4 px-4">
      <input
        type="text"
        value={redirectLink}
        onChange={(e) => onUpdate(id, 'redirectLink', e.target.value)}
        placeholder="https://example.com"
        className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-2 focus:border-gray-400 focus:outline-none transition-colors"
      />
    </td>
    <td className="py-4 pr-4">
      <button
        onClick={() => onDelete(id)}
        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        title="Delete"
        type="button"
      >
        <TrashIcon />
      </button>
    </td>
  </tr>
);

