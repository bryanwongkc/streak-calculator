import React from 'react';
import { Activity, Trophy, Wrench } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { useGameStats } from '../../hooks/useGameStats';
import { PlayerStatsCards } from './PlayerStatsCards';
import { ScoreLineChart } from './ScoreLineChart';
import { StatsTable } from './StatsTable';

export const DashboardTab = ({ game }) => {
  const stats = useGameStats(game);

  if (!game.history?.length) {
    return (
      <EmptyState
        title="No dashboard data yet."
        description="Stats appear after round history or manual adjustments are recorded."
      />
    );
  }

  return (
    <div className="space-y-2.5 md:space-y-4">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card className="p-2.5 md:p-4">
          <Activity size={16} className="mb-1 text-[#6b7280]" />
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Rounds</p>
          <p className="font-mono text-lg font-bold text-[#111827]">{stats.rounds}</p>
        </Card>
        <Card className="p-2.5 md:p-4">
          <Wrench size={16} className="mb-1 text-[#6b7280]" />
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Adjustments</p>
          <p className="font-mono text-lg font-bold text-[#111827]">{stats.adjustments}</p>
        </Card>
        <Card className="p-2.5 md:p-4">
          <Trophy size={16} className="mb-1 text-[#6b7280]" />
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Leader</p>
          <p className="truncate text-sm font-bold text-[#111827] md:text-base">{stats.rankings[0]?.name || '-'}</p>
        </Card>
      </div>

      <StatsTable rankings={stats.rankings} />
      <ScoreLineChart players={game.players || []} timeline={stats.scoreTimeline} />
      <details className="rounded-xl border border-[#d1d5db]/80 bg-white/80 p-2.5 md:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-[#374151]">More stats</summary>
        <div className="mt-3">
          <PlayerStatsCards playerStats={stats.playerStats} />
        </div>
      </details>
      <div className="hidden md:block">
      <PlayerStatsCards playerStats={stats.playerStats} />
      </div>
    </div>
  );
};
