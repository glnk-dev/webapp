export const getPublicUrl = (): string => {
  return process.env.PUBLIC_URL || '';
};

export const getGlnkUsername = (): string => {
  return process.env.REACT_APP_GLNK_USERNAME || 'defaultUsername';
};

export const isAuthorizedOnly = (): boolean => {
  return process.env.REACT_APP_GLNK_AUTHORIZED_ONLY === '1';
};

