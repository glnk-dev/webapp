export const getPublicUrl = (): string => {
  return process.env.PUBLIC_URL || '';
};

export const getGlnkUsername = (): string => {
  return process.env.REACT_APP_GLNK_USERNAME || 'defaultUsername';
};

