export const createId = (prefix = 'id') => {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
};

export const createShareToken = () => {
  const first = Math.random().toString(36).slice(2);
  const second = Math.random().toString(36).slice(2);
  return `${first}${second}`.slice(0, 24);
};

export const safeFileName = (fileName = 'rule-image') => (
  fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'rule-image'
);
