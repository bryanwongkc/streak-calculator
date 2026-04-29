export const calculateStackValue = (colors = [], counts = {}) => (
  colors.reduce((total, color) => total + (Number(counts[color.id]) || 0) * (Number(color.value) || 0), 0)
);

export const ensureCountsForColors = (counts = {}, colors = []) => (
  colors.reduce((next, color) => ({
    ...next,
    [color.id]: Number(counts[color.id]) || 0,
  }), {})
);

export const getSharedInitialCounts = (chipConfig = {}, players = [], colors = []) => {
  if (chipConfig.initialCounts) {
    return ensureCountsForColors(chipConfig.initialCounts, colors);
  }

  const firstPlayerCounts = players
    .map((player) => chipConfig.initialCountsByPlayer?.[player.id])
    .find(Boolean);

  const firstAvailableCounts = firstPlayerCounts || Object.values(chipConfig.initialCountsByPlayer || {})[0];
  return ensureCountsForColors(firstAvailableCounts, colors);
};
