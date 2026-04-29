import { createId } from '../../utils/ids';
import { INITIAL_PLAYERS } from './gameTypes';

const clonePlayers = (players) => JSON.parse(JSON.stringify(players));

const getPlayerName = (players, id) => (
  players.find((player) => player.id === id)?.name || id
);

const getDeltasByPlayer = (beforeScores, afterScores) => (
  afterScores.reduce((deltas, player) => {
    const before = beforeScores.find((item) => item.id === player.id) || {};
    return {
      ...deltas,
      [player.id]: {
        total: (player.total || 0) - (before.total || 0),
        debt: (player.debt || 0) - (before.debt || 0),
      },
    };
  }, {})
);

export const getLastWinnerFromHistory = (entries = []) => (
  entries.find((entry) => entry.winner !== 'SYSTEM')?.winner || null
);

export const processRound = ({
  players,
  lastWinner,
  history,
  currentWinner,
  roundScores,
}) => {
  if (!currentWinner) return null;

  const beforeScores = clonePlayers(players);
  let nextPlayersState = clonePlayers(players);
  let details = '';
  let type = '';

  const loserIds = Object.keys(roundScores)
    .filter((id) => id !== currentWinner && Number(roundScores[id]) > 0);

  const winner = players.find((player) => player.id === currentWinner);
  const isSlayingKing = Boolean(
    lastWinner &&
    currentWinner !== lastWinner &&
    loserIds.includes(lastWinner) &&
    winner?.debt > 0
  );

  if (currentWinner === lastWinner) {
    type = 'Streak';
    details = `${getPlayerName(players, currentWinner)} repeats the win.`;
    nextPlayersState = nextPlayersState.map((player) => {
      if (loserIds.includes(player.id)) {
        return {
          ...player,
          debt: Math.ceil((player.debt * 1.5) + Number(roundScores[player.id] || 0)),
        };
      }
      return player;
    });
  } else if (isSlayingKing) {
    type = 'Slaying king';
    details = `${getPlayerName(players, currentWinner)} beats ${getPlayerName(players, lastWinner)} with half settlement.`;

    let totalSettlement = 0;
    nextPlayersState = nextPlayersState.map((player) => {
      if (player.id === currentWinner) {
        const payment = Math.ceil(player.debt * 0.5);
        totalSettlement += payment;
        return { ...player, total: player.total - payment, debt: 0 };
      }

      if (player.id !== lastWinner) {
        const payment = player.debt;
        totalSettlement += payment;
        return { ...player, total: player.total - player.debt, debt: 0 };
      }

      return player;
    });

    nextPlayersState = nextPlayersState.map((player) => (
      player.id === lastWinner ? { ...player, total: player.total + totalSettlement } : player
    ));

    nextPlayersState = nextPlayersState.map((player) => (
      loserIds.includes(player.id)
        ? { ...player, debt: Number(roundScores[player.id] || 0) }
        : player
    ));
  } else {
    type = lastWinner ? 'Fresh settlement' : 'Streak';
    details = lastWinner
      ? `Full settlement to ${getPlayerName(players, lastWinner)}.`
      : 'Opening winning hand.';

    let totalSettlement = 0;

    if (lastWinner) {
      nextPlayersState = nextPlayersState.map((player) => {
        if (player.id !== lastWinner) {
          totalSettlement += player.debt;
          return { ...player, total: player.total - player.debt, debt: 0 };
        }
        return player;
      });

      nextPlayersState = nextPlayersState.map((player) => (
        player.id === lastWinner ? { ...player, total: player.total + totalSettlement } : player
      ));
    }

    nextPlayersState = nextPlayersState.map((player) => (
      loserIds.includes(player.id)
        ? { ...player, debt: Number(roundScores[player.id] || 0) }
        : player
    ));
  }

  const afterScores = clonePlayers(nextPlayersState);

  return {
    players: afterScores,
    lastWinner: currentWinner,
    history: [{
      id: createId('round'),
      round: history.length + 1,
      winner: currentWinner,
      loserIds,
      type,
      details,
      roundScores: { ...roundScores },
      beforeScores,
      afterScores,
      scores: afterScores,
      deltasByPlayer: getDeltasByPlayer(beforeScores, afterScores),
      createdAt: new Date().toISOString(),
    }, ...history],
  };
};

export const applyManualAdjustment = ({ players, history, values, remarks }) => {
  const beforeScores = clonePlayers(players);
  const nextPlayersState = players.map((player) => ({
    ...player,
    total: player.total + Number(values[player.id] || 0),
  }));
  const afterScores = clonePlayers(nextPlayersState);

  return {
    players: afterScores,
    history: [{
      id: createId('adjustment'),
      round: history.length + 1,
      winner: 'SYSTEM',
      loserIds: [],
      type: 'Adjustment',
      details: remarks || 'Manual adjustment to banked totals.',
      beforeScores,
      afterScores,
      scores: afterScores,
      deltasByPlayer: getDeltasByPlayer(beforeScores, afterScores),
      createdAt: new Date().toISOString(),
    }, ...history],
  };
};

export const resetGame = () => ({
  players: clonePlayers(INITIAL_PLAYERS),
  lastWinner: null,
  history: [],
});

export const resetGameKeepNames = (players) => ({
  players: players.map((player, index) => ({
    ...INITIAL_PLAYERS[index],
    name: player.name,
  })),
  lastWinner: null,
  history: [],
});

export const undoLastEntry = ({ history, fallbackPlayers }) => {
  if (!history.length) return null;

  const [, ...remainingHistory] = history;
  const restoredPlayers = remainingHistory[0]
    ? clonePlayers(remainingHistory[0].scores || remainingHistory[0].afterScores)
    : fallbackPlayers.map((player) => ({ ...player, total: 0, debt: 0 }));

  return {
    players: restoredPlayers,
    history: remainingHistory,
    lastWinner: getLastWinnerFromHistory(remainingHistory),
  };
};
