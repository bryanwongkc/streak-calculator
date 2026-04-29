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
});

const getPlayerDelta = (entry, playerId) => {
  if (entry.deltasByPlayer?.[playerId]) {
    return Number(entry.deltasByPlayer[playerId].total || 0);
  }

  // Older saved history only has score snapshots. Fall back to totals visible in
  // adjacent snapshots so old data keeps rendering without requiring migration.
  const afterScores = entry.afterScores || entry.scores || [];
  const beforeScores = entry.beforeScores || [];
  const before = beforeScores.find((score) => score.id === playerId);
  const after = afterScores.find((score) => score.id === playerId);
  if (!after) return 0;
  if (!before) return 0;
  return Number(after.total || 0) - Number(before.total || 0);
};

export const deriveGameStats = (players = [], history = []) => {
  const statsByPlayer = players.reduce((stats, player) => ({
    ...stats,
    [player.id]: zeroStats(player),
  }), {});

  history.slice().reverse().forEach((entry) => {
    const loserIds = entry.loserIds || Object.keys(entry.roundScores || {}).filter((id) => Number(entry.roundScores[id]) > 0);

    players.forEach((player) => {
      const stat = statsByPlayer[player.id];
      const delta = getPlayerDelta(entry, player.id);
      const participated = entry.winner === player.id || loserIds.includes(player.id) || delta !== 0;

      if (!participated) return;

      stat.roundsPlayed += 1;

      if (entry.winner === player.id) {
        stat.wins += 1;
        stat.winValue += Math.max(delta, 0);
      }

      if (loserIds.includes(player.id)) {
        stat.losses += 1;
        stat.lossValue += Math.min(delta, 0);
      }

      if (!stat.biggestWin || delta > stat.biggestWin.value) {
        stat.biggestWin = delta > 0 ? { value: delta, round: entry.round } : stat.biggestWin;
      }

      if (!stat.biggestLoss || delta < stat.biggestLoss.value) {
        stat.biggestLoss = delta < 0 ? { value: delta, round: entry.round } : stat.biggestLoss;
      }
    });
  });

  const playerStats = Object.values(statsByPlayer).map((stat) => ({
    ...stat,
    averageWin: stat.wins ? stat.winValue / stat.wins : 0,
    averageLoss: stat.losses ? stat.lossValue / stat.losses : 0,
  }));

  return {
    playerStats,
    rankings: playerStats.slice().sort((a, b) => b.total - a.total),
    rounds: history.filter((entry) => entry.winner !== 'SYSTEM').length,
    adjustments: history.filter((entry) => entry.winner === 'SYSTEM').length,
  };
};
