export const calculateStackValue = (colors = [], counts = {}) => (
  colors.reduce((total, color) => total + (Number(counts[color.id]) || 0) * (Number(color.value) || 0), 0)
);

export const ensureCountsForColors = (counts = {}, colors = []) => (
  colors.reduce((next, color) => ({
    ...next,
    [color.id]: Number(counts[color.id]) || 0,
  }), {})
);

export const ensureInitialCounts = (players = [], colors = [], initialCountsByPlayer = {}) => (
  players.reduce((next, player) => ({
    ...next,
    [player.id]: ensureCountsForColors(initialCountsByPlayer[player.id], colors),
  }), {})
);
