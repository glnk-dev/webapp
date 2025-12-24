import React, { useState, useCallback, useMemo } from 'react';
import { URLGeneratorProps } from '../types';
import { extractVariables, generateUrl } from '../utils/url';
import { getPublicUrl } from '../utils/env';
import { CopyIcon } from './icons/CopyIcon';

export const URLGenerator: React.FC<URLGeneratorProps> = ({ subpath, template }) => {
  const publicUrl = getPublicUrl();
  const variables = useMemo(() => extractVariables(template), [template]);

  const [varMap, setVarMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(variables.map((v) => [v, '']))
  );

  const generatedUrl = useMemo(() => generateUrl(template, varMap), [template, varMap]);
  const generatedSubpath = useMemo(() => generateUrl(subpath, varMap), [subpath, varMap]);

  const handleInputChange = useCallback(
    (key: string) => (ev: React.ChangeEvent<HTMLInputElement>) => {
      setVarMap((prev) => ({ ...prev, [key]: ev.target.value }));
    },
    []
  );

  const handleInputKeyDown = useCallback(
    (_: string) => (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === 'Enter') {
        window.location.href = `${publicUrl}${generatedSubpath}`;
      }
    },
    [publicUrl, generatedSubpath]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedUrl).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
  }, [generatedUrl]);

  return (
    <div className="flex items-start justify-between gap-4 py-5 px-4 sm:px-6 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
        <div className="flex flex-col gap-1 sm:w-48 flex-shrink-0">
          {variables.length > 0 &&
            variables.map((v) => (
              <input
                key={v}
                type="text"
                value={varMap[v]}
                placeholder={v}
                onChange={handleInputChange(v)}
                onKeyDown={handleInputKeyDown(v)}
                className="text-xs text-gray-400 bg-transparent border-b border-gray-200 focus:border-orange-400 focus:outline-none py-1 transition-colors w-full font-mono"
              />
            ))}
          <a
            href={`${publicUrl}${generatedSubpath}`}
            className="text-sm text-gray-900 hover:text-orange-600 transition-colors font-mono truncate block"
            title={`${publicUrl}${generatedSubpath}`}
          >
            {generatedSubpath}
          </a>
        </div>
        <a
          href={generatedUrl}
          className="flex-1 text-sm text-gray-500 hover:text-gray-900 transition-colors block truncate"
          title={generatedUrl}
        >
          {generatedUrl}
        </a>
      </div>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        title="Copy"
        type="button"
      >
        <CopyIcon />
      </button>
    </div>
  );
};

export default URLGenerator;
