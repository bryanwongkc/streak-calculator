export const PLAYER_IDS = ['P1', 'P2', 'P3', 'P4'];

export const INITIAL_PLAYERS = PLAYER_IDS.map((id, index) => ({
  id,
  name: `Player ${index + 1}`,
  total: 0,
  debt: 0,
}));

export const DEFAULT_CHIP_COLORS = [
  { id: 'red', name: 'Red', value: 10, colorHex: '#dc2626' },
  { id: 'blue', name: 'Blue', value: 50, colorHex: '#2563eb' },
  { id: 'green', name: 'Green', value: 100, colorHex: '#16a34a' },
  { id: 'black', name: 'Black', value: 500, colorHex: '#111827' },
];

export const createEmptyCounts = (colors = DEFAULT_CHIP_COLORS) => (
  colors.reduce((counts, color) => ({ ...counts, [color.id]: 0 }), {})
);

export const createInitialChipCounts = (players = INITIAL_PLAYERS, colors = DEFAULT_CHIP_COLORS) => (
  players.reduce((counts, player) => ({
    ...counts,
    [player.id]: createEmptyCounts(colors),
  }), {})
);

export const createDefaultChipConfig = (players = INITIAL_PLAYERS) => ({
  colors: DEFAULT_CHIP_COLORS,
  initialCountsByPlayer: createInitialChipCounts(players, DEFAULT_CHIP_COLORS),
});

export const createDefaultGameState = (overrides = {}) => {
  const players = overrides.players || INITIAL_PLAYERS;

  return {
    name: overrides.name || 'Mahjong game',
    players,
    lastWinner: overrides.lastWinner ?? null,
    history: overrides.history || [],
    chipConfig: overrides.chipConfig || createDefaultChipConfig(players),
    ruleImages: overrides.ruleImages || [],
  };
};
