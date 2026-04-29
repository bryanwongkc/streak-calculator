const zeroStats = (player) => ({
  id: player.id,
  name: player.name,
  roundsPlayed: 0,
  wins: 0,
  losses: 0,
  total: player.total || 0,
  debt: player.debt || 0,
  winValue: 0,
  lossValue: 0,
  biggestWin: null,
  biggestLoss: null,
  scoreFor: 0,
  scoreAgainst: 0,
});

const getScoreSnapshot = (entry) => entry.afterScores || entry.scores || [];

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

export const deriveGameStats = (players = [], history = []) => {
  const statsByPlayer = players.reduce((stats, player) => ({
    ...stats,
    [player.id]: zeroStats(player),
  }), {});

  let previousScores = [];
  history.slice().sort((a, b) => (a.round || 0) - (b.round || 0)).forEach((entry) => {
    const loserIds = entry.loserIds || Object.keys(entry.roundScores || {}).filter((id) => Number(entry.roundScores[id]) > 0);

    players.forEach((player) => {
      const stat = statsByPlayer[player.id];
      const delta = getPlayerDelta(entry, player.id, previousScores);
      const impact = getRoundImpact(entry, player.id, delta);
      const participated = entry.winner === player.id || loserIds.includes(player.id) || delta !== 0;

      if (!participated) return;

      stat.roundsPlayed += 1;

      if (entry.winner === player.id) {
        stat.wins += 1;
        stat.winValue += Math.max(impact, 0);
        stat.scoreFor += Math.max(impact, 0);
      }

      if (loserIds.includes(player.id)) {
        stat.losses += 1;
        stat.lossValue += Math.min(impact, 0);
        stat.scoreAgainst += Math.abs(Math.min(impact, 0));
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
    rounds: history.filter((entry) => entry.winner !== 'SYSTEM').length,
    adjustments: history.filter((entry) => entry.winner === 'SYSTEM').length,
  };
};
