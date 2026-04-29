import React from 'react';
import { Card } from '../../components/common/Card';
import { formatSignedNumber } from '../../utils/formatting';

export const PlayerStatsCards = ({ playerStats }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    {playerStats.map((stat) => (
      <Card key={stat.id} className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#111827]">{stat.name}</h3>
            <p className="text-xs uppercase tracking-[0.16em] text-[#6b7280]">{stat.roundsPlayed} rounds</p>
          </div>
          <p className={`font-mono text-xl font-bold ${stat.total >= 0 ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
            {formatSignedNumber(stat.total)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-[#f8fafc] p-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Wins</p>
            <p className="font-mono font-bold">{stat.wins}</p>
          </div>
          <div className="rounded-lg bg-[#f8fafc] p-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Losses</p>
            <p className="font-mono font-bold">{stat.losses}</p>
          </div>
          <div className="rounded-lg bg-[#f8fafc] p-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Avg win</p>
            <p className="font-mono font-bold">{formatSignedNumber(stat.averageWin)}</p>
          </div>
          <div className="rounded-lg bg-[#f8fafc] p-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Avg loss</p>
            <p className="font-mono font-bold text-[#6b7280]">{formatSignedNumber(stat.averageLoss)}</p>
          </div>
        </div>
      </Card>
    ))}
  </div>
);
