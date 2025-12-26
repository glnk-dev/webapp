export const getPublicUrl = (): string => {
  const base = import.meta.env.BASE_URL;
  return base === '/' ? '' : base;
};

export const getGlnkUsername = (): string => {
  return import.meta.env.VITE_GLNK_USERNAME || 'defaultUsername';
};

export type AccessMode = 'static' | 'public' | 'private' | 'homepage';

export const getAccessMode = (): AccessMode => {
  const mode = import.meta.env.VITE_GLNK_ACCESS_MODE;
  if (mode === 'static' || mode === 'private' || mode === 'homepage') {
    return mode;
  }
  return 'public';
};

export const isStatic = (): boolean => getAccessMode() === 'static';
export const isPublic = (): boolean => getAccessMode() === 'public';
export const isPrivate = (): boolean => getAccessMode() === 'private';
export const isHomepage = (): boolean => getAccessMode() === 'homepage';
