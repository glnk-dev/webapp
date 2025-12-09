export const getPublicUrl = (): string => {
  return process.env.PUBLIC_URL || '';
};

export const getGlnkUsername = (): string => {
  return process.env.REACT_APP_GLNK_USERNAME || 'defaultUsername';
};

export type AccessMode = 'static' | 'public' | 'private';

export const getAccessMode = (): AccessMode => {
  const mode = process.env.REACT_APP_GLNK_ACCESS_MODE;
  if (mode === 'static' || mode === 'private') {
    return mode;
  }
  return 'public';
};

export const isStatic = (): boolean => getAccessMode() === 'static';
export const isPublic = (): boolean => getAccessMode() === 'public';
export const isPrivate = (): boolean => getAccessMode() === 'private';
