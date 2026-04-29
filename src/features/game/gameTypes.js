export const PLAYER_IDS = ['P1', 'P2', 'P3', 'P4'];

export const INITIAL_PLAYERS = PLAYER_IDS.map((id, index) => ({
  id,
  name: `Player ${index + 1}`,
  total: 0,
  debt: 0,
}));

export const createDefaultGameState = (overrides = {}) => {
  const players = overrides.players || INITIAL_PLAYERS;

  return {
    name: overrides.name || 'Mahjong game',
    players,
    lastWinner: overrides.lastWinner ?? null,
    history: overrides.history || [],
  };
};
