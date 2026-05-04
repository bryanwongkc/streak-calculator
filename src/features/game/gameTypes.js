export const PLAYER_IDS = ['P1', 'P2', 'P3', 'P4'];

export const createEmptyDebts = (playerId, playerIds = PLAYER_IDS) => (
  playerIds.reduce((debts, opponentId) => (
    opponentId === playerId ? debts : { ...debts, [opponentId]: 0 }
  ), {})
);

export const INITIAL_PLAYERS = PLAYER_IDS.map((id, index) => ({
  id,
  name: `Player ${index + 1}`,
  total: 0,
  debts: createEmptyDebts(id),
}));

export const createDefaultGameState = (overrides = {}) => {
  const sourcePlayers = overrides.players || INITIAL_PLAYERS;
  const playerIds = sourcePlayers.map((player) => player.id);
  const players = sourcePlayers.map((player) => {
    const { debt, debts: _debts, ...rest } = player;

    return {
      ...rest,
      total: Number(player.total || 0),
      debts: playerIds.reduce((debts, opponentId) => (
        opponentId === player.id
          ? debts
          : { ...debts, [opponentId]: Number(player.debts?.[opponentId] || 0) }
      ), {}),
    };
  });

  return {
    name: overrides.name || 'Mahjong game',
    players,
    lastWinner: overrides.lastWinner ?? null,
    history: overrides.history || [],
  };
};
