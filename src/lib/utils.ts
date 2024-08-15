// Find the matching URL and replace dynamic segments
export const getRedirectUrl = (
  redirectMap: Record<string, string>,
  pathname: string
) => {
  // Iterate through all paths in the redirectMap
  for (const [pattern, url] of Object.entries(redirectMap)) {
    // Convert pattern to regex, replacing '/{$1}' with a capturing group
    const regexPattern = pattern.replace(/\/\{\$1\}/g, "/([^/]+)");
    const regex = new RegExp(`^${regexPattern}$`);
    const match = pathname.match(regex);

    if (match) {
      console.log(`Matched pattern: ${pattern}`);
      console.log(`Redirect URL before replacement: ${url}`);
      // Replace '{$1}' with the captured group
      return url.replace("{$1}", match[1]);
    }
  }
  return null;
};

// Utility function to trim trailing slash
export const trimTrailingSlash = (path: string) => {
  return path.replace(/\/$/, "");
};
