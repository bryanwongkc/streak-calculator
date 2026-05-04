import { createId } from '../../utils/ids.js';
import { createEmptyDebts, INITIAL_PLAYERS } from './gameTypes.js';

export const clonePlayers = (players) => JSON.parse(JSON.stringify(players));

export const getPlayerName = (players, id) => (
  players.find((player) => player.id === id)?.name || id
);

export const normalizePlayerDebts = (players = INITIAL_PLAYERS) => {
  const sourcePlayers = players?.length ? players : INITIAL_PLAYERS;
  const playerIds = sourcePlayers.map((player) => player.id);

  return sourcePlayers.map((player) => {
    const debts = playerIds.reduce((normalizedDebts, opponentId) => {
      if (opponentId === player.id) return normalizedDebts;

      return {
        ...normalizedDebts,
        [opponentId]: Math.max(0, Number(player.debts?.[opponentId] || 0)),
      };
    }, {});
    const { debt, debts: _debts, ...rest } = player;

    return {
      ...rest,
      total: Number(player.total || 0),
      debts,
    };
  });
};

export const getActiveDebtPockets = (players = []) => (
  normalizePlayerDebts(players).flatMap((player) => (
    Object.entries(player.debts || {})
      .filter(([, amount]) => Number(amount) !== 0)
      .map(([ownerId, amount]) => ({
        debtorId: player.id,
        ownerId,
        amount: Number(amount),
      }))
  ))
);

const getDebtTotal = (player) => (
  Object.values(player.debts || {}).reduce((total, amount) => total + Number(amount || 0), 0)
);

const getDeltasByPlayer = (beforeScores, afterScores) => (
  afterScores.reduce((deltas, player) => {
    const before = beforeScores.find((item) => item.id === player.id) || {};

    return {
      ...deltas,
      [player.id]: {
        total: (player.total || 0) - (before.total || 0),
        debt: getDebtTotal(player) - getDebtTotal(before),
        debts: player.debts || {},
      },
    };
  }, {})
);

const getPlayer = (players, id) => players.find((player) => player.id === id);

const setDebtPocket = (players, debtorId, ownerId, amount) => {
  if (!debtorId || !ownerId || debtorId === ownerId) return;
  const debtor = getPlayer(players, debtorId);
  if (!debtor) return;
  debtor.debts = {
    ...createEmptyDebts(debtorId, players.map((player) => player.id)),
    ...(debtor.debts || {}),
    [ownerId]: Math.max(0, Number(amount || 0)),
  };
  delete debtor.debts[debtorId];
};

const adjustTotal = (players, playerId, delta) => {
  const player = getPlayer(players, playerId);
  if (player) player.total = Number(player.total || 0) + Number(delta || 0);
};

const pairKey = (loserId, winnerId) => `${loserId}->${winnerId}`;

const normalizeWinEvents = ({ players, winEvents, currentWinner, roundScores }) => {
  const playerIds = new Set(players.map((player) => player.id));
  const sourceEvents = Array.isArray(winEvents)
    ? winEvents
    : Object.entries(roundScores || {})
      .map(([loserId, amount]) => ({
        winnerId: currentWinner,
        loserId,
        amount,
      }));
  const seenPairs = new Set();
  const normalizedEvents = [];
  let hasDuplicatePair = false;

  sourceEvents.forEach((event) => {
    const winnerId = event.winnerId;
    const loserId = event.loserId;
    const amount = Number(event.amount || 0);

    if (
      !winnerId ||
      !loserId ||
      winnerId === loserId ||
      amount <= 0 ||
      !playerIds.has(winnerId) ||
      !playerIds.has(loserId)
    ) {
      return;
    }

    const key = pairKey(loserId, winnerId);
    if (seenPairs.has(key)) {
      hasDuplicatePair = true;
      return;
    }

    seenPairs.add(key);
    normalizedEvents.push({
      winnerId,
      loserId,
      amount,
    });
  });

  return { events: normalizedEvents, hasDuplicatePair };
};

export const getLastWinnerFromHistory = () => null;

