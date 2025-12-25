export const getPublicUrl = (): string => {
  return process.env.PUBLIC_URL || '';
};

export const getGlnkUsername = (): string => {
  return process.env.REACT_APP_GLNK_USERNAME || 'defaultUsername';
};

export type AccessMode = 'static' | 'public' | 'private' | 'homepage' | 'clip';

export const getAccessMode = (): AccessMode => {
  const mode = process.env.REACT_APP_GLNK_ACCESS_MODE;
  if (mode === 'static' || mode === 'private' || mode === 'homepage' || mode === 'clip') {
    return mode;
  }
  return 'public';
};

export const isStatic = (): boolean => getAccessMode() === 'static';
export const isPublic = (): boolean => getAccessMode() === 'public';
export const isPrivate = (): boolean => getAccessMode() === 'private';
export const isHomepage = (): boolean => getAccessMode() === 'homepage';
export const isClipMode = (): boolean => getAccessMode() === 'clip';

const TITLES: Record<AccessMode, string> = {
  homepage: 'glnk.dev · Short Links, Your Way',
  clip: 'clip.glnk.dev · Cloud Clipboard',
  static: '',
  public: '',
  private: '',
};

export const getTitle = (): string => {
  const mode = getAccessMode();
  return TITLES[mode] || `${getGlnkUsername()}.glnk.dev · Short Links, Your Way`;
};
