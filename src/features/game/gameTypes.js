export const PLAYER_IDS = ['P1', 'P2', 'P3', 'P4'];

export const INITIAL_PLAYERS = PLAYER_IDS.map((id, index) => ({
  id,
  name: `Player ${index + 1}`,
  total: 0,
  debt: 0,
}));

export const DEFAULT_CHIP_COLORS = [
  { id: 'red', name: 'Red', value: 1, colorHex: '#dc2626' },
  { id: 'yellow', name: 'Yellow', value: 5, colorHex: '#facc15' },
  { id: 'white', name: 'White', value: 10, colorHex: '#f8fafc' },
  { id: 'blue', name: 'Blue', value: 20, colorHex: '#2563eb' },
  { id: 'black', name: 'Black', value: 50, colorHex: '#111827' },
  { id: 'purple', name: 'Purple', value: 100, colorHex: '#7c3aed' },
];

export const DEFAULT_INITIAL_CHIP_COUNTS = {
  red: 10,
  yellow: 8,
  white: 10,
  blue: 5,
  black: 3,
  purple: 1,
};

export const createEmptyCounts = (colors = DEFAULT_CHIP_COLORS) => (
  colors.reduce((counts, color) => ({ ...counts, [color.id]: 0 }), {})
);

export const createDefaultChipConfig = () => ({
  colors: DEFAULT_CHIP_COLORS,
  initialCounts: DEFAULT_INITIAL_CHIP_COUNTS,
});

export const createDefaultGameState = (overrides = {}) => {
  const players = overrides.players || INITIAL_PLAYERS;

  return {
    name: overrides.name || 'Mahjong game',
    players,
    lastWinner: overrides.lastWinner ?? null,
    history: overrides.history || [],
    chipConfig: overrides.chipConfig || createDefaultChipConfig(),
    ruleImages: overrides.ruleImages || [],
  };
};