export const processRound = ({
  players,
  history = [],
  winEvents,
  currentWinner,
  roundScores,
}) => {
  const beforeScores = normalizePlayerDebts(players);
  const { events: normalizedWinEvents, hasDuplicatePair } = normalizeWinEvents({
    players: beforeScores,
    winEvents,
    currentWinner,
    roundScores,
  });

  if (hasDuplicatePair || !normalizedWinEvents.length) return null;

  const nextPlayersState = clonePlayers(beforeScores);
  const winnersSet = new Set(normalizedWinEvents.map((event) => event.winnerId));
  const eventByPair = normalizedWinEvents.reduce((events, event) => ({
    ...events,
    [pairKey(event.loserId, event.winnerId)]: event.amount,
  }), {});
  const sameDirectionHandled = new Set();

  // Rule order matters: settle or preserve existing before-state pockets first,
  // then record new round events that were not consumed by same-owner wins.
  getActiveDebtPockets(beforeScores).forEach(({ debtorId, ownerId, amount }) => {
    const sameDirectionKey = pairKey(debtorId, ownerId);
    const reverseKey = pairKey(ownerId, debtorId);

    if (eventByPair[sameDirectionKey]) {
      setDebtPocket(
        nextPlayersState,
        debtorId,
        ownerId,
        Math.ceil((amount * 1.5) + eventByPair[sameDirectionKey])
      );
      sameDirectionHandled.add(sameDirectionKey);
      return;
    }

    if (eventByPair[reverseKey]) {
      const settlement = Math.ceil(amount * 0.5);
      adjustTotal(nextPlayersState, debtorId, -settlement);
      adjustTotal(nextPlayersState, ownerId, settlement);
      setDebtPocket(nextPlayersState, debtorId, ownerId, 0);
      return;
    }

    if (!winnersSet.has(ownerId)) {
      adjustTotal(nextPlayersState, debtorId, -amount);
      adjustTotal(nextPlayersState, ownerId, amount);
      setDebtPocket(nextPlayersState, debtorId, ownerId, 0);
    }
  });

  normalizedWinEvents.forEach((event) => {
    const key = pairKey(event.loserId, event.winnerId);
    if (sameDirectionHandled.has(key)) return;

    setDebtPocket(nextPlayersState, event.winnerId, event.loserId, 0);
    setDebtPocket(nextPlayersState, event.loserId, event.winnerId, event.amount);
  });

  const afterScores = normalizePlayerDebts(nextPlayersState);
  const activeDebtPocketsAfter = getActiveDebtPockets(afterScores);
  const winnerIds = [...new Set(normalizedWinEvents.map((event) => event.winnerId))];
  const loserIds = [...new Set(normalizedWinEvents.map((event) => event.loserId))];
  const recordedRoundScores = normalizedWinEvents.reduce((scores, event) => ({
    ...scores,
    [event.loserId]: Number(scores[event.loserId] || 0) + event.amount,
  }), {});

  return {
    players: afterScores,
    lastWinner: null,
    history: [{
      id: createId('round'),
      round: history.length + 1,
      type: 'Round',
      details: 'Game result',
      winEvents: normalizedWinEvents,
      activeDebtPocketsAfter,
      winner: winnerIds[0] || null,
      winnerIds,
      loserIds,
      roundScores: recordedRoundScores,
      beforeScores,
      afterScores,
      scores: afterScores,
      deltasByPlayer: getDeltasByPlayer(beforeScores, afterScores),
      createdAt: new Date().toISOString(),
    }, ...history],
  };
};

export const applyManualAdjustment = ({ players, history = [], values, remarks }) => {
  const beforeScores = normalizePlayerDebts(players);
  const nextPlayersState = beforeScores.map((player) => ({
    ...player,
    total: player.total + Number(values[player.id] || 0),
  }));
  const afterScores = normalizePlayerDebts(nextPlayersState);

  return {
    players: afterScores,
    history: [{
      id: createId('adjustment'),
      round: history.length + 1,
      winner: 'SYSTEM',
      loserIds: [],
      type: 'Adjustment',
      details: remarks || 'Manual adjustment to banked totals.',
      activeDebtPocketsAfter: getActiveDebtPockets(afterScores),
      beforeScores,
      afterScores,
      scores: afterScores,
      deltasByPlayer: getDeltasByPlayer(beforeScores, afterScores),
      createdAt: new Date().toISOString(),
    }, ...history],
  };
};

export const resetGame = () => ({
  players: normalizePlayerDebts(INITIAL_PLAYERS),
  lastWinner: null,
  history: [],
});

export const resetGameKeepNames = (players) => ({
  players: normalizePlayerDebts(players).map((player) => ({
    ...player,
    total: 0,
    debts: createEmptyDebts(player.id, players.map((item) => item.id)),
  })),
  lastWinner: null,
  history: [],
});

export const undoLastEntry = ({ history, fallbackPlayers }) => {
  if (!history.length) return null;

  const [, ...remainingHistory] = history;
  const restoredPlayers = remainingHistory[0]
    ? normalizePlayerDebts(remainingHistory[0].scores || remainingHistory[0].afterScores)
    : normalizePlayerDebts(fallbackPlayers).map((player) => ({
      ...player,
      total: 0,
      debts: createEmptyDebts(player.id, fallbackPlayers.map((item) => item.id)),
    }));

  return {
    players: restoredPlayers,
    history: remainingHistory,
    lastWinner: null,
  };
};
