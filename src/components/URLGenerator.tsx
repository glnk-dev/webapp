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
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-5 px-4">
        <div className="flex flex-col gap-2">
          {variables.length > 0 &&
            variables.map((v) => (
              <input
                key={v}
                type="text"
                value={varMap[v]}
                placeholder={v}
                onChange={handleInputChange(v)}
                onKeyDown={handleInputKeyDown(v)}
                className="text-sm text-gray-900 bg-transparent border-b border-gray-300 focus:border-gray-900 focus:outline-none py-1 transition-colors"
              />
            ))}
          <a
            href={`${publicUrl}${generatedSubpath}`}
            className="text-sm text-gray-900 hover:text-gray-600 transition-colors font-mono"
            title={`${publicUrl}${generatedSubpath}`}
          >
            {generatedSubpath}
          </a>
        </div>
      </td>
      <td className="py-5 px-4">
        <a
          href={generatedUrl}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors block truncate"
          title={generatedUrl}
        >
          {generatedUrl}
        </a>
      </td>
      <td className="py-5 pr-4">
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Copy"
          type="button"
        >
          <CopyIcon />
        </button>
      </td>
    </tr>
  );
};

export default URLGenerator;
