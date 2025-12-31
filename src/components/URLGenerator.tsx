import React, { useState, useCallback, useMemo } from 'react';
import { URLGeneratorProps } from '../types';
import { extractVariables, generateUrl } from '../utils/url';
import { getPublicUrl } from '../utils/env';
import { CopyIcon } from './icons/CopyIcon';

const InlineInput: React.FC<{
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}> = ({ value, placeholder, onChange, onKeyDown }) => {
  const displayValue = value || placeholder;
  const width = Math.max(displayValue.length * 8 + 20, 36);
  
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      style={{ width }}
      className="inline-block text-center text-gray-700 placeholder:text-gray-400 bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-200 rounded-full px-2 py-0.5 text-xs sm:text-sm font-mono focus:outline-none transition-all duration-200"
    />
  );
};

const renderWithVariables = (
  text: string,
  varMap: Record<string, string>,
  variables: string[],
  onVarChange: (key: string, value: string) => void,
  onKeyDown: (e: React.KeyboardEvent) => void
): React.ReactNode[] => {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\{\$(\d+)\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }
    
    const fullVar = match[0]; // {$1}, {$2}, etc.
    const displayName = `$${match[1]}`; // $1, $2, etc.
    
    if (variables.includes(fullVar)) {
      result.push(
        <InlineInput
          key={`var-${match.index}`}
          value={varMap[fullVar] || ''}
          placeholder={displayName}
          onChange={(v) => onVarChange(fullVar, v)}
          onKeyDown={onKeyDown}
        />
      );
    }
    
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(
      <span key={`text-end`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return result;
};

export const URLGenerator: React.FC<URLGeneratorProps> = ({ subpath, template }) => {
  const publicUrl = getPublicUrl();
  const variables = useMemo(() => extractVariables(template), [template]);

  const [varMap, setVarMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(variables.map((v) => [v, '']))
  );

  const generatedUrl = useMemo(() => generateUrl(template, varMap), [template, varMap]);
  const generatedSubpath = useMemo(() => generateUrl(subpath, varMap), [subpath, varMap]);

  const handleVarChange = useCallback((key: string, value: string) => {
    setVarMap((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const allFilled = variables.every((v) => varMap[v]?.trim());
        if (allFilled) {
          window.location.href = `${publicUrl}${generatedSubpath}`;
        }
      }
    },
    [publicUrl, generatedSubpath, variables, varMap]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedUrl).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
  }, [generatedUrl]);

  const hasVariables = variables.length > 0;

  return (
    <div className="flex items-center justify-between gap-4 py-5 px-4 sm:px-6 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="sm:w-56 flex-shrink-0 font-mono text-xs sm:text-sm text-gray-900 flex items-center flex-wrap gap-1">
          {hasVariables ? (
            renderWithVariables(subpath, varMap, variables, handleVarChange, handleKeyDown)
          ) : (
            <a
              href={`${publicUrl}${subpath}`}
              className="hover:text-orange-600 transition-colors truncate"
              title={`${publicUrl}${subpath}`}
            >
              {subpath}
            </a>
          )}
        </div>
        <div className="flex-1 text-xs sm:text-sm text-gray-500 flex items-center flex-wrap gap-1 min-w-0">
          {hasVariables ? (
            renderWithVariables(template, varMap, variables, handleVarChange, handleKeyDown)
          ) : (
            <a
              href={template}
              className="hover:text-gray-900 transition-colors truncate block"
              title={template}
            >
              {template}
            </a>
          )}
        </div>
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
