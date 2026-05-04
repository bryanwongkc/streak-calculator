const zeroStats = (player) => ({
  id: player.id,
  name: player.name,
  roundsPlayed: 0,
  wins: 0,
  losses: 0,
  total: player.total || 0,
  winValue: 0,
  lossValue: 0,
  biggestWin: null,
  biggestLoss: null,
  scoreFor: 0,
  scoreAgainst: 0,
});

const getScoreSnapshot = (entry) => entry.afterScores || entry.scores || [];

const snapshotToTotals = (players, snapshot = []) => (
  players.reduce((totals, player) => {
    const score = snapshot.find((item) => item.id === player.id);
    return {
      ...totals,
      [player.id]: Number(score?.total || 0),
    };
  }, {})
);

export const deriveScoreTimeline = (players = [], history = []) => {
  const orderedHistory = history
    .slice()
    .sort((a, b) => (a.round || 0) - (b.round || 0));

  if (!orderedHistory.length) {
    return [{
      round: 0,
      label: 'Start',
      totalsByPlayer: snapshotToTotals(players, []),
    }];
  }

  const firstBeforeScores = orderedHistory[0]?.beforeScores || [];
  const points = [{
    round: 0,
    label: 'Start',
    totalsByPlayer: snapshotToTotals(players, firstBeforeScores),
  }];

  orderedHistory.forEach((entry) => {
    const snapshot = getScoreSnapshot(entry);
    points.push({
      round: entry.round || points.length,
      label: `R${entry.round || points.length}`,
      totalsByPlayer: snapshotToTotals(players, snapshot),
    });
  });

  return points;
};

const getPlayerDelta = (entry, playerId, previousScores = []) => {
  if (entry.deltasByPlayer?.[playerId]) {
    return Number(entry.deltasByPlayer[playerId].total || 0);
  }

  // Older saved history only has score snapshots. Fall back to totals visible in
  // adjacent snapshots so old data keeps rendering without requiring migration.
  const afterScores = getScoreSnapshot(entry);
  const beforeScores = entry.beforeScores || [];
  const before = beforeScores.find((score) => score.id === playerId);
  const previous = previousScores.find((score) => score.id === playerId);
  const after = afterScores.find((score) => score.id === playerId);
  if (!after) return 0;
  if (before) return Number(after.total || 0) - Number(before.total || 0);
  if (previous) return Number(after.total || 0) - Number(previous.total || 0);
  return Number(after.total || 0);
};

const getRoundImpact = (entry, playerId, delta) => {
  const loserIds = entry.loserIds || Object.keys(entry.roundScores || {}).filter((id) => Number(entry.roundScores[id]) > 0);
  const roundScores = entry.roundScores || {};

  if (entry.winner === playerId) {
    const liveScore = loserIds.reduce((total, id) => total + Number(roundScores[id] || 0), 0);
    return Math.max(delta, liveScore, 0);
  }

  if (loserIds.includes(playerId)) {
    return Math.min(delta, -Math.abs(Number(roundScores[playerId] || 0)));
  }

  return delta;
};

const getWinEvents = (entry) => {
  if (entry.winEvents?.length) return entry.winEvents;
  if (!entry.winner || entry.winner === 'SYSTEM') return [];

  const loserIds = entry.loserIds || Object.keys(entry.roundScores || {}).filter((id) => Number(entry.roundScores[id]) > 0);
  return loserIds.map((loserId) => ({
    winnerId: entry.winner,
    loserId,
    amount: Number(entry.roundScores?.[loserId] || 0),
  })).filter((event) => event.amount > 0);
};

export const deriveGameStats = (players = [], history = []) => {
  const statsByPlayer = players.reduce((stats, player) => ({
    ...stats,
    [player.id]: zeroStats(player),
  }), {});

  let previousScores = [];
  history.slice().sort((a, b) => (a.round || 0) - (b.round || 0)).forEach((entry) => {
    const winEvents = getWinEvents(entry);
    const loserIds = [...new Set(winEvents.map((event) => event.loserId))];

    players.forEach((player) => {
      const stat = statsByPlayer[player.id];
      const delta = getPlayerDelta(entry, player.id, previousScores);
      const winAmount = winEvents
        .filter((event) => event.winnerId === player.id)
        .reduce((total, event) => total + Number(event.amount || 0), 0);
      const lossAmount = winEvents
        .filter((event) => event.loserId === player.id)
        .reduce((total, event) => total + Number(event.amount || 0), 0);
      const eventImpact = winAmount - lossAmount;
      const legacyImpact = getRoundImpact(entry, player.id, delta);
      const impact = winEvents.length ? (delta || eventImpact) : legacyImpact;
      const participated = winAmount > 0 || lossAmount > 0 || delta !== 0;

      if (!participated) return;

      stat.roundsPlayed += 1;

      if (winAmount > 0) {
        stat.wins += 1;
        stat.winValue += winAmount;
        stat.scoreFor += winAmount;
      }

      if (loserIds.includes(player.id)) {
        stat.losses += 1;
        stat.lossValue -= lossAmount;
        stat.scoreAgainst += lossAmount;
      }

      if (!stat.biggestWin || impact > stat.biggestWin.value) {
        stat.biggestWin = impact > 0 ? { value: impact, round: entry.round } : stat.biggestWin;
      }

      if (!stat.biggestLoss || impact < stat.biggestLoss.value) {
        stat.biggestLoss = impact < 0 ? { value: impact, round: entry.round } : stat.biggestLoss;
      }
    });

    const snapshot = getScoreSnapshot(entry);
    if (snapshot.length) previousScores = snapshot;
  });

  const playerStats = Object.values(statsByPlayer).map((stat) => ({
    ...stat,
    averageWin: stat.wins ? stat.winValue / stat.wins : 0,
    averageLoss: stat.losses ? stat.lossValue / stat.losses : 0,
    winRate: stat.wins + stat.losses ? stat.wins / (stat.wins + stat.losses) : 0,
  }));

  return {
    playerStats,
    rankings: playerStats.slice().sort((a, b) => b.total - a.total),
    scoreTimeline: deriveScoreTimeline(players, history),
    rounds: history.filter((entry) => entry.winner !== 'SYSTEM').length,
    adjustments: history.filter((entry) => entry.winner === 'SYSTEM').length,
  };
};
