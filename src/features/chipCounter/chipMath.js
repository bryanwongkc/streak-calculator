export const calculateStackValue = (colors = [], counts = {}) => (
  colors.reduce((total, color) => total + (Number(counts[color.id]) || 0) * (Number(color.value) || 0), 0)
);

export const ensureCountsForColors = (counts = {}, colors = []) => (
  colors.reduce((next, color) => ({
    ...next,
    [color.id]: Number(counts[color.id]) || 0,
  }), {})
);

export const isLegacyDefaultChipConfig = (chipConfig = {}) => {
  const colors = chipConfig.colors || [];
  const legacy = [
    ['red', 10],
    ['blue', 50],
    ['green', 100],
    ['black', 500],
  ];

  const hasLegacyColors = colors.length === legacy.length && legacy.every(([id, value], index) => (
    colors[index]?.id === id && Number(colors[index]?.value) === value
  ));

  const initialValues = [
    ...Object.values(chipConfig.initialCounts || {}),
    ...Object.values(chipConfig.initialCountsByPlayer || {}).flatMap((counts) => Object.values(counts || {})),
  ];
  const hasCustomStartingCounts = initialValues.some((value) => Number(value) > 0);

  return hasLegacyColors && !hasCustomStartingCounts;
};

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
