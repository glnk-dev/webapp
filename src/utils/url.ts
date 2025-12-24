import { VARIABLE_PATTERN } from '../constants';
import { RedirectMap } from '../types';

export const extractVariables = (template: string): string[] => {
  const extractedVars: string[] = [];
  const pattern = new RegExp(VARIABLE_PATTERN.source, VARIABLE_PATTERN.flags);
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(template)) !== null) {
    extractedVars.push(`{${match[1]}}`);
  }

  return extractedVars;
};

export const generateUrl = (
  template: string,
  varMap: Record<string, string>
): string => {
  return Object.entries(varMap).reduce(
    (result, [key, value]) => result.replace(key, value || key),
    template
  );
};

export const getRedirectUrl = (
  redirectMap: RedirectMap,
  pathname: string
): string | null => {
  for (const [pattern, url] of Object.entries(redirectMap)) {
    // Replace all {$N} with capture groups
    const regexPattern = pattern.replace(/\{\$(\d+)\}/g, '([^/]+)');
    const regex = new RegExp(`^${regexPattern}$`);
    const match = pathname.match(regex);

    if (match) {
      // Replace all {$N} in URL with captured values
      let result = url;
      for (let i = 1; i < match.length; i++) {
        result = result.replace(`{$${i}}`, match[i]);
      }
      return result;
    }
  }
  return null;
};

export const trimTrailingSlash = (path: string): string => {
  return path.replace(/\/$/, '');
};

