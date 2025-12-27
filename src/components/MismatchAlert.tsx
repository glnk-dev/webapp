import React from 'react';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { CloseIcon } from './icons/CloseIcon';

interface MismatchAlertProps {
  username: string;
  onClose: () => void;
}

export const MismatchAlert: React.FC<MismatchAlertProps> = ({ username, onClose }) => (
  <div className="mb-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <span className="text-gray-600">{username}</span>
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
        onClick={onClose}
        className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
        type="button"
      >
        <CloseIcon />
      </button>
    </div>
  </div>
);
