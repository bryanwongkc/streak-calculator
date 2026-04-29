export const formatSignedNumber = (value = 0, digits = 0) => {
  const number = Number(value) || 0;
  const fixed = number.toFixed(digits);
  return number > 0 ? `+${fixed}` : fixed;
};

export const formatDateTime = (value) => {
  if (!value) return '';
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
